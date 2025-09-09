import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { Account } from 'src/schemas/account';
import { ApiKey } from 'src/schemas/apikey';
import { Chatbot } from 'src/schemas/chatbot';
import { MongoId } from '../../interfaces/mongoose.interface';

@Injectable()
export class ApiKeyService {
  constructor(@InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKey>) {}

  async generateApiKey(account: Account, chatbot: Chatbot): Promise<ApiKey> {
    const key = this.createKey();
    return this.apiKeyModel.create({
      account: account.id,
      chatbot: chatbot.id,
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
}
