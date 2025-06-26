import { forwardRef, Module } from '@nestjs/common';
import { PineconeModule } from '../pinecone/pinecone.module';
import { OpenAIController } from './openai.controller';
import { OpenAIService } from './openai.service';

@Module({
  imports: [forwardRef(() => PineconeModule)],
  controllers: [OpenAIController],
  providers: [OpenAIService],
  exports: [OpenAIService],
})
export class OpenAIModule {}
