import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationDto } from 'src/dto/pagination.dto';
import { MongoId } from 'src/interfaces/mongoose.interface';
import { Message, Sender } from 'src/schemas/message';
import { Thread } from 'src/schemas/thread';
import PaginationUtil, { PaginationResponse } from 'src/utils/pagination.util';
import { OpenAIService } from '../openai/openai.service';

@Injectable()
export class ThreadService {
  constructor(
    @InjectModel(Thread.name) private readonly threadModel: Model<Thread>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    private readonly openAiService: OpenAIService,
  ) {}

  /**
   * Save message & update/create thread
   * @param chatbot Chatbot
   * @param sender Sender enum
   * @param content content
   * @param threadId thread id
   */
  async saveMessage(
    chatbotId: MongoId,
    sender: Sender,
    content: string,
    threadId?: MongoId,
  ): Promise<Message> {
    let thread: Thread;
    if (!threadId) {
      const title = await this.openAiService.generateTitle(content);
      thread = await this.threadModel.create({ chatbot: chatbotId, title });
    } else {
      thread = await this.threadModel.findById(threadId);
    }
    const message = await this.messageModel.create({
      thread: thread._id,
      sender,
      content,
    });
    thread.messages.push(message._id as any);
    await thread.save();
    return message;
  }

  /**
   * Get messages from a thread
   * @param threadId thread id
   * @returns Message[]
   */
  async getMessages(threadId: MongoId) {
    return this.messageModel
      .find({ thread: threadId })
      .sort({ createdAt: 'asc' });
  }

  async getMessagesWithPagination(
    threadId: MongoId,
    query: PaginationDto,
  ): Promise<PaginationResponse<Message>> {
    const data = await PaginationUtil.response<Message>(
      this.messageModel,
      query,
      {
        thread: threadId,
      },
    );
    return data;
  }

  async listWithPagination(
    params: PaginationDto,
  ): Promise<PaginationResponse<Thread>> {
    return PaginationUtil.response<Thread>(this.threadModel, params, {});
  }
}
