import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          ageVerified: true,
          createdAt: true,
          creator: {
            select: {
              id: true,
              verified: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        creator: true,
        subscriptions: {
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
        },
        transactions: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Cannot delete admin users');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }

  async updateUserRole(userId: string, role: string) {
    const validRoles = ['USER', 'CREATOR', 'ADMIN'];
    if (!validRoles.includes(role)) {
      throw new ForbiddenException('Invalid role');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async getAllPosts(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
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
        skip,
        take: limit,
      }),
      this.prisma.post.count(),
    ]);

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deletePost(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { message: 'Post deleted successfully' };
  }

  async getAllReports() {
    // In a real implementation, you would have a Report model
    // For now, we'll return an empty array
    // TODO: Implement reporting system
    return {
      reports: [],
      total: 0,
    };
  }

  async getDashboardStats() {
    const [
      totalUsers,
      totalCreators,
      totalPosts,
      totalSubscriptions,
      totalTransactions,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.creator.count(),
      this.prisma.post.count(),
      this.prisma.subscription.count({
        where: {
          expiresAt: {
            gt: new Date(),
          },
        },
      }),
      this.prisma.transaction.count({
        where: {
          status: 'completed',
        },
      }),
      this.prisma.transaction.aggregate({
        where: {
          status: 'completed',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      totalUsers,
      totalCreators,
      totalPosts,
      activeSubscriptions: totalSubscriptions,
      totalTransactions,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }
}

