import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [messages, setMessages] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState({
    totals: { debit: 0, credit: 0, net: 0 },
    monthlySpending: [],
    categoryInsights: [],
  });
  const [reminders, setReminders] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: null, lastUpdated: null });

  const handleApiError = (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    setStatus((prev) => ({ ...prev, loading: false, error: message }));
  };

  const updateStateFromResponse = (data) => {
    setTransactions(data.transactions);
    setInsights(data.insights);
    setReminders(data.reminders || []);
    setStatus((prev) => ({
      ...prev,
      loading: false,
      error: null,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const parseMessages = useCallback(async () => {
    if (!messages.trim()) {
      setStatus((prev) => ({ ...prev, error: 'Paste at least one SMS message to parse.' }));
      return;
    }
    setStatus((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/parse`, { messages });
      updateStateFromResponse(data);
    } catch (error) {
      handleApiError(error);
    }
  }, [messages]);

  const loadSampleMessages = useCallback(async () => {
    setStatus((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/sample`);
      setMessages(data.messages.join('\n'));
      updateStateFromResponse(data);
    } catch (error) {
      handleApiError(error);
    }
  }, []);

  const value = useMemo(
    () => ({
      messages,
      setMessages,
      transactions,
      insights,
      reminders,
      status,
      parseMessages,
      loadSampleMessages,
      apiBaseUrl: API_BASE_URL,
    }),
    [messages, transactions, insights, reminders, status, parseMessages, loadSampleMessages],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
}

