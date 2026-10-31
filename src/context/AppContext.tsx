import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Category, Expense, PaymentMethod, UserProfile } from '../types';
import { PREDEFINED_CATEGORIES, TRANSLATIONS } from '../utils/constants';

interface AppContextType {
  expenses: Expense[];
  categories: Category[];
  user: UserProfile;
  language: 'en' | 'hi';
  t: typeof TRANSLATIONS['en'];
  setLanguage: (lang: 'en' | 'hi') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  syncStatus: 'synced' | 'pending' | 'syncing' | 'offline';
  pendingSyncCount: number;
  isOnline: boolean;
  isLocked: boolean;
  unlockWithPin: (pin: string) => boolean;
  addExpense: (data: {
    amount: number;
    categoryId: string;
    date: string;
    time: string;
    paymentMethod: PaymentMethod;
    description: string;
  }) => Promise<Expense>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCustomCategory: (name: string, nameHi?: string, icon?: string, color?: string) => Promise<Category>;
  updateMonthlyBudget: (amount: number) => void;
  updateCategoryBudget: (categoryId: string, limit: number) => void;
  syncNow: () => Promise<void>;
  exportBackupJSON: () => string;
  restoreBackupJSON: (jsonStr: string) => boolean;
  resetAllData: () => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean | ((prev: boolean) => boolean)) => void;
  playHapticSound: (type?: 'click' | 'success' | 'delete') => void;
  activeTab: 'home' | 'add' | 'history' | 'reports' | 'settings';
  setActiveTab: (tab: 'home' | 'add' | 'history' | 'reports' | 'settings') => void;
  editingExpense: Expense | null;
  setEditingExpense: (exp: Expense | null) => void;
}

const STORAGE_KEYS = {
  USER: 'smart_kharcha_user_v1',
  EXPENSES: 'smart_kharcha_expenses_v1',
  CATEGORIES: 'smart_kharcha_categories_v1',
  SETTINGS: 'smart_kharcha_settings_v1',
};

