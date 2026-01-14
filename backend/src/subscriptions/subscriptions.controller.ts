import { Controller, Get, Post, Delete, Param, Request, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post(':creatorId')
  async subscribe(@Param('creatorId') creatorId: string, @Request() req) {
    return this.subscriptionsService.subscribe(req.user.id, creatorId);
  }

  @Delete(':creatorId')
  async unsubscribe(@Param('creatorId') creatorId: string, @Request() req) {
    return this.subscriptionsService.unsubscribe(req.user.id, creatorId);
  }

  @Get()
  async getUserSubscriptions(@Request() req) {
    return this.subscriptionsService.getUserSubscriptions(req.user.id);
  }

  @Get('creator/:creatorId')
  async getCreatorSubscribers(@Param('creatorId') creatorId: string, @Request() req) {
    return this.subscriptionsService.getCreatorSubscribers(creatorId, req.user.id);
  }
}

