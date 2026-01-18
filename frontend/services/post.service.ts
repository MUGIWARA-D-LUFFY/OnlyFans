import api from './api';

export interface Post {
  id: string;
  creatorId: string;
  title?: string;
  mediaUrl: string;
  mediaType: string;
  isPaid: boolean;
  price?: number;
  visibility: 'PUBLIC' | 'SUBSCRIBERS' | 'PAID';
  createdAt: string;
  creator: {
    id: string;
    user: {
      id: string;
      username: string;
      avatarUrl?: string;
    };
  };
  // Access control fields from API
  isLocked?: boolean;
  accessLevel?: 'FREE' | 'SUBSCRIBER' | 'PPV';
  hasPurchased?: boolean;
}

export interface CreatePostData {
  title?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  isPaid?: boolean;
  price?: number;
  visibility?: 'PUBLIC' | 'SUBSCRIBERS' | 'PAID';
}

export const postService = {
  getFeed: async (page: number = 1, limit: number = 20) => {
    const response = await api.get('/posts/feed', {
      params: { page, limit },
    });
    return response.data;
  },

  getPost: async (postId: string): Promise<Post> => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  getCreatorPosts: async (creatorId: string, page: number = 1, limit: number = 20) => {
    const response = await api.get(`/posts/creator/${creatorId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  createPost: async (creatorId: string, data: CreatePostData): Promise<Post> => {
    const response = await api.post(`/posts/creator/${creatorId}`, data);
    return response.data;
  },

  deletePost: async (postId: string) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },
};


