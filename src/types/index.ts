/**
 * Smart Kharcha - Types & Interfaces
 */

export type PaymentMethod = 
  | 'cash' 
  | 'upi' 
  | 'debit_card' 
  | 'credit_card' 
  | 'bank_transfer' 
  | 'other';

export interface Category {
  id: string;
  name: string;
  nameHi: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  paymentMethod: PaymentMethod;
  description: string;
  createdAt: string;
  updatedAt: string;
  synced?: boolean;
}

export type DatePeriod = 
  | 'today'
  | 'yesterday'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'half_yearly'
  | 'yearly'
  | 'previous_month'
  | 'previous_year'
  | 'all'
  | 'custom';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  currencySymbol: string;
  language: 'en' | 'hi';
  theme: 'light' | 'dark' | 'system';
  monthlyBudget: number;
  categoryBudgets: Record<string, number>;
  pinEnabled: boolean;
  pinCode?: string;
  createdAt: string;
}

export interface DashboardStats {
  todayTotal: number;
  yesterdayTotal: number;
  thisWeekTotal: number;
  thisMonthTotal: number;
  thisQuarterTotal: number;
  thisYearTotal: number;
  overallTotal: number;
  totalTransactions: number;
  highestCategory: {
    categoryId: string;
    categoryName: string;
    categoryNameHi: string;
    amount: number;
    percentage: number;
  } | null;
}

export interface CategoryStat {
  category: Category;
  totalAmount: number;
  count: number;
  percentage: number;
}
