import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId = payload.sub;
      this.connectedUsers.set(userId, client.id);
      client.data.userId = userId;

      // Join user's personal room
      client.join(`user:${userId}`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.connectedUsers.delete(client.data.userId);
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(@MessageBody() createMessageDto: CreateMessageDto, @ConnectedSocket() client: Socket) {
    const senderId = client.data.userId;

    if (!senderId) {
      return { error: 'Unauthorized' };
    }

    try {
      const message = await this.messagesService.createMessage(senderId, createMessageDto);

      // Emit to receiver if online
      const receiverSocketId = this.connectedUsers.get(createMessageDto.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('new_message', message);
      }

      // Also emit to sender for confirmation
      client.emit('message_sent', message);

      return message;
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(@MessageBody() data: { otherUserId: string }, @ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      client.join(`conversation:${userId}:${data.otherUserId}`);
      client.join(`conversation:${data.otherUserId}:${userId}`);
    }
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(@MessageBody() data: { messageId: string }, @ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    try {
      const message = await this.messagesService.markAsRead(data.messageId, userId);
      return message;
    } catch (error) {
      return { error: error.message };
    }
  }
}

