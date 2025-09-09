import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Knowledge, KnowledgeSchema } from 'src/schemas/knowledge';
import { OpenAIService } from './openai.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Knowledge.name, schema: KnowledgeSchema },
    ]),
  ],
  providers: [OpenAIService],
  exports: [OpenAIService],
})
export class OpenAIModule {}
