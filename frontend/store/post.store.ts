import { create } from 'zustand';
import { postService, Post } from '../services/post.service';

interface PostState {
  posts: Post[];
  isLoading: boolean;
  fetchFeed: (page?: number, limit?: number) => Promise<void>;
  clearPosts: () => void;
}

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  isLoading: false,

  fetchFeed: async (page = 1, limit = 20) => {
    set({ isLoading: true });
    try {
      const data = await postService.getFeed(page, limit);
      set({ posts: data.posts, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  clearPosts: () => {
    set({ posts: [] });
  },
}));