// Initial realistic default expenses for India in late October 2026
const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-seed-1',
    userId: 'user-default',
    amount: 1450,
    categoryId: 'grocery',
    date: '2026-10-30',
    time: '10:45',
    paymentMethod: 'upi',
    description: 'Blinkit Monthly Grocery staples & spices',
    createdAt: '2026-10-30T10:45:00.000Z',
    updatedAt: '2026-10-30T10:45:00.000Z',
    synced: true,
  },
  {
    id: 'exp-seed-2',
    userId: 'user-default',
    amount: 110,
    categoryId: 'milk',
    date: '2026-10-30',
    time: '07:15',
    paymentMethod: 'cash',
    description: 'Amul Taaza 2 Litres',
    createdAt: '2026-10-30T07:15:00.000Z',
    updatedAt: '2026-10-30T07:15:00.000Z',
    synced: true,
  },
  {
    id: 'exp-seed-3',
    userId: 'user-default',
    amount: 550,
    categoryId: 'petrol',
    date: '2026-10-29',
    time: '18:30',
    paymentMethod: 'upi',
    description: 'HP Petrol Pump IndianOil 5L',
    createdAt: '2026-10-29T18:30:00.000Z',
    updatedAt: '2026-10-29T18:30:00.000Z',
    synced: true,
  },
  {
    id: 'exp-seed-4',
    userId: 'user-default',
    amount: 280,
    categoryId: 'vegetables',
    date: '2026-10-29',
    time: '19:40',
    paymentMethod: 'cash',
    description: 'Local Mandi Potatoes, Onions, Coriander',
    createdAt: '2026-10-29T19:40:00.000Z',
    updatedAt: '2026-10-29T19:40:00.000Z',
    synced: true,
  },
  {
    id: 'exp-seed-5',
    userId: 'user-default',
    amount: 450,
    categoryId: 'food',
    date: '2026-10-28',
    time: '13:20',
    paymentMethod: 'upi',
    description: 'Office lunch Punjabi Thali',
    createdAt: '2026-10-28T13:20:00.000Z',
    updatedAt: '2026-10-28T13:20:00.000Z',
    synced: true,
  },
  {
    id: 'exp-seed-6',
    userId: 'user-default',
    amount: 299,
    categoryId: 'mobile_recharge',
    date: '2026-10-26',
    time: '11:10',
    paymentMethod: 'upi',
    description: 'Jio 5G 1.5GB/day 28-day Plan',
    createdAt: '2026-10-26T11:10:00.000Z',
    updatedAt: '2026-10-26T11:10:00.000Z',
    synced: true,
  },
  {
    id: 'exp-seed-7',
    userId: 'user-default',
    amount: 1850,
    categoryId: 'electricity_bill',
    date: '2026-10-20',
    time: '14:00',
    paymentMethod: 'debit_card',
    description: 'State Electricity Board Bill',
    createdAt: '2026-10-20T14:00:00.000Z',
    updatedAt: '2026-10-20T14:00:00.000Z',
    synced: true,
  },
  {
    id: 'exp-seed-8',
    userId: 'user-default',
    amount: 850,
    categoryId: 'gas_cylinder',
    date: '2026-10-14',
    time: '16:00',
    paymentMethod: 'cash',
    description: 'Indane LPG 14.2kg Refill',
    createdAt: '2026-10-14T16:00:00.000Z',
    updatedAt: '2026-10-14T16:00:00.000Z',
    synced: true,
  },
  {
    id: 'exp-seed-9',
    userId: 'user-default',
    amount: 16000,
    categoryId: 'rent',
    date: '2026-10-02',
    time: '09:00',
    paymentMethod: 'bank_transfer',
    description: 'Apartment monthly rent transfer',
    createdAt: '2026-10-02T09:00:00.000Z',
    updatedAt: '2026-10-02T09:00:00.000Z',
    synced: true,
  },
  {
    id: 'exp-seed-10',
    userId: 'user-default',
    amount: 799,
    categoryId: 'internet_bill',
    date: '2026-10-05',
    time: '15:30',
    paymentMethod: 'credit_card',
    description: 'Airtel Xstream Fiber 100Mbps',
    createdAt: '2026-10-05T15:30:00.000Z',
    updatedAt: '2026-10-05T15:30:00.000Z',
    synced: true,
  },
  {
    id: 'exp-seed-11',
    userId: 'user-default',
    amount: 620,
    categoryId: 'medical',
    date: '2026-10-12',
    time: '18:50',
    paymentMethod: 'upi',
    description: 'Apollo Pharmacy vitamins and syrup',
    createdAt: '2026-10-12T18:50:00.000Z',
    updatedAt: '2026-10-12T18:50:00.000Z',
    synced: true,
  },
];

