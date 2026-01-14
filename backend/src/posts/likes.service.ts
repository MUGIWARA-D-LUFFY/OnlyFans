import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikesService {
    constructor(private readonly prisma: PrismaService) { }

    async likePost(userId: string, postId: string) {
        // Check if post exists
        const post = await this.prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // Check if already liked
        const existingLike = await this.prisma.like.findUnique({
            where: { userId_postId: { userId, postId } },
        });

        if (existingLike) {
            throw new ConflictException('Already liked this post');
        }

        // Create like and increment post counter in a transaction
        const [like] = await this.prisma.$transaction([
            this.prisma.like.create({
                data: { userId, postId },
            }),
            this.prisma.post.update({
                where: { id: postId },
                data: { likeCount: { increment: 1 } },
            }),
        ]);

        return like;
    }

    async unlikePost(userId: string, postId: string) {
        const like = await this.prisma.like.findUnique({
            where: { userId_postId: { userId, postId } },
        });

        if (!like) {
            throw new NotFoundException('Like not found');
        }

        // Delete like and decrement post counter in a transaction
        const [deletedLike] = await this.prisma.$transaction([
            this.prisma.like.delete({
                where: { id: like.id },
            }),
            this.prisma.post.update({
                where: { id: postId },
                data: { likeCount: { decrement: 1 } },
            }),
        ]);

        return deletedLike;
    }

    async getLikeCount(postId: string): Promise<number> {
        return this.prisma.like.count({
            where: { postId },
        });
    }

    async isLiked(userId: string, postId: string): Promise<boolean> {
        const like = await this.prisma.like.findUnique({
            where: { userId_postId: { userId, postId } },
        });
        return !!like;
    }

    async getPostLikeStatus(userId: string, postId: string) {
        const [isLiked, count] = await Promise.all([
            this.isLiked(userId, postId),
            this.getLikeCount(postId),
        ]);
        return { isLiked, count };
    }
}
