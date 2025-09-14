import { Injectable } from '@nestjs/common';
import { Index, Pinecone } from '@pinecone-database/pinecone';
import slugify from 'slugify';
import { LoggerService } from 'src/common/logger';
import enviroment from 'src/config/enviroment';
import { ChatbotType } from 'src/schemas/chatbot';

export enum DimensionSize {
  SMALL = 1536,
  LARGE = 3072,
}

@Injectable()
export class PineconeService {
  private client: Pinecone;
  public index: Index;

  constructor(private readonly logger: LoggerService) {
    this.client = new Pinecone({
      apiKey: enviroment().pinecone.apiKey,
    });
    this.index = this.client.Index(enviroment().pinecone.indexName);
  }

  /**
   * Tạo index mới nếu chưa tồn tại
   */
  async createIndex(type: ChatbotType, size: DimensionSize) {
    const indexName = this.generateIndexName(type);
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

  async upsert(
    indexName: string,
    data: Array<{ id: string; values: number[]; metadata?: any }>,
  ) {
    const index = this.index;
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

    const indexName = `${base}`.slice(0, 63);

    return indexName;
  }
}
