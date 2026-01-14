import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('subscribe/:creatorId')
  @HttpCode(HttpStatus.OK)
  async subscribe(@Param('creatorId') creatorId: string, @Request() req) {
    return this.paymentsService.processSubscriptionPayment(req.user.id, creatorId);
  }

  @Post('tip/:creatorId')
  @HttpCode(HttpStatus.OK)
  async tip(
    @Param('creatorId') creatorId: string,
    @Body() body: { amount: number },
    @Request() req,
  ) {
    return this.paymentsService.processTip(req.user.id, creatorId, body.amount);
  }

  @Post('ppv/:postId')
  @HttpCode(HttpStatus.OK)
  async ppv(@Param('postId') postId: string, @Request() req) {
    return this.paymentsService.processPPV(req.user.id, postId);
  }

  @Post('message/:messageId')
  @HttpCode(HttpStatus.OK)
  async paidMessage(@Param('messageId') messageId: string, @Request() req) {
    return this.paymentsService.processPaidMessage(req.user.id, messageId);
  }

  @Get('transactions')
  async getUserTransactions(@Request() req) {
    return this.paymentsService.getUserTransactions(req.user.id);
  }

  @Get('creator/:creatorId/transactions')
  async getCreatorTransactions(@Param('creatorId') creatorId: string, @Request() req) {
    return this.paymentsService.getCreatorTransactions(creatorId, req.user.id);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: any) {
    return this.paymentsService.handlePaymentWebhook(payload);
  }
}