const DEFAULT_USER: UserProfile = {
  id: 'user-default',
  name: 'Ayush Sharma',
  email: 'ayush.sharma@example.com',
  currencySymbol: '₹',
  language: 'en',
  theme: 'light',
  monthlyBudget: 35000,
  categoryBudgets: {
    grocery: 6000,
    petrol: 3000,
    food: 4000,
    electricity_bill: 2500,
    rent: 16000,
  },
  pinEnabled: false,
  createdAt: '2026-10-01T00:00:00.000Z',
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'home' | 'add' | 'history' | 'reports' | 'settings'>('home');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // User state
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_USER;
  });

  // Language state
  const [language, setLanguageState] = useState<'en' | 'hi'>(user.language || 'en');
  const t = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS.en, [language]);

  const setLanguage = (lang: 'en' | 'hi') => {
    setLanguageState(lang);
    setUser(prev => ({ ...prev, language: lang }));
  };

  // Theme state
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('smart_kharcha_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('smart_kharcha_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  // Mobile frame simulator vs responsive desktop
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);

  // Security PIN lock
  const [isLocked, setIsLocked] = useState<boolean>(user.pinEnabled);

  const unlockWithPin = (pin: string): boolean => {
    if (!user.pinEnabled || user.pinCode === pin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return PREDEFINED_CATEGORIES;
  });

  // Expenses
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_EXPENSES;
  });

  // Online / Offline Status
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing' | 'offline'>(
    isOnline ? 'synced' : 'offline'
  );
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Listen to network changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      setTimeout(() => {
        setSyncStatus('synced');
        setPendingSyncCount(0);
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch {
      // ignore
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  // Audio synthesizer for subtle tactile haptics
  const playHapticSound = (type: 'click' | 'success' | 'delete' = 'click') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'click') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'delete') {
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch {
      // audio disabled/blocked
    }
  };

  // Add Expense
  const addExpense = async (data: {
    amount: number;
    categoryId: string;
    date: string;
    time: string;
    paymentMethod: PaymentMethod;
    description: string;
  }): Promise<Expense> => {
    const newExpense: Expense = {
      id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId: user.id,
      amount: Math.round(data.amount * 100) / 100,
      categoryId: data.categoryId,
      date: data.date,
      time: data.time || '12:00',
      paymentMethod: data.paymentMethod,
      description: data.description.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: isOnline,
    };

    setExpenses(prev => [newExpense, ...prev]);

    if (!isOnline) {
      setSyncStatus('pending');
      setPendingSyncCount(c => c + 1);
    } else {
      setSyncStatus('synced');
    }

    playHapticSound('success');
    return newExpense;
  };

  // Update Expense
  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    setExpenses(prev =>
      prev.map(exp => {
        if (exp.id === id) {
          return {
            ...exp,
            ...updates,
            updatedAt: new Date().toISOString(),
            synced: isOnline,
          };
        }
        return exp;
      })
    );

    if (!isOnline) {
      setSyncStatus('pending');
      setPendingSyncCount(c => c + 1);
    }
    playHapticSound('click');
  };

  // Delete Expense
  const deleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    playHapticSound('delete');
  };

  // Add Custom Category
  const addCustomCategory = async (name: string, nameHi?: string, icon = 'Layers', color = '#10b981'): Promise<Category> => {
    const id = 'custom_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString(36);
    const newCat: Category = {
      id,
      name,
      nameHi: nameHi || name,
      icon,
      color,
      isCustom: true,
    };

    setCategories(prev => [...prev, newCat]);
    playHapticSound('success');
    return newCat;
  };

  // Budget Updates
  const updateMonthlyBudget = (amount: number) => {
    setUser(prev => ({
      ...prev,
      monthlyBudget: amount,
    }));
    playHapticSound('click');
  };

  const updateCategoryBudget = (categoryId: string, limit: number) => {
    setUser(prev => ({
      ...prev,
      categoryBudgets: {
        ...prev.categoryBudgets,
        [categoryId]: limit,
      },
    }));
    playHapticSound('click');
  };

  // Cloud sync action
  const syncNow = async () => {
    setSyncStatus('syncing');
    await new Promise(r => setTimeout(r, 800));
    setExpenses(prev => prev.map(e => ({ ...e, synced: true })));
    setSyncStatus('synced');
    setPendingSyncCount(0);
    playHapticSound('success');
  };

  // Export JSON backup
  const exportBackupJSON = (): string => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user,
      categories,
      expenses,
    };
    return JSON.stringify(backup, null, 2);
  };

  // Restore JSON backup
  const restoreBackupJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data && Array.isArray(data.expenses)) {
        if (data.user) setUser(data.user);
        if (Array.isArray(data.categories)) setCategories(data.categories);
        setExpenses(data.expenses);
        playHapticSound('success');
        return true;
      }
    } catch (e) {
      console.error('Failed to parse backup JSON', e);
    }
    return false;
  };

  // Full data wipe
  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    setUser(DEFAULT_USER);
    setCategories(PREDEFINED_CATEGORIES);
    setExpenses([]);
    playHapticSound('delete');
  };

  return (
    <AppContext.Provider
      value={{
        expenses,
        categories,
        user,
        language,
        t,
        setLanguage,
        theme,
        setTheme,
        toggleTheme,
        syncStatus,
        pendingSyncCount,
        isOnline,
        isLocked,
        unlockWithPin,
        addExpense,
        updateExpense,
        deleteExpense,
        addCustomCategory,
        updateMonthlyBudget,
        updateCategoryBudget,
        syncNow,
        exportBackupJSON,
        restoreBackupJSON,
        resetAllData,
        isMobileFrame,
        setIsMobileFrame,
        playHapticSound,
        activeTab,
        setActiveTab,
        editingExpense,
        setEditingExpense,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
