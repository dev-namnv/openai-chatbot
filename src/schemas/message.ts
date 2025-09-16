import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Thread } from './thread';

export enum Sender {
  USER = 'user',
  BOT = 'bot',
}

@Schema({ timestamps: true, collection: 'messages' })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: Thread.name, required: true })
  thread: Types.ObjectId;

  @Prop({ required: true, enum: Sender })
  sender: Sender;

  @Prop({ required: true })
  content: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
