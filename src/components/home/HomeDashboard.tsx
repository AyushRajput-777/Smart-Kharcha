import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  calculateDashboardStats, 
  formatIndianCurrency, 
  calculateBudgetStatus, 
  formatDateDDMMYYYY 
} from '../../utils/calculations';
import { CategoryIcon } from '../common/CategoryIcon';
import { 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles,
  ArrowUpRight,
  Plus
} from 'lucide-react';

export const HomeDashboard: React.FC = () => {
  const { 
    expenses, 
    categories, 
    user, 
    t, 
    language, 
    setActiveTab, 
    setEditingExpense,
    playHapticSound 
  } = useApp();

  // Reference date: late October 2026 (matching system metadata)
  const now = useMemo(() => new Date(), []);

  // Compute all dashboard stats automatically from expenses
  const stats = useMemo(() => {
    return calculateDashboardStats(expenses, now, categories);
  }, [expenses, now, categories]);

  // Monthly budget status
  const budgetInfo = useMemo(() => {
    return calculateBudgetStatus(user.monthlyBudget, stats.thisMonthTotal);
  }, [user.monthlyBudget, stats.thisMonthTotal]);

  // Recent 5 transactions
  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => {
        const dateComp = (b.date || '').localeCompare(a.date || '');
        if (dateComp !== 0) return dateComp;
        return (b.time || '').localeCompare(a.time || '');
      })
      .slice(0, 5);
  }, [expenses]);

  return (
    <div className="space-y-4 pb-4">
      {/* Hero Card: Today's Expense & Main Summary */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-emerald-950/20 blur-md pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-emerald-100 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{t.todayExpense}</span>
            </span>
            <span className="text-[11px] bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full">
              {formatDateDDMMYYYY(now)}
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold tracking-tight font-mono tabular-nums">
              {formatIndianCurrency(stats.todayTotal)}
            </div>
            <button
              onClick={() => {
                playHapticSound('click');
                setActiveTab('add');
              }}
              className="bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 px-3 py-1.5 rounded-xl text-xs font-bold shadow transition-all flex items-center gap-1"
            >
              <Plus size={14} strokeWidth={3} />
              <span>{t.add}</span>
            </button>
          </div>

          {/* Yesterday's comparison pill */}
          <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-emerald-100">
            <span>{t.yesterdayExpense}:</span>
            <span className="font-semibold font-mono tabular-nums">
              {formatIndianCurrency(stats.yesterdayTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Budget Health Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t.monthlyBudget}
            </span>
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {formatIndianCurrency(stats.thisMonthTotal)} / {formatIndianCurrency(user.monthlyBudget)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              budgetInfo.status === 'danger'
                ? 'bg-rose-500'
                : budgetInfo.status === 'warning'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, budgetInfo.percentage)}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>
            {t.budgetUsed}: <strong className="font-mono">{budgetInfo.percentage}%</strong>
          </span>
          <span>
            {t.remaining}: <strong className="font-mono text-slate-800 dark:text-slate-200">{formatIndianCurrency(budgetInfo.remaining)}</strong>
          </span>
        </div>

        {/* Budget Alert if high */}
        {budgetInfo.status !== 'safe' && (
          <div className={`mt-2.5 p-2 rounded-xl text-xs flex items-center gap-2 ${
            budgetInfo.status === 'danger'
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
          }`}>
            <AlertTriangle size={15} className="shrink-0" />
            <span className="text-[11px] leading-tight">
              {budgetInfo.status === 'danger' ? t.budgetAlertDanger : t.budgetAlertWarning}
            </span>
          </div>
        )}
      </div>

      {/* Grid of Key Calculations (Week, Month, Quarter, Year, Overall) */}
      <div className="grid grid-cols-2 gap-3">
        {/* This Week */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            {t.thisWeekExpense}
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block font-mono tabular-nums">
            {formatIndianCurrency(stats.thisWeekTotal)}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            Active Week
          </span>
        </div>

        {/* This Month */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            {t.thisMonthExpense}
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block font-mono tabular-nums">
            {formatIndianCurrency(stats.thisMonthTotal)}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Calendar Month
          </span>
        </div>

        {/* This Quarter */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            {t.thisQuarterExpense}
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block font-mono tabular-nums">
            {formatIndianCurrency(stats.thisQuarterTotal)}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Current Quarter (Q4)
          </span>
        </div>

        {/* This Year */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
            {t.thisYearExpense}
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block font-mono tabular-nums">
            {formatIndianCurrency(stats.thisYearTotal)}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Year 2026
          </span>
        </div>
      </div>

      {/* Overall Total & Transactions Count Bar */}
      <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
            {t.overallTotal}
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {formatIndianCurrency(stats.overallTotal)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
            {t.totalTransactions}
          </span>
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {stats.totalTransactions}
          </span>
        </div>
      </div>

      {/* Highest Spending Category Card */}
      {stats.highestCategory && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-rose-600 dark:text-rose-400 block">
                {t.highestCategory}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'hi' ? stats.highestCategory.categoryNameHi : stats.highestCategory.categoryName}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums block">
              {formatIndianCurrency(stats.highestCategory.amount)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {stats.highestCategory.percentage}% of total
            </span>
          </div>
        </div>
      )}

      {/* Recent Expenses List with Quick Tap */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-xs font-bold tracking-tight uppercase text-slate-500 dark:text-slate-400">
            {t.recentExpenses}
          </h2>
          <button
            onClick={() => {
              playHapticSound('click');
              setActiveTab('history');
            }}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
          >
            <span>{t.viewAll}</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-xs text-slate-500">{t.noExpenses}</p>
            <button
              onClick={() => setActiveTab('add')}
              className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
            >
              {t.addExpense}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentExpenses.map(exp => {
              const cat = categories.find(c => c.id === exp.categoryId);
              return (
                <div
                  key={exp.id}
                  onClick={() => {
                    playHapticSound('click');
                    setEditingExpense(exp);
                    setActiveTab('add');
                  }}
                  className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryIcon
                      iconName={cat?.icon}
                      color={cat?.color}
                      className="w-10 h-10"
                      size={18}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {language === 'hi' ? (cat?.nameHi || cat?.name) : (cat?.name || exp.categoryId)}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {exp.description || formatDateDDMMYYYY(exp.date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-white font-mono tabular-nums block">
                      {formatIndianCurrency(exp.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">
                      {exp.paymentMethod}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
