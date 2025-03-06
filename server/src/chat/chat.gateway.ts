import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('join')
  async handleJoin(@ConnectedSocket() client: Socket) {
    const messages = await this.chatService.getMessages();
    client.emit('history', messages);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: { user: string; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { user, text } = data;

    if (text.toLowerCase().includes('глупость')) {
      client.emit('error', 'bad word');
      return;
    }

    if (!(await this.chatService.canSendMessage(user))) {
      client.emit('error', 'too many messages');
      return;
    }

    const message = await this.chatService.saveMessage(user, text);
    this.server.emit('message', message);
  }
}
