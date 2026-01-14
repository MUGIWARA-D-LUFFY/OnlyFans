import api from './api';

export const paymentService = {
  subscribe: async (creatorId: string) => {
    const response = await api.post(`/payments/subscribe/${creatorId}`);
    return response.data;
  },

  tip: async (creatorId: string, amount: number) => {
    const response = await api.post(`/payments/tip/${creatorId}`, { amount });
    return response.data;
  },

  ppv: async (postId: string) => {
    const response = await api.post(`/payments/ppv/${postId}`);
    return response.data;
  },

  paidMessage: async (messageId: string) => {
    const response = await api.post(`/payments/message/${messageId}`);
    return response.data;
  },

  getTransactions: async () => {
    const response = await api.get('/payments/transactions');
    return response.data;
  },
};


