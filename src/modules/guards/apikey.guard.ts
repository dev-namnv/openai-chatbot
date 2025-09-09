import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyService } from 'src/modules/apikey/apikey.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('Missing API Key');
    }

    const validKey = await this.apiKeyService.validate(apiKey);
    if (!validKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // attach chatbot info vào request
    request.chatbotId = validKey.chatbot;
    request.accountId = validKey.account;

    return true;
  }
}
