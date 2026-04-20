import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const storedUser = JSON.parse(localStorage.getItem('user'));
if (storedUser && storedUser.token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${storedUser.token}`;
}

export const useStore = create((set) => ({
  user: storedUser || null,
  expenses: [],
  insights: null,
  splitBalances: null,
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
    set({ user: null, expenses: [], insights: null, splitBalances: null });
  },

  fetchExpenses: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/expenses`);
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

  fetchInsights: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/expenses/insights`);
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
  }
}));
