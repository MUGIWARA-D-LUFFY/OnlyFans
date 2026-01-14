import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
    constructor(private prisma: PrismaService) { }

    async getBookmarks(userId: string) {
        const bookmarks = await this.prisma.bookmark.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        // Get full post details for each bookmark
        const postIds = bookmarks.map(b => b.postId);
        const posts = await this.prisma.post.findMany({
            where: { id: { in: postIds } },
            include: {
                creator: {
                    include: {
                        user: {
                            select: { id: true, username: true, avatarUrl: true }
                        }
                    }
                }
            }
        });

        return posts;
    }

    async addBookmark(userId: string, postId: string) {
        try {
            return await this.prisma.bookmark.create({
                data: { userId, postId }
            });
        } catch (error: any) {
            if (error.code === 'P2002') {
                throw new ConflictException('Post already bookmarked');
            }
            throw error;
        }
    }

    async removeBookmark(userId: string, postId: string) {
        return this.prisma.bookmark.deleteMany({
            where: { userId, postId }
        });
    }

    async isBookmarked(userId: string, postId: string) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: { userId_postId: { userId, postId } }
        });
        return { isBookmarked: !!bookmark };
    }
}
