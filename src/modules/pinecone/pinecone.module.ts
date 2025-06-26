import { forwardRef, Module } from '@nestjs/common';
import { OpenAIModule } from '../openai/openai.module';
import { PineconeController } from './pinecone.controller';
import { PineconeService } from './pinecone.service';

@Module({
  imports: [forwardRef(() => OpenAIModule)],
  controllers: [PineconeController],
  exports: [PineconeService],
  providers: [PineconeService],
})
export class PineconeModule {}
