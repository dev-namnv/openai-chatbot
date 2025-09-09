import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Account } from './account';
import { Chatbot } from './chatbot';

@Schema({ timestamps: true, collection: 'apikeys' })
export class ApiKey extends Document {
  @Prop({ type: Types.ObjectId, ref: Account.name, required: true })
  account: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Chatbot.name, required: true })
  chatbot: Types.ObjectId;

  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
