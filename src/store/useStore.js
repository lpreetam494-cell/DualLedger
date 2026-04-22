import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const storedUser = JSON.parse(localStorage.getItem('user'));
if (storedUser && storedUser.token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${storedUser.token}`;
}

export const useStore = create((set, get) => ({
  user: storedUser || null,
  expenses: [],
  insights: null,
  splitBalances: null,
  groups: [],
  friends: [],
  pendingRequests: [],
  notifications: [],
  recurringExpenses: [],
  loading: false,
  error: null,
  theme: localStorage.getItem('theme') || 'light',
  currency: JSON.parse(localStorage.getItem('currency')) || { label: 'USD ($)', symbol: '$' },
  isNotificationsOpen: false,

  toggleNotifications: () => set((state) => ({ isNotificationsOpen: !state.isNotificationsOpen })),

  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    return { theme: newTheme };
  }),

  setCurrency: (newCurrency) => {
    localStorage.setItem('currency', JSON.stringify(newCurrency));
    set({ currency: newCurrency });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      set({ user: userData, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      set({ user: userData, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, expenses: [], insights: null, splitBalances: null, recurringExpenses: [] });
  },

  fetchExpenses: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      let query = '';
      if (startDate && endDate) query = `?startDate=${startDate}&endDate=${endDate}`;
      const response = await axios.get(`${API_URL}/expenses${query}`);
      set({ expenses: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addExpense: async (expenseData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/expenses`, expenseData);
      set((state) => ({ 
        expenses: [response.data, ...state.expenses],
        loading: false 
      }));
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  deleteExpense: async (id) => {
    try {
      await axios.delete(`${API_URL}/expenses/${id}`);
      set((state) => ({ expenses: state.expenses.filter(e => e._id !== id) }));
      // Re-fetch totals to keep UI in sync
      get().fetchInsights();
      get().fetchSplitBalances();
      return true;
    } catch (error) {
      console.error('Failed to delete expense:', error);
      return false;
    }
  },

  fetchInsights: async (startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      let query = '';
      if (startDate && endDate) query = `?startDate=${startDate}&endDate=${endDate}`;
      const response = await axios.get(`${API_URL}/expenses/insights${query}`);
      set({ insights: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchSplitBalances: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/expenses/splits/balances`);
      set({ splitBalances: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updatePreferences: async (newPreferences) => {
    try {
      const response = await axios.put(`${API_URL}/auth/preferences`, newPreferences);
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData });
      return true;
    } catch (error) {
      console.error("Failed to update preferences:", error);
      return false;
    }
  },

  fetchGroups: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/groups`);
      set({ groups: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createGroup: async (groupData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/groups`, groupData);
      set((state) => ({ groups: [...state.groups, response.data], loading: false }));
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  fetchFriends: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/users/friends`);
      set({ 
        friends: response.data.friends, 
        pendingRequests: response.data.pendingRequests,
        loading: false 
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  sendFriendRequest: async (targetUserId) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${API_URL}/users/friend-request`, { targetUserId });
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      return false;
    }
  },

  acceptFriendRequest: async (targetUserId) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${API_URL}/users/friend-request/accept`, { targetUserId });
      // Just re-fetch friends list. `this` doesn't work well in Zustand without `get()` but we can just use `useStore.getState().fetchFriends()`
      // Actually `get().fetchFriends()` is correct within a Zustand action if we change the top to `(set, get) =>`.
      // Let's modify the signature if needed or just use `get`. Wait, `get` is not destructured. Let's just fetch directly here.
      const response = await axios.get(`${API_URL}/users/friends`);
      set({ friends: response.data.friends, pendingRequests: response.data.pendingRequests, loading: false });
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  rejectFriendRequest: async (targetUserId) => {
      set({ loading: true, error: null });
      try {
        await axios.post(`${API_URL}/users/friend-request/reject`, { targetUserId });
        const response = await axios.get(`${API_URL}/users/friends`);
        set({ friends: response.data.friends, pendingRequests: response.data.pendingRequests, loading: false });
        return true;
      } catch (error) {
        set({ error: error.message, loading: false });
        return false;
      }
  },

  searchUsers: async (email) => {
    try {
      const response = await axios.get(`${API_URL}/users/search?email=${email}`);
      return response.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  fetchNotifications: async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications`);
      set({ notifications: response.data });
    } catch (error) {
      console.error(error);
    }
  },

  markNotificationAsRead: async (id) => {
    try {
      await axios.put(`${API_URL}/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        )
      }));
    } catch (error) {
      console.error(error);
    }
  },

  fetchRecurringExpenses: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/recurring`);
      set({ recurringExpenses: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addRecurringExpense: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/recurring`, data);
      set((state) => ({ recurringExpenses: [...state.recurringExpenses, response.data], loading: false }));
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  deleteRecurringExpense: async (id) => {
    try {
      await axios.delete(`${API_URL}/recurring/${id}`);
      set((state) => ({ recurringExpenses: state.recurringExpenses.filter(r => r._id !== id) }));
    } catch (error) {
      console.error(error);
    }
  }
}));
