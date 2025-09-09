import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Chatbot } from './chatbot';

@Schema({ timestamps: true, collection: 'knowledges' })
export class Knowledge {
  @Prop({ type: String, required: true })
  text: string;

  @Prop({ type: String, required: true, index: true })
  pineconeId: string;

  @Prop({ type: [Number], required: true })
  vector: number[];

  @Prop({ type: Types.ObjectId, ref: Chatbot.name, required: true })
  chatbot: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const KnowledgeSchema = SchemaFactory.createForClass(Knowledge);
