import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth, CurrentAccount } from 'src/decorators';
import { MongoId } from 'src/interfaces/mongoose.interface';
import { Account } from 'src/schemas/account';
import { ApiKeyService } from './apikey.service';
import { GenerateApiKeyDto } from './dto/GenerateApiKey.dto';

@Controller('apikey')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @ApiTags('ApiKey')
  @Auth()
  @Post('generate')
  async generateApiKey(
    @CurrentAccount() account: Account,
    @Body() dto: GenerateApiKeyDto,
  ) {
    return this.apiKeyService.generateApiKey(
      account,
      new MongoId(dto.chatbotId),
    );
  }
}
