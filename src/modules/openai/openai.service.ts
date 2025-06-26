import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import configuration from 'src/config/configuration';
import { v4 as uuidv4 } from 'uuid';
import { PineconeService } from '../pinecone/pinecone.service';
import { ChatWithContextDto } from './dto/ChatWithContext.dto';
import { GPTModel } from './interfaces/GPTModel';

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;

  constructor(
    @Inject(forwardRef(() => PineconeService))
    private readonly pineconeService: PineconeService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    const apiKey = configuration().openai.apiKey;
    this.openai = new OpenAI({ apiKey });
  }

  async getChatMessagesHistory(
    sessionId: string,
  ): Promise<ChatCompletionMessageParam[]> {
    const messages =
      await this.cacheManager.get<ChatCompletionMessageParam[]>(sessionId);
    if (!messages) {
      return [];
    }
    return messages;
  }

  async updateChatMessagesHistory(
    sessionId: string,
    newMessage: ChatCompletionMessageParam,
  ): Promise<void> {
    const messages =
      (await this.cacheManager.get<ChatCompletionMessageParam[]>(sessionId)) ||
      [];
    const updatedMessages = [
      ...messages,
      { role: newMessage.role, content: newMessage.content },
    ];
    await this.cacheManager.set(sessionId, updatedMessages, 60 * 1000);
  }

  async getEmbedding(input: string, dimensions = 1024): Promise<number[]> {
    const embeddings = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input,
      encoding_format: 'float',
      dimensions,
    });

    return embeddings.data[0].embedding;
  }

  async chat(dto: ChatWithContextDto): Promise<any> {
    const { sessionId, question, model = GPTModel.gpt_4o } = dto;
    const currentSessionId = sessionId ? sessionId : uuidv4();

    const previousMessages =
      await this.getChatMessagesHistory(currentSessionId);

    const context = await this.pineconeService.getContextByQuestion(
      question.trim(),
    );

    const contextBlock = context?.trim()
      ? `### Document:\n${context}`
      : `### No relevant document found. Please answer based on your general knowledge.`;

    const systemPrompt =
      previousMessages.length === 0
        ? 'You are an AI assistant. Provide clear and concise answers.'
        : 'You are an AI assistant. Answer the following question based on the previous conversation and the provided document if available.';

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `${systemPrompt}\n\n${contextBlock}`,
      },
      ...previousMessages,
      {
        role: 'user',
        content: question.trim(),
      },
    ];

    const res = await this.openai.chat.completions.create({
      model,
      messages,
    });
    const message = res.choices[0].message;

    await this.updateChatMessagesHistory(currentSessionId, message);

    return {
      sessionId: currentSessionId,
      message,
    };
  }

  async getDefinition(
    term: string,
    model: GPTModel = GPTModel.gpt_4o,
  ): Promise<string> {
    const prompt = `Please define the following term clearly and concisely in Vietnamese:\n\nWhat is "${term}"?\n\nThe answer should be approximately 3–5 sentences long.`;

    const res = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are an AI assistant specializing in defining technical terms.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return res.choices[0].message.content.trim();
  }
}
