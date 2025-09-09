import { Injectable } from '@nestjs/common';
import { Index, Pinecone } from '@pinecone-database/pinecone';
import { customAlphabet } from 'nanoid';
import slugify from 'slugify';
import { LoggerService } from 'src/common/logger';
import enviroment from 'src/config/enviroment';
import { ChatbotRole } from 'src/schemas/chatbot';

export enum DimensionSize {
  SMALL = 1536,
  LARGE = 3072,
}

@Injectable()
export class PineconeService {
  private client: Pinecone;
  private nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

  constructor(private readonly logger: LoggerService) {
    this.client = new Pinecone({
      apiKey: enviroment().pinecone.apiKey,
    });
  }

  /**
   * Tạo index mới nếu chưa tồn tại
   */
  async createIndex(role: ChatbotRole, size: DimensionSize) {
    const indexName = this.generateIndexName(role);
    this.logger.log(`Đang tạo index "${indexName}"...`, PineconeService.name);
    await this.client.createIndex({
      name: indexName,
      vectorType: 'dense',
      dimension: size,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
      deletionProtection: 'disabled',
      tags: { environment: 'development' },
    });
    this.logger.log(`Index "${indexName}" đã được tạo`, PineconeService.name);
    return indexName;
  }

  /**
   * Kết nối tới index đã có
   */
  connectToIndex(indexName: string): Index | null {
    const index = this.client.Index(indexName);
    this.logger.log(
      `Đã kết nối tới index "${indexName}"`,
      PineconeService.name,
    );
    return index || null;
  }

  async upsert(
    indexName: string,
    data: Array<{ id: string; values: number[]; metadata?: any }>,
  ) {
    const index = this.connectToIndex(indexName);
    // tuỳ SDK version có thể khác; cấu trúc phổ biến:
    await index.upsert(data);
    this.logger.log(
      `Upserted ${data.length} vector(s) into ${indexName}`,
      PineconeService.name,
    );
  }

  generateIndexName(name: string): string {
    const base = slugify(name, {
      lower: true,
      strict: true,
    });

    const id = this.nanoid();
    const indexName = `${base}-${id}`.slice(0, 63);

    return indexName;
  }
}
