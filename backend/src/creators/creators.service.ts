import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCreatorDto } from './dto/create-creator.dto';
import { UpdateCreatorDto } from './dto/update-creator.dto';

@Injectable()
export class CreatorsService {
  constructor(private prisma: PrismaService) {}

  async getAllCreators() {
    const creators = await this.prisma.creator.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            subscriptions: true,
            posts: true,
          },
        },
      },
      orderBy: [
        { verified: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return creators;
  }

  async createCreator(userId: string, createCreatorDto: CreateCreatorDto) {
    // Check if user already has a creator profile
    const existingCreator = await this.prisma.creator.findUnique({
      where: { userId },
    });

    if (existingCreator) {
      throw new BadRequestException('Creator profile already exists');
    }

    // Check if user exists and update role to CREATOR
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create creator profile and update user role
    const creator = await this.prisma.$transaction(async (tx) => {
      const newCreator = await tx.creator.create({
        data: {
          userId,
          subscriptionFee: createCreatorDto.subscriptionFee,
          bio: createCreatorDto.bio,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { role: 'CREATOR' },
      });

      return newCreator;
    });

    return creator;
  }

  async getCreatorProfile(creatorId: string) {
    const creator = await this.prisma.creator.findUnique({
      where: { id: creatorId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            subscriptions: true,
            posts: true,
          },
        },
      },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    return creator;
  }

  async getCreatorByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        creator: {
          include: {
            _count: {
              select: {
                subscriptions: true,
                posts: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.creator) {
      throw new NotFoundException('Creator not found');
    }

    const { password, email, ...publicProfile } = user;
    return {
      ...publicProfile,
      creator: user.creator,
    };
  }

  async updateCreator(userId: string, updateCreatorDto: UpdateCreatorDto) {
    const creator = await this.prisma.creator.findUnique({
      where: { userId },
    });

    if (!creator) {
      throw new NotFoundException('Creator profile not found');
    }

    if (creator.userId !== userId) {
      throw new ForbiddenException('You can only update your own creator profile');
    }

    const updatedCreator = await this.prisma.creator.update({
      where: { userId },
      data: updateCreatorDto,
    });

    return updatedCreator;
  }

  async verifyCreator(creatorId: string) {
    const creator = await this.prisma.creator.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    const updatedCreator = await this.prisma.creator.update({
      where: { id: creatorId },
      data: { verified: true },
    });

    return updatedCreator;
  }

  async getEarnings(creatorId: string, userId: string) {
    const creator = await this.prisma.creator.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    if (creator.userId !== userId) {
      throw new ForbiddenException('You can only view your own earnings');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        creatorId,
        status: 'completed',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalEarnings = transactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalEarnings,
      transactionCount: transactions.length,
      transactions,
    };
  }
}

