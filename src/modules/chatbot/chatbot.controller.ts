import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, CurrentAccount } from 'src/decorators';
import { IdDto } from 'src/dto/id.dto';
import { MongoId } from 'src/interfaces/mongoose.interface';
import { Account } from 'src/schemas/account';
import { ChatbotService } from './chatbot.service';
import { ChatDto } from './dto/Chat.dto';
import { ConfigureChatbotDto } from './dto/ConfigureChatbot.dto';
import { TrainingDto } from './dto/Training.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @ApiTags('Chatbot')
  @ApiOperation({ summary: 'Chat' })
  @Auth()
  @Post(':id/chat')
  async chat(
    @Body() dto: ChatDto,
    @Param() idDto: IdDto,
    @CurrentAccount() account: Account,
  ) {
    return this.chatbotService.chat(
      account.id,
      new MongoId(idDto.id),
      dto.message,
      new MongoId(dto.chatId),
    );
  }

  @ApiTags('Chatbot')
  @ApiOperation({ summary: 'Training for chatbot' })
  @Auth()
  @Post(':id/training')
  async training(
    @Body() dto: TrainingDto,
    @CurrentAccount() account: Account,
    @Param() idDto: IdDto,
  ) {
    return this.chatbotService.training(account._id, idDto.id, dto.texts);
  }

  @ApiTags('Chatbot')
  @ApiOperation({ summary: 'Create a chatbot' })
  @Auth()
  @Post('new')
  async createChatbot(
    @Body() dto: ConfigureChatbotDto,
    @CurrentAccount() account: Account,
  ) {
    return this.chatbotService.configure(account, dto);
  }

  @ApiTags('Chatbot')
  @ApiOperation({ summary: 'List chatbots by account' })
  @Auth()
  @Get('all')
  async listByAccount(@CurrentAccount() account: Account) {
    return this.chatbotService.listByAccount(account);
  }

  @ApiTags('Chatbot')
  @ApiOperation({ summary: 'Find Chatbot' })
  @Auth()
  @Get(':id')
  async findById(@Param() idDto: IdDto, @CurrentAccount() account: Account) {
    return this.chatbotService.findChatbot(new MongoId(idDto.id), account._id);
  }
}
