import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async createMessage(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.createMessage(req.user.id, createMessageDto);
  }

  @Get('conversations')
  async getUserConversations(@Request() req) {
    return this.messagesService.getUserConversations(req.user.id);
  }

  @Get('conversation/:otherUserId')
  async getConversation(@Param('otherUserId') otherUserId: string, @Request() req) {
    return this.messagesService.getConversation(req.user.id, otherUserId);
  }

  @Put(':messageId/read')
  async markAsRead(@Param('messageId') messageId: string, @Request() req) {
    return this.messagesService.markAsRead(messageId, req.user.id);
  }

  @Put('conversation/:otherUserId/read')
  async markConversationAsRead(@Param('otherUserId') otherUserId: string, @Request() req) {
    return this.messagesService.markConversationAsRead(req.user.id, otherUserId);
  }
}

