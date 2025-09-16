import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Account } from './account';

export enum ChatbotType {
  personal = 'personal',
  business = 'business',
}

@Schema({ timestamps: true, collection: 'chatbots' })
export class Chatbot extends Document {
  @Prop({ type: Types.ObjectId, ref: Account.name, required: true })
  account: Types.ObjectId;

  @Prop()
  name: string;

  @Prop({ required: true })
  indexName: string;

  @Prop()
  ownerName: string;

  @Prop({ enum: ChatbotType })
  type: ChatbotType;

  @Prop()
  role: string;

  @Prop({ default: 1536 })
  size: number;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: {}, type: Object })
  metadata: Record<string, any>;
}

export const ChatbotSchema = SchemaFactory.createForClass(Chatbot);
