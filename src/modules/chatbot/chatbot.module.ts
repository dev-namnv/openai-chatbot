import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKey, ApiKeySchema } from 'src/schemas/apikey';
import { Chatbot, ChatbotSchema } from 'src/schemas/chatbot';
import { Knowledge, KnowledgeSchema } from 'src/schemas/knowledge';
import { Message, MessageSchema } from 'src/schemas/message';
import { Thread, ThreadSchema } from 'src/schemas/thread';
import { ApiKeyModule } from '../apikey/apikey.module';
import { OpenAIModule } from '../openai/openai.module';
import { PineconeModule } from '../pinecone/pinecone.module';
import { ThreadModule } from '../thread/thread.module';
import { ChatGateway } from './chat.gateway';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Chatbot.name, schema: ChatbotSchema },
      { name: Knowledge.name, schema: KnowledgeSchema },
      { name: Thread.name, schema: ThreadSchema },
      { name: ApiKey.name, schema: ApiKeySchema },
    ]),
    PineconeModule,
    OpenAIModule,
    forwardRef(() => ApiKeyModule),
    ThreadModule,
  ],
  providers: [ChatbotService, ChatGateway],
  controllers: [ChatbotController],
  exports: [ChatbotService],
})
export class ChatbotModule {}
