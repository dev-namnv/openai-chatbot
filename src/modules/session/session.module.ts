import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from 'src/schemas/message';
import { Session, SessionSchema } from 'src/schemas/session';
import { SessionService } from './session.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
