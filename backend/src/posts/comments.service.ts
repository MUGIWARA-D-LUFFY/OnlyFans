import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
    constructor(private readonly prisma: PrismaService) { }

    async createComment(userId: string, postId: string, content: string) {
        // Check if post exists
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // Create comment and increment post counter in a transaction
        const [comment] = await this.prisma.$transaction([
            this.prisma.comment.create({
                data: { userId, postId, content },
            }),
            this.prisma.post.update({
                where: { id: postId },
                data: { commentCount: { increment: 1 } },
            }),
        ]);

        // Fetch user data manually since there's no relation defined
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, avatarUrl: true },
        });

        return {
            ...comment,
            user,
        };
    }

    async getComments(postId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [comments, total] = await Promise.all([
            this.prisma.comment.findMany({
                where: { postId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.comment.count({ where: { postId } }),
        ]);

        // Get user data for each comment
        const userIds: string[] = [...new Set(comments.map(c => c.userId))];
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, username: true, avatarUrl: true },
        });

        const userMap = new Map(users.map(u => [u.id, u]));
        const commentsWithUsers = comments.map(comment => ({
            ...comment,
            user: userMap.get(comment.userId) || null,
        }));

        return {
            comments: commentsWithUsers,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async deleteComment(commentId: string, userId: string) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        if (comment.userId !== userId) {
            throw new ForbiddenException('Not authorized to delete this comment');
        }

        // Delete comment and decrement post counter in a transaction
        const [deletedComment] = await this.prisma.$transaction([
            this.prisma.comment.delete({
                where: { id: commentId },
            }),
            this.prisma.post.update({
                where: { id: comment.postId },
                data: { commentCount: { decrement: 1 } },
            }),
        ]);

        return deletedComment;
    }

    async getCommentCount(postId: string): Promise<number> {
        return this.prisma.comment.count({
            where: { postId },
        });
    }
}
