import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatCompletionMessageParam } from 'openai/resources/index';
import { LoggerService } from 'src/common/logger';
import enviroment from 'src/config/enviroment';
import { Chatbot } from 'src/schemas/chatbot';
import { Knowledge } from 'src/schemas/knowledge';
import { Sender } from 'src/schemas/message';
import { uid } from 'uid';
import { MongoId } from '../../interfaces/mongoose.interface';
import { Account } from '../../schemas/account';
import { ApiKeyService } from '../apikey/apikey.service';
import { OpenAIService } from '../openai/openai.service';
import { PineconeService } from '../pinecone/pinecone.service';
import { SessionService } from '../session/session.service';
import { ConfigureChatbotDto } from './dto/ConfigureChatbot.dto';

@Injectable()
export class ChatbotService {
  constructor(
    @InjectModel(Chatbot.name)
    private readonly chatbotModel: Model<Chatbot>,
    @InjectModel(Knowledge.name)
    private readonly knowledgeModel: Model<Knowledge>,
    private readonly pineconeService: PineconeService,
    private readonly openaiService: OpenAIService,
    private readonly logger: LoggerService,
    @Inject(forwardRef(() => ApiKeyService))
    private readonly apiKeyService: ApiKeyService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * User gửi câu hỏi -> Query Pinecone -> Lấy context -> Gửi vào OpenAI
   */
  async chat(
    accountId: MongoId,
    chatbotId: MongoId,
    message: string,
    sessionId?: MongoId,
  ) {
    try {
      // Lấy thông tin chatbot
      const chatbot = await this.findChatbot(chatbotId, accountId);
      if (!chatbot) {
        throw new NotFoundException('Chatbot not found');
      }

      const systemPrompt = await this.getSystemPrompt(chatbot, message);
      const history = sessionId
        ? await this.getCompletionMessages(new MongoId(sessionId))
        : [];

      // Gửi vào OpenAI
      const response = await this.openaiService.chat(
        systemPrompt,
        message,
        history,
      );

      return {
        answer: response,
        // sources: matches.map((m) => ({
        //   text: m.metadata?.text,
        //   score: m.score,
        // })),
      };
    } catch (error: any) {
      this.logger.error(error);
    }
  }

  /**
   * Train dữ liệu cho chatbot (lưu vào Mongo + Pinecone)
   */
  async training(accountId: any, chatbotId: string, texts: string[]) {
    const chatbot = await this.findChatbot(new MongoId(chatbotId), accountId);
    if (!chatbot) {
      throw new NotFoundException('Chatbot not found');
    }

    const index = this.pineconeService.index;

    // Duyệt qua từng text để training
    const results = [];
    for (const text of texts) {
      // 1. Tạo embedding
      const vector = await this.openaiService.getEmbedding(text);

      // 2. Tạo id duy nhất cho Pinecone vector
      const pineconeId = uid(16);

      // 3. Lưu knowledge vào MongoDB
      const knowledge = await this.knowledgeModel.create({
        chatbot: new MongoId(chatbot.id),
        text,
        pineconeId,
        vector,
      });

      // 4. Upsert vào Pinecone
      await index.upsert([
        {
          id: pineconeId,
          values: vector,
          metadata: { chatbotId: chatbotId, text },
        },
      ]);

      results.push(knowledge);
    }

    this.logger.log(
      `Training xong ${results.length} knowledge cho chatbot ${chatbot._id}`,
      ChatbotService.name,
    );
    return results;
  }

  async findChatbot(chatbotId: MongoId, accountId: any) {
    const chatbot = await this.chatbotModel.findOne({
      _id: chatbotId,
      account: new MongoId(accountId),
    });
    return chatbot;
  }

  async getCompletionMessages(sessionId: MongoId) {
    const sessionMessages = await this.sessionService.getMessages(sessionId);
    const history: ChatCompletionMessageParam[] = sessionMessages.map(
      (msg) => ({
        role: msg.sender === Sender.USER ? 'user' : 'assistant',
        content: msg.content,
      }),
    );
    return history;
  }

  async getSystemPrompt(chatbot: Chatbot, message: string) {
    // Detect language
    const lang = await this.openaiService.detectLanguage(message);
    // Tạo embedding cho message
    const queryEmbedding = await this.openaiService.getEmbedding(message);

    // Query Pinecone để lấy top context
    const index = this.pineconeService.index;
    const queryResult = await index.query({
      topK: 5,
      vector: queryEmbedding,
      includeMetadata: true,
      filter: { chatbotId: String(chatbot.id) },
    });

    const matches = queryResult.matches || [];
    const context = matches.map((m) => m.metadata?.text).join('\n');
    const persona =
      lang === 'Vietnamese'
        ? `Bạn là ${chatbot.ownerName || 'chủ nhân của chatbot'}, 
     hiện tại công việc là ${chatbot.role}.
     Khi trả lời, bạn phải nhập vai chính chủ, 
     không được nói mình là chatbot hay trợ lý ảo.`
        : `You are ${chatbot.ownerName || 'the chatbot owner'}, currently working as ${chatbot.role}.
     When replying, you must role-play as this person,
     never say you are a chatbot or virtual assistant.`;

    const systemPrompt = `
      ${persona}

      Related data from Pinecone:
      ${context || '[No relevant data found]'}

      Rules:
      - Answer naturally like a human is chatting.
      - If no information is available in the data, politely say you don't know.
      - Always reply in ${lang === 'Vietnamese' ? 'Vietnamese' : 'English'}.
    `;

    return systemPrompt;
  }

  /**
   * Create a new Chatbot
   * Includes: Pinecone, apiKey
   * @param account user's account
   * @param dto params
   * @returns Chatbot
   */
  async configure(account: Account, dto: ConfigureChatbotDto) {
    const { role, metadata, description, ownerName, type, name } = dto;

    // Create Pinecone index
    // const indexName = await this.pineconeService.createIndex(
    //   role,
    //   DimensionSize.SMALL,
    // );
    const indexName = enviroment().pinecone.indexName;
    const chatbot = await this.chatbotModel.create({
      name,
      account: account._id,
      role,
      type,
      indexName,
      description,
      metadata,
      ownerName,
    });

    const apiKey = await this.apiKeyService.generateApiKey(account, chatbot.id);

    return { chatbot, apiKey: apiKey.key };
  }

  /**
   * Get all Chatbots by account
   * @param account User's account
   * @returns User's Chatbots
   */
  async listByAccount(account: Account) {
    const chatbots = await this.chatbotModel.find({ account: account._id });
    const apiKeys = await this.apiKeyService.listByChatbotIds(
      chatbots.map((i) => i._id),
    );

    return chatbots.map((chatbot) => ({
      ...chatbot.toObject(),
      apiKey:
        apiKeys.find((i) => i.chatbot.equals(chatbot._id as MongoId))?.key ||
        null,
    }));
  }
}
