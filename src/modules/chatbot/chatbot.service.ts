import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { ChatCompletionMessageParam } from 'openai/resources/index';
import { LoggerService } from 'src/common/logger';
import { Chatbot } from 'src/schemas/chatbot';
import { Knowledge } from 'src/schemas/knowledge';
import { Sender } from 'src/schemas/message';
import { MongoId } from '../../interfaces/mongoose.interface';
import { Account } from '../../schemas/account';
import { ApiKeyService } from '../apikey/apikey.service';
import { OpenAIService } from '../openai/openai.service';
import { DimensionSize, PineconeService } from '../pinecone/pinecone.service';
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
    // Lấy thông tin chatbot
    const chatbot = await this.findChatbot(chatbotId, accountId);
    if (!!chatbot) {
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
  }

  /**
   * Train dữ liệu cho chatbot (lưu vào Mongo + Pinecone)
   */
  async training(accountId: MongoId, chatbotId: string, texts: string[]) {
    console.log(texts);
    const chatbot = await this.chatbotModel.findById(chatbotId);
    console.log(accountId, chatbot.account);
    if (!chatbot || !chatbot.account.equals(accountId)) {
      throw new NotFoundException('Chatbot not found');
    }

    const index = this.pineconeService.connectToIndex(chatbot.indexName);

    // Duyệt qua từng text để training
    const results = [];
    for (const text of texts) {
      // 1. Tạo embedding
      const vector = await this.openaiService.getEmbedding(text);

      // 2. Tạo id duy nhất cho Pinecone vector
      const pineconeId = nanoid(16);

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
          metadata: { text },
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

  async findChatbot(chatbotId: MongoId, accountId: MongoId) {
    const chatbot = await this.chatbotModel.findOne({
      id: chatbotId,
      account: accountId,
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
    // Tạo embedding cho message
    const queryEmbedding = await this.openaiService.getEmbedding(message);

    // Query Pinecone để lấy top context
    const index = this.pineconeService.connectToIndex(chatbot.indexName);
    const queryResult = await index.query({
      topK: 5,
      vector: queryEmbedding,
      includeMetadata: true,
    });

    const matches = queryResult.matches || [];
    const context = matches.map((m) => m.metadata?.text).join('\n');
    const persona = `
    Bạn là ${chatbot.ownerName || 'chủ nhân của chatbot'}, 
    hiện tại công việc là ${chatbot.role}.
    Khi trả lời, bạn phải nhập vai chính chủ, 
    không được nói mình là chatbot hay trợ lý ảo.
    `;

    const systemPrompt = `
    ${persona}

    Dữ liệu liên quan từ Pinecone:
    ${context || '[Không có dữ liệu phù hợp]'}

    Nguyên tắc:
    - Trả lời tự nhiên như người thật đang trò chuyện.
    - Nếu không có thông tin trong dữ liệu, có thể trả lời khéo léo hoặc nói "Tôi chưa có thông tin đó".
    - Trả lời bằng ngôn ngữ mà người dùng hỏi.
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
  async configure(
    account: Account,
    dto: ConfigureChatbotDto,
  ): Promise<Chatbot> {
    const { role, metadata, description, ownerName } = dto;

    // Create Pinecone index
    const indexName = await this.pineconeService.createIndex(
      role,
      DimensionSize.SMALL,
    );

    return this.chatbotModel.create({
      account: account.id,
      role,
      indexName,
      description,
      metadata,
      ownerName,
    });
  }

  /**
   * Get all Chatbots by account
   * @param account User's account
   * @returns User's Chatbots
   */
  async listByAccount(account: Account) {
    return this.chatbotModel.find({ account: account.id });
  }
}
