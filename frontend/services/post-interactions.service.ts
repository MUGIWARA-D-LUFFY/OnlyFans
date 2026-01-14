import api from './api';

export interface LikeStatus {
    count: number;
    isLiked: boolean;
}

export interface Comment {
    id: string;
    userId: string;
    postId: string;
    content: string;
    createdAt: string;
    user?: {
        id: string;
        username: string;
        avatarUrl?: string;
    };
}

export interface CommentsResponse {
    comments: Comment[];
    total: number;
    page: number;
    totalPages: number;
}

// ============ LIKES ============

export const likePost = async (postId: string): Promise<void> => {
    await api.post(`/posts/${postId}/like`);
};

export const unlikePost = async (postId: string): Promise<void> => {
    await api.delete(`/posts/${postId}/like`);
};

export const getLikeStatus = async (postId: string): Promise<LikeStatus> => {
    const response = await api.get(`/posts/${postId}/likes`);
    return response.data;
};

// ============ BOOKMARKS ============

export const addBookmark = async (postId: string): Promise<void> => {
    await api.post(`/bookmarks/${postId}`);
};

export const removeBookmark = async (postId: string): Promise<void> => {
    await api.delete(`/bookmarks/${postId}`);
};

export const getBookmarkStatus = async (postId: string): Promise<{ isBookmarked: boolean }> => {
    const response = await api.get(`/bookmarks/${postId}/status`);
    return response.data;
};

export const getBookmarks = async (): Promise<any[]> => {
    const response = await api.get('/bookmarks');
    return response.data;
};

// ============ COMMENTS ============

export const createComment = async (postId: string, content: string): Promise<Comment> => {
    const response = await api.post(`/posts/${postId}/comments`, { content });
    return response.data;
};

export const getComments = async (postId: string, page = 1, limit = 20): Promise<CommentsResponse> => {
    const response = await api.get(`/posts/${postId}/comments`, { params: { page, limit } });
    return response.data;
};

export const deleteComment = async (commentId: string): Promise<void> => {
    await api.delete(`/posts/comments/${commentId}`);
};

// ============ TIPS ============

export const sendTip = async (creatorId: string, amount: number): Promise<void> => {
    await api.post('/payments/tip', { creatorId, amount });
};
