import api from './api';

export interface Notification {
    id: string;
    userId: string;
    type: 'LIKE' | 'COMMENT' | 'MENTION' | 'SUBSCRIPTION' | 'TIP' | 'PROMOTION' | 'SYSTEM';
    title: string;
    message: string;
    fromUserId?: string;
    postId?: string;
    isRead: boolean;
    createdAt: string;
}

export const getNotifications = async (type?: string): Promise<Notification[]> => {
    const params = type && type !== 'all' ? { type: type.toUpperCase() } : {};
    const response = await api.get('/notifications', { params });
    return response.data;
};

export const getUnreadCount = async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
};

export const markAsRead = async (notificationId: string): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
    await api.patch('/notifications/read-all');
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
};
