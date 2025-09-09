import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Chatbot } from './chatbot';
import { Message } from './message';

@Schema({ timestamps: true, collection: 'sessions' })
export class Session extends Document {
  @Prop({ type: Types.ObjectId, ref: Chatbot.name, required: true })
  chatbot: Chatbot;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }] })
  messages: Message[];
}

export const SessionSchema = SchemaFactory.createForClass(Session);
