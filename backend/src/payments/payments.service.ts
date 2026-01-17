import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { TransactionType } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
  ) { }

  async processSubscriptionPayment(userId: string, creatorId: string) {
    const creator = await this.prisma.creator.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    if (creator.userId === userId) {
      throw new BadRequestException('Cannot subscribe to yourself');
    }

    // Check if already subscribed
    const isSubscribed = await this.subscriptionsService.isSubscribed(userId, creatorId);
    if (isSubscribed) {
      throw new BadRequestException('Already subscribed to this creator');
    }

    // Create transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        creatorId,
        amount: creator.subscriptionFee,
        type: TransactionType.SUBSCRIPTION,
        status: 'pending',
      },
    });

    // In a real implementation, this would integrate with payment gateway
    // For now, we'll simulate payment processing
    // TODO: Integrate with CCBill/Segpay/Paxum

    // Simulate payment success after a delay
    // In production, this would be handled by webhook from payment provider
    setTimeout(async () => {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'completed' },
      });

      // Create subscription
      await this.subscriptionsService.subscribe(userId, creatorId);
    }, 1000);

    return {
      transactionId: transaction.id,
      amount: transaction.amount,
      status: transaction.status,
      message: 'Payment processing. Subscription will be activated upon confirmation.',
    };
  }

  async processTip(userId: string, creatorId: string, amount: number) {
    const creator = await this.prisma.creator.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    if (amount <= 0) {
      throw new BadRequestException('Tip amount must be greater than 0');
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        creatorId,
        amount,
        type: TransactionType.TIP,
        status: 'pending',
      },
    });

    // Simulate payment processing
    setTimeout(async () => {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'completed' },
      });
    }, 1000);

    return {
      transactionId: transaction.id,
      amount: transaction.amount,
      status: transaction.status,
      message: 'Tip processing. Creator will receive payment upon confirmation.',
    };
  }

  async processPPV(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        creator: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (!post.isPaid || !post.price) {
      throw new BadRequestException('This post is not a paid post');
    }

    // PPV posts must be purchased separately, even by subscribers
    // No subscription check here - that's the whole point of PPV

    // Check if user already purchased this PPV
    const existingTransaction = await this.prisma.transaction.findFirst({
      where: {
        userId,
        creatorId: post.creatorId,
        type: TransactionType.PPV,
        status: 'completed',
        // @ts-ignore
        postId,
      },
    });

    if (existingTransaction) {
      throw new BadRequestException('You have already purchased this content');
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        creatorId: post.creatorId,
        amount: post.price,
        type: TransactionType.PPV,
        status: 'pending',
        // @ts-ignore
        postId,
        metadata: JSON.stringify({ postId }),
      },
    });

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'completed' },
    });

    return {
      transactionId: transaction.id,
      amount: transaction.amount,
      status: 'completed',
      message: 'PPV payment successful. Access granted.',
    };
  }

  async processPaidMessage(userId: string, messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        receiver: true,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.receiverId !== userId) {
      throw new ForbiddenException('You can only purchase messages sent to you');
    }

    if (!message.isPaid || !message.price) {
      throw new BadRequestException('This message is not a paid message');
    }

    // Check if already purchased
    const existingTransaction = await this.prisma.transaction.findFirst({
      where: {
        userId,
        type: TransactionType.MESSAGE,
        status: 'completed',
        metadata: JSON.stringify({ messageId }),
      },
    });

    if (existingTransaction) {
      throw new BadRequestException('You have already purchased this message');
    }

    const sender = await this.prisma.user.findUnique({
      where: { id: message.senderId },
      include: { creator: true },
    });

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        creatorId: sender?.creator?.id || null,
        amount: message.price,
        type: TransactionType.MESSAGE,
        status: 'pending',
        metadata: JSON.stringify({ messageId }),
      },
    });

    // Simulate payment processing
    setTimeout(async () => {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'completed' },
      });
    }, 1000);

    return {
      transactionId: transaction.id,
      amount: transaction.amount,
      status: transaction.status,
      message: 'Paid message payment processing. Access will be granted upon confirmation.',
    };
  }

  async getUserTransactions(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return transactions;
  }

  async getCreatorTransactions(creatorId: string, userId: string) {
    const creator = await this.prisma.creator.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    if (creator.userId !== userId) {
      throw new ForbiddenException('You can only view your own transactions');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        creatorId,
        status: 'completed',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return transactions;
  }

  async handlePaymentWebhook(payload: any) {
    // TODO: Implement webhook handler for payment provider
    // This would verify the webhook signature and update transaction status
    // For CCBill/Segpay/Paxum integration
    return { received: true };
  }
}

