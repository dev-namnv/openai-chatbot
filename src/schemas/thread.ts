import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Chatbot } from './chatbot';
import { Message } from './message';

@Schema({ timestamps: true, collection: 'threads' })
export class Thread extends Document {
  @Prop({ type: Types.ObjectId, ref: Chatbot.name, required: true })
  chatbot: Chatbot;

  @Prop()
  title: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }] })
  messages: Message[];
}

export const ThreadSchema = SchemaFactory.createForClass(Thread);
