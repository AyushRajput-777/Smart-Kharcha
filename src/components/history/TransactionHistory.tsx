import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DatePeriod, Expense } from '../../types';
import { PAYMENT_METHODS } from '../../utils/constants';
import { 
  filterExpensesByPeriod, 
  formatIndianCurrency, 
  groupExpensesByDate, 
  toISODateString 
} from '../../utils/calculations';
import { CategoryIcon } from '../common/CategoryIcon';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Calendar, 
  Trash2, 
  Edit3, 
  X,
  CreditCard
} from 'lucide-react';

export const TransactionHistory: React.FC = () => {
  const { 
    expenses, 
    categories, 
    t, 
    language, 
    deleteExpense, 
    setEditingExpense, 
    setActiveTab, 
    playHapticSound 
  } = useApp();

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Date period filter
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriod>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [showCustomRange, setShowCustomRange] = useState<boolean>(false);

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Payment method filter
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');

  // Sort order
  const [sortOrder, setSortOrder] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered expenses calculation
  const filteredExpenses = useMemo(() => {
    // 1. Period filter
    let list = filterExpensesByPeriod(
      expenses, 
      selectedPeriod, 
      customStart || undefined, 
      customEnd || undefined
    );

    // 2. Category filter
    if (selectedCategory !== 'all') {
      list = list.filter(e => e.categoryId === selectedCategory);
    }

    // 3. Payment method filter
    if (selectedPaymentMethod !== 'all') {
      list = list.filter(e => e.paymentMethod === selectedPaymentMethod);
    }

    // 4. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => {
        const descMatch = (e.description || '').toLowerCase().includes(q);
        const cat = categories.find(c => c.id === e.categoryId);
        const catMatch = cat && (cat.name.toLowerCase().includes(q) || cat.nameHi?.toLowerCase().includes(q));
        const amountMatch = e.amount.toString().includes(q);
        return descMatch || catMatch || amountMatch;
      });
    }

    // 5. Sorting
    list = [...list].sort((a, b) => {
      if (sortOrder === 'amount_desc') return b.amount - a.amount;
      if (sortOrder === 'amount_asc') return a.amount - b.amount;
      if (sortOrder === 'date_asc') {
        const dc = (a.date || '').localeCompare(b.date || '');
        if (dc !== 0) return dc;
        return (a.time || '').localeCompare(b.time || '');
      }
      // default: date_desc
      const dc = (b.date || '').localeCompare(a.date || '');
      if (dc !== 0) return dc;
      return (b.time || '').localeCompare(a.time || '');
    });

    return list;
  }, [
    expenses, 
    selectedPeriod, 
    customStart, 
    customEnd, 
    selectedCategory, 
    selectedPaymentMethod, 
    searchQuery, 
    sortOrder, 
    categories
  ]);

  // Grouped by date (for date-grouped view)
  const groupedList = useMemo(() => {
    if (sortOrder.startsWith('amount_')) {
      // If sorting by amount, show single flat list
      return [{
        date: 'all',
        displayDate: t.history,
        totalAmount: filteredExpenses.reduce((s, e) => s + e.amount, 0),
        expenses: filteredExpenses,
      }];
    }
    return groupExpensesByDate(filteredExpenses);
  }, [filteredExpenses, sortOrder, t.history]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  const confirmDeleteExpense = async () => {
    if (deletingId) {
      await deleteExpense(deletingId);
      setDeletingId(null);
    }
  };

  const periodOptions: { id: DatePeriod; label: string }[] = [
    { id: 'all', label: t.allTime },
    { id: 'today', label: t.today },
    { id: 'yesterday', label: t.yesterday },
    { id: 'weekly', label: t.weekly },
    { id: 'monthly', label: t.monthly },
    { id: 'previous_month', label: t.previousMonth },
    { id: 'quarterly', label: t.quarterly },
    { id: 'half_yearly', label: t.halfYearly },
    { id: 'yearly', label: t.yearly },
    { id: 'previous_year', label: t.previousYear },
    { id: 'custom', label: t.customRange },
  ];

  return (
    <div className="space-y-4 pb-6">
      {/* Header and Summary Total */}
      <div className="bg-emerald-700 text-white p-4 rounded-3xl shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-emerald-100 font-medium">
            {t.history} ({filteredExpenses.length} {t.totalTransactions})
          </span>
          <span className="text-xs bg-emerald-800/80 px-2 py-0.5 rounded-full text-emerald-100">
            {periodOptions.find(p => p.id === selectedPeriod)?.label}
          </span>
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums">
          {formatIndianCurrency(totalFilteredAmount)}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Filter Horizontal Bar: Period Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {periodOptions.map(period => (
          <button
            key={period.id}
            onClick={() => {
              playHapticSound('click');
              setSelectedPeriod(period.id);
              if (period.id === 'custom') {
                setShowCustomRange(true);
              } else {
                setShowCustomRange(false);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedPeriod === period.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Custom Date Picker Accordion if selected */}
      {(showCustomRange || selectedPeriod === 'custom') && (
        <div className="bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-2xl p-3 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <Calendar size={14} />
            <span>{t.customRange} (DD-MM-YYYY)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                {t.startDate}
              </label>
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">
                {t.endDate}
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Filters (Category, Payment Method, Sort) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={e => {
            playHapticSound('click');
            setSelectedCategory(e.target.value);
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden truncate"
        >
          <option value="all">{t.allCategories}</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {language === 'hi' ? cat.nameHi || cat.name : cat.name}
            </option>
          ))}
        </select>

        {/* Payment Method Filter */}
        <select
          value={selectedPaymentMethod}
          onChange={e => {
            playHapticSound('click');
            setSelectedPaymentMethod(e.target.value);
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden truncate"
        >
          <option value="all">{t.allPaymentMethods}</option>
          {PAYMENT_METHODS.map(m => (
            <option key={m.id} value={m.id}>
              {language === 'hi' ? m.nameHi.split(' ')[0] : m.name}
            </option>
          ))}
        </select>

        {/* Sort Order */}
        <select
          value={sortOrder}
          onChange={e => {
            playHapticSound('click');
            setSortOrder(e.target.value as any);
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden truncate"
        >
          <option value="date_desc">{t.newestFirst}</option>
          <option value="date_asc">{t.oldestFirst}</option>
          <option value="amount_desc">{t.highestAmount}</option>
          <option value="amount_asc">{t.lowestAmount}</option>
        </select>
      </div>

      {/* Transaction List (Grouped by Date) */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t.noExpenses}
          </p>
          <p className="text-[11px] text-slate-400">
            {t.noExpensesDesc}
          </p>
          <button
            onClick={() => setActiveTab('add')}
            className="mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            {t.addExpense}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedList.map(group => (
            <div key={group.date} className="space-y-1.5">
              {/* Day Header with Date and Day Total */}
              {group.date !== 'all' && (
                <div className="flex items-center justify-between px-2 pt-1 text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>{group.displayDate}</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {formatIndianCurrency(group.totalAmount)}
                  </span>
                </div>
              )}

              {/* Day Transactions */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 shadow-xs overflow-hidden">
                {group.expenses.map(exp => {
                  const cat = categories.find(c => c.id === exp.categoryId);
                  return (
                    <div
                      key={exp.id}
                      className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors"
                    >
                      {/* Left: Category Icon & Details */}
                      <div className="flex items-center gap-3 min-w-0">
                        <CategoryIcon
                          iconName={cat?.icon}
                          color={cat?.color}
                          size={18}
                          className="w-10 h-10"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {language === 'hi' ? cat?.nameHi || cat?.name : cat?.name || exp.categoryId}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                            {exp.time && <span>{exp.time}</span>}
                            {exp.description && <span>· {exp.description}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount, Payment Method, Actions */}
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900 dark:text-white font-mono tabular-nums block">
                            {formatIndianCurrency(exp.amount)}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-medium">
                            {exp.paymentMethod}
                          </span>
                        </div>

                        {/* Quick Edit Button */}
                        <button
                          onClick={() => {
                            playHapticSound('click');
                            setEditingExpense(exp);
                            setActiveTab('add');
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          title={t.edit}
                        >
                          <Edit3 size={15} />
                        </button>

                        {/* Quick Delete Button */}
                        <button
                          onClick={() => {
                            playHapticSound('click');
                            setDeletingId(exp.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title={t.delete}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.delete}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t.confirmDelete}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={confirmDeleteExpense}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
