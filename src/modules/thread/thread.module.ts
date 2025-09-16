import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from 'src/schemas/message';
import { Thread, ThreadSchema } from 'src/schemas/thread';
import { OpenAIModule } from '../openai/openai.module';
import { ThreadController } from './thread.controller';
import { ThreadService } from './thread.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Thread.name, schema: ThreadSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    OpenAIModule,
  ],
  providers: [ThreadService],
  controllers: [ThreadController],
  exports: [ThreadService],
})
export class ThreadModule {}
