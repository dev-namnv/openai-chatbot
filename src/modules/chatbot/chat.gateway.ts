import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LoggerService } from 'src/common/logger';
import { MongoId } from 'src/interfaces/mongoose.interface';
import { Sender } from 'src/schemas/message';
import { ApiKeyService } from '../apikey/apikey.service';
import { ChatbotService } from '../chatbot/chatbot.service';
import { ThreadService } from '../thread/thread.service';

interface ExtractIds {
  accountId: MongoId | null;
  chatbotId: MongoId | null;
  apiKey: string | null;
}

@WebSocketGateway({
  cors: { origin: '*' }, // TODO: cấu hình origin cho production
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly threadService: ThreadService,
    private readonly logger: LoggerService,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  async handleConnection(client: Socket) {
    const { chatbotId } = await this.extractIds(client);

    if (!chatbotId) {
      client.disconnect();
      return;
    }

    // TODO: verify apiKey khớp với accountId + chatbotId
    this.logger.log(
      `🔌 Client connected: ${client.id} (chatbotId=${chatbotId})`,
    );
  }

  @SubscribeMessage('chat')
  async handleChat(
    @MessageBody() data: { threadId?: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log('User sent a message ' + data.message);
    let threadId = data.threadId ? new MongoId(data.threadId) : undefined;
    const message = data.message;
    const { chatbotId, accountId } = await this.extractIds(client);

    // Save user's message
    const userMessage = await this.threadService.saveMessage(
      chatbotId,
      Sender.USER,
      message,
      threadId,
    );
    if (!threadId) {
      threadId = userMessage.thread;
    }
    // emit lại message user
    client.emit('chat', {
      threadId,
      ...userMessage.toObject(),
    });

    // gọi bot service để lấy response
    const botReply = await this.chatbotService.chat(
      accountId,
      chatbotId,
      data.message,
      threadId,
    );

    // Save bot's message
    const botMessage = await this.threadService.saveMessage(
      chatbotId,
      Sender.BOT,
      botReply.answer,
      threadId,
    );
    this.logger.log('Bot sent a message ' + botMessage.content);

    // emit lại message bot
    client.emit('chat', {
      threadId,
      ...botMessage.toObject(),
    });
  }

  private async extractIds(client: Socket): Promise<ExtractIds> {
    const defaultIds: ExtractIds = {
      accountId: null,
      chatbotId: null,
      apiKey: null,
    };
    const { apiKey } = client.handshake.query;
    if (!apiKey) {
      return defaultIds;
    }
    const document = await this.apiKeyService.validate(apiKey as string);
    if (!document) {
      return defaultIds;
    }

    return {
      accountId: document.account,
      chatbotId: document.chatbot,
      apiKey: apiKey ? String(apiKey) : '',
    };
  }
}
