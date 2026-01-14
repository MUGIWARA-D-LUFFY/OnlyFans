import api from './api';

export interface Subscription {
  id: string;
  userId: string;
  creatorId: string;
  expiresAt: string;
  createdAt: string;
  creator: {
    id: string;
    subscriptionFee: number;
    user: {
      id: string;
      username: string;
    };
  };
}

export const subscriptionService = {
  subscribe: async (creatorId: string): Promise<Subscription> => {
    const response = await api.post(`/subscriptions/${creatorId}`);
    return response.data;
  },

  unsubscribe: async (creatorId: string) => {
    const response = await api.delete(`/subscriptions/${creatorId}`);
    return response.data;
  },

  getUserSubscriptions: async (): Promise<Subscription[]> => {
    const response = await api.get('/subscriptions');
    return response.data;
  },
};


