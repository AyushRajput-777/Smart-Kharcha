import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatIndianCurrency,
  formatDateDDMMYYYY,
  filterExpensesByPeriod,
  calculateDashboardStats,
  calculateBudgetStatus,
  generateCSV,
  groupExpensesByDate,
} from './calculations';
import { Expense } from '../types';

const mockExpenses: Expense[] = [
  {
    id: 'exp-1',
    userId: 'user-1',
    amount: 500,
    categoryId: 'petrol',
    date: '2026-10-30',
    time: '09:30',
    paymentMethod: 'upi',
    description: 'Fuel for bike',
    createdAt: '2026-10-30T09:30:00Z',
    updatedAt: '2026-10-30T09:30:00Z',
  },
  {
    id: 'exp-2',
    userId: 'user-1',
    amount: 350,
    categoryId: 'food',
    date: '2026-10-30',
    time: '13:00',
    paymentMethod: 'cash',
    description: 'Lunch thali',
    createdAt: '2026-10-30T13:00:00Z',
    updatedAt: '2026-10-30T13:00:00Z',
  },
  {
    id: 'exp-3',
    userId: 'user-1',
    amount: 1200,
    categoryId: 'grocery',
    date: '2026-10-29',
    time: '18:15',
    paymentMethod: 'debit_card',
    description: 'Weekly grocery ration',
    createdAt: '2026-10-29T18:15:00Z',
    updatedAt: '2026-10-29T18:15:00Z',
  },
  {
    id: 'exp-4',
    userId: 'user-1',
    amount: 15000,
    categoryId: 'rent',
    date: '2026-10-01',
    time: '10:00',
    paymentMethod: 'bank_transfer',
    description: 'House rent',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'exp-5',
    userId: 'user-1',
    amount: 2500,
    categoryId: 'electricity_bill',
    date: '2026-09-15',
    time: '11:00',
    paymentMethod: 'upi',
    description: 'Electricity bill Sept',
    createdAt: '2026-09-15T11:00:00Z',
    updatedAt: '2026-09-15T11:00:00Z',
  },
];

const refDate = new Date('2026-10-30T10:00:00Z');

test('formatIndianCurrency formats numbers according to Indian numbering system', () => {
  assert.equal(formatIndianCurrency(0), '₹0');
  assert.equal(formatIndianCurrency(500), '₹500');
  assert.equal(formatIndianCurrency(1500), '₹1,500');
  assert.equal(formatIndianCurrency(125000), '₹1,25,000');
  assert.equal(formatIndianCurrency(10000000), '₹1,00,00,000');
});

test('formatDateDDMMYYYY formats date properly', () => {
  assert.equal(formatDateDDMMYYYY('2026-10-30'), '30-10-2026');
  assert.equal(formatDateDDMMYYYY('2026-01-05'), '05-01-2026');
});

test('filterExpensesByPeriod filters expenses accurately', () => {
  const today = filterExpensesByPeriod(mockExpenses, 'today', undefined, undefined, refDate);
  assert.equal(today.length, 2);
  assert.equal(today.reduce((s, e) => s + e.amount, 0), 850);

  const yesterday = filterExpensesByPeriod(mockExpenses, 'yesterday', undefined, undefined, refDate);
  assert.equal(yesterday.length, 1);
  assert.equal(yesterday[0].amount, 1200);

  const thisMonth = filterExpensesByPeriod(mockExpenses, 'monthly', undefined, undefined, refDate);
  assert.equal(thisMonth.length, 4);
  assert.equal(thisMonth.reduce((s, e) => s + e.amount, 0), 17050);

  const prevMonth = filterExpensesByPeriod(mockExpenses, 'previous_month', undefined, undefined, refDate);
  assert.equal(prevMonth.length, 1);
  assert.equal(prevMonth[0].amount, 2500);
});

test('calculateDashboardStats calculates all required financial totals correctly', () => {
  const stats = calculateDashboardStats(mockExpenses, refDate);
  assert.equal(stats.todayTotal, 850);
  assert.equal(stats.yesterdayTotal, 1200);
  assert.equal(stats.thisMonthTotal, 17050);
  assert.equal(stats.overallTotal, 19550);
  assert.equal(stats.totalTransactions, 5);
  assert.ok(stats.highestCategory);
  assert.equal(stats.highestCategory?.categoryId, 'rent');
  assert.equal(stats.highestCategory?.amount, 15000);
});

test('calculateBudgetStatus determines safety, warning and danger zones correctly', () => {
  const safe = calculateBudgetStatus(50000, 20000);
  assert.equal(safe.status, 'safe');
  assert.equal(safe.remaining, 30000);
  assert.equal(safe.percentage, 40);

  const warning = calculateBudgetStatus(10000, 8500);
  assert.equal(warning.status, 'warning');
  assert.equal(warning.remaining, 1500);

  const danger = calculateBudgetStatus(10000, 11200);
  assert.equal(danger.status, 'danger');
  assert.equal(danger.isOverBudget, true);
});

test('groupExpensesByDate groups and sorts by date properly', () => {
  const groups = groupExpensesByDate(mockExpenses);
  assert.equal(groups.length, 4); // 4 distinct dates
  assert.equal(groups[0].date, '2026-10-30');
  assert.equal(groups[0].totalAmount, 850);
  assert.equal(groups[0].expenses.length, 2);
});

test('generateCSV outputs valid RFC4180 CSV with BOM', () => {
  const csv = generateCSV(mockExpenses, []);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('Date (DD-MM-YYYY)'));
  assert.ok(csv.includes('30-10-2026'));
  assert.ok(csv.includes('Fuel for bike'));
});
