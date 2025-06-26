import { Body, Controller, forwardRef, Inject, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OpenAIService } from '../openai/openai.service';
import { InsertVectorDto } from './dto/InsertVector.dto';
import { PineconeService } from './pinecone.service';

@Controller('pinecone')
export class PineconeController {
  constructor(
    private readonly pineconeService: PineconeService,
    @Inject(forwardRef(() => OpenAIService))
    private readonly openAIService: OpenAIService,
  ) {}

  @ApiTags('OpenAI')
  @ApiOperation({ summary: 'Insert a vector', description: 'Just one time' })
  @Post('vector/insert')
  async insert(@Body() body: InsertVectorDto) {
    const embedding = await this.openAIService.getEmbedding(body.text);
    await this.pineconeService.upsertVector(body.id, embedding, {
      text: body.text,
    });
    return { message: 'Vector inserted' };
  }

  @ApiTags('Pinecone')
  @ApiOperation({ summary: 'Create Pinecone index' })
  @Post('create-index')
  async createIndex() {
    return this.pineconeService.createIndex();
  }
}
