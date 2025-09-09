// openai.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index';
import { LoggerService } from 'src/common/logger';
import enviroment from 'src/config/enviroment';
import { Knowledge } from 'src/schemas/knowledge';

@Injectable()
export class OpenAIService {
  private readonly client: OpenAI;

  constructor(
    private readonly logger: LoggerService,
    @InjectModel(Knowledge.name)
    private readonly knowledgeModel: Model<Knowledge>,
  ) {
    this.client = new OpenAI({
      apiKey: enviroment().openai.apiKey,
    });
  }

  /**
   * Chat with OpenAI
   */
  async chat(
    prompt: string,
    userMessage: string,
    history: ChatCompletionMessageParam[],
  ): Promise<string> {
    this.logger.log('Sending chat request to OpenAI...', OpenAIService.name);

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        ...history,
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
    });

    const message = response.choices[0]?.message?.content || '';
    this.logger.log('Received response from OpenAI', OpenAIService.name);

    return message;
  }

  /**
   * Get embedding OpenAI
   */
  async getEmbedding(text: string): Promise<number[]> {
    this.logger.log('Create embedding for text', OpenAIService.name);
    const resp = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    const vector = resp.data[0].embedding;
    return vector;
  }
}
