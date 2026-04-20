import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useStore = create((set) => ({
  expenses: [],
  insights: null,
  splitBalances: null,
  loading: false,
  error: null,
  theme: localStorage.getItem('theme') || 'light',
  currency: JSON.parse(localStorage.getItem('currency')) || { label: 'USD ($)', symbol: '$' },

  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    return { theme: newTheme };
  }),

  setCurrency: (newCurrency) => {
    localStorage.setItem('currency', JSON.stringify(newCurrency));
    set({ currency: newCurrency });
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
      const response = await axios.get(`${API_URL}/splits/balances`);
      set({ splitBalances: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));
