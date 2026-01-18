import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private subscriptionsService: SubscriptionsService,
  ) { }

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

    // Determine default visibility based on isPaid
    let visibility: any = createPostDto.visibility;
    if (!visibility) {
      if (createPostDto.isPaid) visibility = 'PAID';
      else visibility = 'PUBLIC';
    }

    const post = await this.prisma.post.create({
      data: {
        creatorId,
        title: createPostDto.title,
        mediaUrl: createPostDto.mediaUrl,
        mediaType: createPostDto.mediaType,
        isPaid: createPostDto.isPaid || false,
        price: createPostDto.price,
        visibility,
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

  async updatePost(postId: string, userId: string, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { creator: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.creator.userId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        title: updatePostDto.title,
        isPaid: updatePostDto.isPaid,
        price: updatePostDto.price,
        visibility: updatePostDto.visibility as any,
      },
    });

    return updatedPost;
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

    const subscribedCreatorIds = subscriptions.map((sub) => sub.creatorId);
    const hasSubscriptions = subscribedCreatorIds.length > 0;

    const skip = (page - 1) * limit;

    let where: any;

    if (hasSubscriptions) {
      // User has subscriptions: show posts ONLY from subscribed creators
      // Include FREE and SUBSCRIBER posts (no PPV filter needed as user is subscribed)
      where = {
        creatorId: {
          in: subscribedCreatorIds,
        },
        isPaid: false, // Exclude PPV posts
      };
    } else {
      // User has NO subscriptions: show recent posts from all creators
      // Include FREE and SUBSCRIBER posts, exclude PPV
      where = {
        isPaid: false, // Exclude PPV posts
        OR: [
          { visibility: 'PUBLIC' },
          { visibility: 'SUBSCRIBERS' },
        ],
      };
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

    // Annotate posts with access info
    const annotatedPosts = posts.map(post => {
      const isSubscribedToCreator = subscribedCreatorIds.includes(post.creatorId);

      // Determine lock status
      if (post.visibility === 'SUBSCRIBERS' && !isSubscribedToCreator) {
        return {
          ...post,
          isLocked: true,
          accessLevel: 'SUBSCRIBER',
          hasPurchased: false,
        };
      }

      // Free/PUBLIC posts are always visible
      return {
        ...post,
        isLocked: false,
        accessLevel: 'FREE',
        hasPurchased: false,
      };
    });

    return {
      posts: annotatedPosts,
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

    // Check if user is subscribed
    let isSubscribed = false;
    let purchasedPostIds = new Set<string>();

    if (userId) {
      // Check subscription
      const subscription = await this.prisma.subscription.findUnique({
        where: {
          userId_creatorId: {
            userId,
            creatorId,
          },
        },
      });

      if (subscription && subscription.expiresAt > new Date()) {
        isSubscribed = true;
      }

      // Check PPV purchases (use metadata since postId column may not be recognized by Prisma yet)
      const purchases = await this.prisma.transaction.findMany({
        where: {
          userId,
          type: 'PPV',
          status: 'completed',
          creatorId,
        },
        select: { metadata: true }
      });
      purchases.forEach(p => {
        try {
          if (p.metadata) {
            const meta = JSON.parse(p.metadata);
            if (meta.postId) purchasedPostIds.add(meta.postId);
          }
        } catch (e) {
          // Ignore parse errors
        }
      });
    }

    // Check if the requesting user is the creator themselves
    const isOwner = userId === creator.userId;

    const where: any = {
      creatorId,
    };

    const skip = (page - 1) * limit;

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

    // Annotate posts with access info
    const annotatedPosts = posts.map(post => {
      // 1. Owner sees everything unlocked
      if (isOwner) {
        return {
          ...post,
          isLocked: false,
          accessLevel: post.isPaid ? 'PPV' : (post.visibility === 'SUBSCRIBERS' ? 'SUBSCRIBER' : 'FREE'),
          hasPurchased: true
        };
      }

      // 2. PPV (Paid) Posts: Must be purchased
      if (post.isPaid) {
        const hasPurchased = purchasedPostIds.has(post.id);
        return {
          ...post,
          isLocked: !hasPurchased,
          accessLevel: 'PPV',
          hasPurchased
        };
      }

      // 3. Subscribers Only Posts
      if (post.visibility === 'SUBSCRIBERS') {
        return {
          ...post,
          isLocked: !isSubscribed,
          accessLevel: 'SUBSCRIBER',
          hasPurchased: false
        };
      }

      // 4. Public Posts -> Always visible
      return {
        ...post,
        isLocked: false,
        accessLevel: 'FREE',
        hasPurchased: false
      };
    });

    return {
      posts: annotatedPosts,
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

