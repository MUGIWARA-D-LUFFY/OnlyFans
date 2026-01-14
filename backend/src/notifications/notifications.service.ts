import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async getNotifications(userId: string, type?: string) {
        const where: any = { userId };
        if (type && type !== 'all') {
            where.type = type.toUpperCase();
        }

        return this.prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }

    async createNotification(data: {
        userId: string;
        type: string;
        title: string;
        message: string;
        fromUserId?: string;
        postId?: string;
    }) {
        return this.prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type as any,
                title: data.title,
                message: data.message,
                fromUserId: data.fromUserId,
                postId: data.postId
            }
        });
    }

    async markAsRead(notificationId: string, userId: string) {
        return this.prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true }
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
    }

    async deleteNotification(notificationId: string, userId: string) {
        return this.prisma.notification.deleteMany({
            where: { id: notificationId, userId }
        });
    }

    async getUnreadCount(userId: string) {
        return this.prisma.notification.count({
            where: { userId, isRead: false }
        });
    }
}
