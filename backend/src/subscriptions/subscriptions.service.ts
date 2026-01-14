import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async subscribe(userId: string, creatorId: string) {
    // Check if creator exists
    const creator = await this.prisma.creator.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    // Check if user is trying to subscribe to themselves
    if (creator.userId === userId) {
      throw new BadRequestException('Cannot subscribe to yourself');
    }

    // Check if subscription already exists and is active
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: {
        userId_creatorId: {
          userId,
          creatorId,
        },
      },
    });

    if (existingSubscription && existingSubscription.expiresAt > new Date()) {
      throw new BadRequestException('Already subscribed to this creator');
    }

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create or update subscription
    const subscription = await this.prisma.subscription.upsert({
      where: {
        userId_creatorId: {
          userId,
          creatorId,
        },
      },
      update: {
        expiresAt,
      },
      create: {
        userId,
        creatorId,
        expiresAt,
      },
    });

    return subscription;
  }

  async unsubscribe(userId: string, creatorId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        userId_creatorId: {
          userId,
          creatorId,
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new ForbiddenException('You can only unsubscribe from your own subscriptions');
    }

    await this.prisma.subscription.delete({
      where: {
        userId_creatorId: {
          userId,
          creatorId,
        },
      },
    });

    return { message: 'Successfully unsubscribed' };
  }

  async getUserSubscriptions(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        creator: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return subscriptions;
  }

  async isSubscribed(userId: string, creatorId: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        userId_creatorId: {
          userId,
          creatorId,
        },
      },
    });

    if (!subscription) {
      return false;
    }

    return subscription.expiresAt > new Date();
  }

  async getCreatorSubscribers(creatorId: string, userId: string) {
    const creator = await this.prisma.creator.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    if (creator.userId !== userId) {
      throw new ForbiddenException('You can only view your own subscribers');
    }

    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        creatorId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return subscriptions;
  }
}

