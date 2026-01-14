import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async createPost(creatorId: string, userId: string, createPostDto: CreatePostDto) {
    // Verify user is the creator
    const creator = await this.prisma.creator.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    if (creator.userId !== userId) {
      throw new ForbiddenException('You can only create posts for your own creator profile');
    }

    const post = await this.prisma.post.create({
      data: {
        creatorId,
        title: createPostDto.title,
        mediaUrl: createPostDto.mediaUrl,
        mediaType: createPostDto.mediaType,
        isPaid: createPostDto.isPaid || false,
        price: createPostDto.price,
      },
      include: {
        creator: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return post;
  }

  async getFeed(userId: string, page: number = 1, limit: number = 20) {
    // Get user's active subscriptions
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        creatorId: true,
      },
    });

    const creatorIds = subscriptions.map((sub) => sub.creatorId);

    if (creatorIds.length === 0) {
      return {
        posts: [],
        total: 0,
        page,
        limit,
      };
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          creatorId: {
            in: creatorIds,
          },
          isPaid: false, // Only show free posts in feed
        },
        include: {
          creator: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.post.count({
        where: {
          creatorId: {
            in: creatorIds,
          },
          isPaid: false,
        },
      }),
    ]);

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPost(postId: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        creator: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // If post is paid, check if user has access
    if (post.isPaid && userId) {
      const hasAccess = await this.subscriptionsService.isSubscribed(
        userId,
        post.creatorId,
      );

      if (!hasAccess) {
        throw new ForbiddenException('Subscription required to view this content');
      }
    }

    return post;
  }

  async getCreatorPosts(creatorId: string, userId?: string, page: number = 1, limit: number = 20) {
    const creator = await this.prisma.creator.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    const skip = (page - 1) * limit;
    const isSubscribed = userId
      ? await this.subscriptionsService.isSubscribed(userId, creatorId)
      : false;

    const where: any = {
      creatorId,
    };

    // If not subscribed, only show free posts
    if (!isSubscribed) {
      where.isPaid = false;
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          creator: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        creator: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.creator.userId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { message: 'Post deleted successfully' };
  }
}

