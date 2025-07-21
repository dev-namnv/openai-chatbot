import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PineconeService } from '../pinecone/pinecone.service';
import { ChatWithContextDto } from './dto/ChatWithContext.dto';
import { OpenAIService } from './openai.service';

@Controller('openai')
export class OpenAIController {
  constructor(
    private readonly openaiService: OpenAIService,
    private readonly pineconeService: PineconeService,
  ) {}

  @ApiTags('OpenAI')
  @ApiOperation({ summary: 'Chat with context' })
  @Post('chat')
  async handleQuery(@Body() body: ChatWithContextDto) {
    return this.openaiService.chat(body);
  }
}
