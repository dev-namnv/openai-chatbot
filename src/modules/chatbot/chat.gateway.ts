import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MongoId } from 'src/interfaces/mongoose.interface';
import { Sender } from 'src/schemas/message';
import { ChatbotService } from '../chatbot/chatbot.service';
import { SessionService } from '../session/session.service';

@WebSocketGateway({
  cors: { origin: '*' }, // TODO: cấu hình origin cho production
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly sessionService: SessionService,
  ) {}

  async handleConnection(client: Socket) {
    const { apiKey, chatbotId, accountId } = this.extractIds(client);

    if (!apiKey || !chatbotId || !accountId) {
      client.disconnect();
      return;
    }

    // TODO: verify apiKey khớp với accountId + chatbotId
    console.log(`🔌 Client connected: ${client.id} (chatbotId=${chatbotId})`);
  }

  @SubscribeMessage('chat')
  async handleChat(
    @MessageBody() data: { sessionId?: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    let sessionId = data.sessionId ? new MongoId(data.sessionId) : undefined;
    const message = data.message;
    const { chatbotId, accountId } = this.extractIds(client);

    // Save user's message
    const userMessage = await this.sessionService.saveMessage(
      chatbotId,
      Sender.USER,
      message,
      sessionId,
    );
    if (!sessionId) {
      sessionId = userMessage.session;
    }

    // emit lại message user
    client.emit('chat', {
      sessionId,
      ...userMessage.toObject(),
    });

    // gọi bot service để lấy response
    const botReply = await this.chatbotService.chat(
      accountId,
      chatbotId,
      data.message,
      sessionId,
    );

    // Save bot's message
    const botMessage = await this.sessionService.saveMessage(
      chatbotId,
      Sender.BOT,
      botReply.answer,
      sessionId,
    );

    // emit lại message bot
    client.emit('chat', {
      sessionId,
      ...botMessage.toObject(),
    });
  }

  private extractIds(client: Socket) {
    const { accountId, chatbotId, apiKey } = client.handshake.query;

    if (!accountId || !chatbotId) {
      throw new Error('accountId and chatbotId are required');
    }

    return {
      accountId: new MongoId(accountId as string),
      chatbotId: new MongoId(chatbotId as string),
      apiKey: apiKey ? String(apiKey) : '',
    };
  }
}
