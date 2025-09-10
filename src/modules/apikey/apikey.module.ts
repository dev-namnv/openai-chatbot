import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKey, ApiKeySchema } from 'src/schemas/apikey';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { ApiKeyController } from './apikey.controller';
import { ApiKeyService } from './apikey.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }]),
    forwardRef(() => ChatbotModule),
  ],
  controllers: [ApiKeyController],
  providers: [ApiKeyService],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
