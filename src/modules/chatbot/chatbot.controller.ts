import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, CurrentAccount } from 'src/decorators';
import { MongoId } from 'src/interfaces/mongoose.interface';
import { Account } from 'src/schemas/account';
import { ChatbotService } from './chatbot.service';
import { ChatDto } from './dto/Chat.dto';
import { TrainingDto } from './dto/Training.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @ApiTags('Chatbot')
  @ApiOperation({ summary: 'Chat' })
  @Auth()
  @Post(':id/chat')
  async chat(@Body() dto: ChatDto, @CurrentAccount() account: Account) {
    return this.chatbotService.chat(
      account.id,
      new MongoId(dto.chatbotId),
      dto.message,
      new MongoId(dto.chatId),
    );
  }

  @ApiTags('Chatbot')
  @ApiOperation({ summary: 'Training for chatbot' })
  @Auth()
  @Post(':id/training')
  async training(@Body() dto: TrainingDto, @CurrentAccount() account: Account) {
    return this.chatbotService.training(account.id, dto.chatbotId, dto.texts);
  }
}
