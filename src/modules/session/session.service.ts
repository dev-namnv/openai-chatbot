import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoId } from 'src/interfaces/mongoose.interface';
import { Message, Sender } from 'src/schemas/message';
import { Session } from 'src/schemas/session';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}

  /**
   * Save message & update/create session
   * @param chatbot Chatbot
   * @param sender Sender enum
   * @param content content
   * @param sessionId session id
   */
  async saveMessage(
    chatbotId: MongoId,
    sender: Sender,
    content: string,
    sessionId?: MongoId,
  ): Promise<Message> {
    let session: Session;
    if (!sessionId) {
      session = await this.sessionModel.create({ chatbot: chatbotId });
    } else {
      session = await this.sessionModel.findById(sessionId);
    }
    const message = await this.messageModel.create({
      session: session._id,
      sender,
      content,
    });
    session.messages.push(message._id as any);
    await session.save();
    return message;
  }

  /**
   * Get messages from a session
   * @param sessionId session id
   * @returns Message[]
   */
  async getMessages(sessionId: MongoId) {
    return this.messageModel
      .find({ session: sessionId })
      .sort({ createdAt: 'asc' });
  }
}
