import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { Account } from 'src/schemas/account';
import { ApiKey } from 'src/schemas/apikey';
import { MongoId } from '../../interfaces/mongoose.interface';
import { ChatbotService } from '../chatbot/chatbot.service';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKey>,
    @Inject(forwardRef(() => ChatbotService))
    private readonly chatbotService: ChatbotService,
  ) {}

  async generateApiKey(account: Account, chatbotId: MongoId): Promise<ApiKey> {
    const key = this.createKey();
    const isExist = await this.chatbotService.findChatbot(
      chatbotId,
      account._id,
    );
    if (!isExist) {
      throw new NotFoundException('Chatbot not found!');
    }
    return this.apiKeyModel.create({
      account: account._id,
      chatbot: new MongoId(chatbotId),
      key,
    });
  }

  async validate(key: string): Promise<ApiKey | null> {
    return this.apiKeyModel.findOne({ key, active: true });
  }

  private createKey(length = 32): string {
    // API Key sẽ có dạng base64url
    return randomBytes(length).toString('base64url');
  }

  async updateApiKey(id: MongoId, active: boolean) {
    return this.apiKeyModel.findByIdAndUpdate(id, { active }, { new: true });
  }

  async removeApiKey(id: MongoId) {
    return this.apiKeyModel.findByIdAndDelete(id);
  }

  async listByChatbotIds(chatbotIds: MongoId | unknown[]) {
    return this.apiKeyModel.find({ chatbot: chatbotIds });
  }
}
