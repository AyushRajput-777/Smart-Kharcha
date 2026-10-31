import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DatePeriod } from '../../types';
import { 
  filterExpensesByPeriod, 
  formatIndianCurrency, 
  calculateCategoryStats, 
  formatDateDDMMYYYY, 
  generateCSV, 
  generateExcelXML 
} from '../../utils/calculations';
import { CategoryIcon } from '../common/CategoryIcon';
import { 
  BarChart2, 
  PieChart as PieIcon, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';

export const ReportsAndAnalytics: React.FC = () => {
  const { expenses, categories, t, language, playHapticSound } = useApp();

  // Active chart tab: 'daily' | 'monthly' | 'quarterly' | 'yearly' | 'categories'
  const [chartType, setChartType] = useState<'daily' | 'monthly' | 'quarterly' | 'yearly' | 'categories'>('categories');

  // Filter for category reports
  const [reportPeriod, setReportPeriod] = useState<DatePeriod>('monthly');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Filtered expenses based on reportPeriod
  const periodExpenses = useMemo(() => {
    return filterExpensesByPeriod(expenses, reportPeriod);
  }, [expenses, reportPeriod]);

  // Overall total for selected period
  const totalPeriodAmount = useMemo(() => {
    return periodExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [periodExpenses]);

  // Category statistics for the selected period
  const categoryStats = useMemo(() => {
    return calculateCategoryStats(periodExpenses, categories);
  }, [periodExpenses, categories]);

  // Active Category specific data if one category is singled out
  const singleCategoryData = useMemo(() => {
    if (selectedCategoryId === 'all') return null;
    const cat = categories.find(c => c.id === selectedCategoryId);
    const catExpenses = periodExpenses.filter(e => e.categoryId === selectedCategoryId);
    const catTotal = catExpenses.reduce((s, e) => s + e.amount, 0);
    const percentage = totalPeriodAmount > 0 ? ((catTotal / totalPeriodAmount) * 100).toFixed(1) : '0';
    return {
      category: cat,
      total: catTotal,
      count: catExpenses.length,
      percentage,
      expenses: catExpenses,
    };
  }, [selectedCategoryId, categories, periodExpenses, totalPeriodAmount]);

  // Daily totals for the last 7 or 14 days
  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    const days: { dateStr: string; label: string; amount: number }[] = [];
    
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const weekday = d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short' });
      days.push({
        dateStr,
        label: `${day} ${weekday}`,
        amount: 0,
      });
    }

    for (const exp of expenses) {
      if (exp.date) {
        map[exp.date] = (map[exp.date] || 0) + exp.amount;
      }
    }

    return days.map(d => ({
      ...d,
      amount: map[d.dateStr] || 0,
    }));
  }, [expenses, language]);

  // Monthly totals for 12 months of current year
  const monthlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const totals = new Array(12).fill(0);

    for (const exp of expenses) {
      if (!exp.date) continue;
      const [y, m] = exp.date.split('-');
      if (parseInt(y) === currentYear) {
        const monthIndex = parseInt(m) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          totals[monthIndex] += exp.amount;
        }
      }
    }

    return months.map((m, idx) => ({
      month: m,
      amount: totals[idx],
    }));
  }, [expenses]);

  // Quarterly totals (Q1, Q2, Q3, Q4)
  const quarterlyData = useMemo(() => {
    const quarters = [
      { name: 'Q1 (Jan-Mar)', amount: 0 },
      { name: 'Q2 (Apr-Jun)', amount: 0 },
      { name: 'Q3 (Jul-Sep)', amount: 0 },
      { name: 'Q4 (Oct-Dec)', amount: 0 },
    ];
    const currentYear = new Date().getFullYear();

    for (const exp of expenses) {
      if (!exp.date) continue;
      const [y, m] = exp.date.split('-');
      if (parseInt(y) === currentYear) {
        const qIdx = Math.floor((parseInt(m) - 1) / 3);
        if (qIdx >= 0 && qIdx < 4) {
          quarters[qIdx].amount += exp.amount;
        }
      }
    }
    return quarters;
  }, [expenses]);

  // CSV Export trigger
  const handleExportCSV = () => {
    playHapticSound('click');
    const csvContent = generateCSV(periodExpenses, categories);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Smart_Kharcha_Expenses_${reportPeriod}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Excel Export trigger
  const handleExportExcel = () => {
    playHapticSound('click');
    const xmlContent = generateExcelXML(periodExpenses, categories);
    const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Smart_Kharcha_${reportPeriod}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Print PDF Trigger
  const handlePrintPDF = () => {
    playHapticSound('click');
    window.print();
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header and Export Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.analytics}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive charts and detailed category reports
            </p>
          </div>

          <div className="flex gap-1.5 no-print">
            <button
              onClick={handleExportCSV}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors"
              title={t.exportCSV}
              aria-label="Export to CSV"
            >
              <Download size={16} />
            </button>
            <button
              onClick={handleExportExcel}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors"
              title={t.exportExcel}
              aria-label="Export to Excel"
            >
              <FileSpreadsheet size={16} />
            </button>
            <button
              onClick={handlePrintPDF}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors"
              title={t.exportPDF}
              aria-label="Print or Save PDF"
            >
              <Printer size={16} />
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar no-print">
          {(['today', 'weekly', 'monthly', 'quarterly', 'yearly', 'all'] as DatePeriod[]).map(p => (
            <button
              key={p}
              onClick={() => {
                playHapticSound('click');
                setReportPeriod(p);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                reportPeriod === p
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {p === 'today' ? t.today : p === 'weekly' ? t.weekly : p === 'monthly' ? t.monthly : p === 'quarterly' ? t.quarterly : p === 'yearly' ? t.yearly : t.allTime}
            </button>
          ))}
        </div>

        {/* Total Spending for selected period */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Total Spent ({periodExpenses.length} transactions):
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {formatIndianCurrency(totalPeriodAmount)}
          </span>
        </div>
      </div>

      {/* Chart Switcher Buttons */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl no-print">
        <button
          onClick={() => {
            playHapticSound('click');
            setChartType('categories');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            chartType === 'categories'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => {
            playHapticSound('click');
            setChartType('daily');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            chartType === 'daily'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Daily (7D)
        </button>
        <button
          onClick={() => {
            playHapticSound('click');
            setChartType('monthly');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            chartType === 'monthly'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Monthly (12M)
        </button>
        <button
          onClick={() => {
            playHapticSound('click');
            setChartType('quarterly');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            chartType === 'quarterly'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Quarterly
        </button>
      </div>

      {/* Interactive Charts Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
        {chartType === 'categories' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <PieIcon size={14} className="text-emerald-600" />
              <span>Category Distribution (% of Total Spending)</span>
            </h3>

            {/* SVG Donut / Segment representation */}
            <div className="space-y-2">
              {categoryStats.filter(c => c.totalAmount > 0).slice(0, 7).map(item => (
                <div key={item.category.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.category.color }}
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {language === 'hi' ? item.category.nameHi || item.category.name : item.category.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                        {formatIndianCurrency(item.totalAmount)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono w-10 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  {/* Category Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: item.category.color,
                        width: `${Math.min(100, Math.max(4, item.percentage))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}

              {categoryStats.filter(c => c.totalAmount > 0).length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">
                  No expense records for this period.
                </p>
              )}
            </div>
          </div>
        )}

        {chartType === 'daily' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BarChart2 size={14} className="text-emerald-600" />
              <span>Daily Spending Trend (Last 7 Days)</span>
            </h3>

            {/* Responsive SVG Bar Chart */}
            <div className="pt-4 pb-2">
              <div className="h-44 flex items-end justify-between gap-2 px-1 border-b border-slate-200 dark:border-slate-800">
                {dailyData.map((d, i) => {
                  const maxDaily = Math.max(...dailyData.map(item => item.amount), 100);
                  const heightPercent = Math.round((d.amount / maxDaily) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20 font-mono">
                        {formatIndianCurrency(d.amount)}
                      </div>
                      
                      <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                        {d.amount > 0 ? `₹${d.amount >= 1000 ? (d.amount / 1000).toFixed(1) + 'k' : d.amount}` : ''}
                      </span>
                      
                      <div
                        className={`w-full max-w-[28px] rounded-t-lg transition-all duration-500 ${
                          d.amount > 0
                            ? 'bg-emerald-500 group-hover:bg-emerald-600'
                            : 'bg-slate-100 dark:bg-slate-800 min-h-[4px]'
                        }`}
                        style={{ height: `${Math.max(6, heightPercent)}%` }}
                      />
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate max-w-[42px] mt-1 text-center">
                        {d.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {chartType === 'monthly' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BarChart2 size={14} className="text-emerald-600" />
              <span>Monthly Breakdown (Year {new Date().getFullYear()})</span>
            </h3>

            <div className="pt-4 pb-2">
              <div className="h-44 flex items-end justify-between gap-1 px-1 border-b border-slate-200 dark:border-slate-800">
                {monthlyData.map((m, i) => {
                  const maxMonthly = Math.max(...monthlyData.map(item => item.amount), 1000);
                  const heightPercent = Math.round((m.amount / maxMonthly) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {m.amount > 0 && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20 font-mono">
                          {formatIndianCurrency(m.amount)}
                        </div>
                      )}
                      <div
                        className={`w-full max-w-[18px] rounded-t-md transition-all duration-500 ${
                          m.amount > 0
                            ? 'bg-emerald-600 group-hover:bg-emerald-500'
                            : 'bg-slate-100 dark:bg-slate-800 min-h-[3px]'
                        }`}
                        style={{ height: `${Math.max(4, heightPercent)}%` }}
                      />
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1">
                        {m.month.slice(0, 1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {chartType === 'quarterly' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BarChart2 size={14} className="text-emerald-600" />
              <span>Quarterly Expense Comparison</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {quarterlyData.map((q, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
                    {q.name}
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1 block">
                    {formatIndianCurrency(q.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category-Wise Dedicated Report Filter (Requirement #6) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Layers size={14} className="text-emerald-600" />
            <span>Category-Specific Deep Dive Report</span>
          </h3>
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
            Select Category for Inspection:
          </label>
          <select
            value={selectedCategoryId}
            onChange={e => {
              playHapticSound('click');
              setSelectedCategoryId(e.target.value);
            }}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">-- Overview of All Categories --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {language === 'hi' ? cat.nameHi || cat.name : cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Singled Out Category Details */}
        {singleCategoryData ? (
          <div className="space-y-3 pt-2">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CategoryIcon
                  iconName={singleCategoryData.category?.icon}
                  color={singleCategoryData.category?.color}
                  size={20}
                  className="w-11 h-11"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'hi' ? singleCategoryData.category?.nameHi || singleCategoryData.category?.name : singleCategoryData.category?.name}
                  </h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    {singleCategoryData.count} transactions · {singleCategoryData.percentage}% of selected period
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-emerald-800 dark:text-emerald-200 font-mono tabular-nums">
                  {formatIndianCurrency(singleCategoryData.total)}
                </span>
              </div>
            </div>

            {/* Transactions for this single category */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block px-1">
                Transaction History ({singleCategoryData.expenses.length}):
              </span>
              {singleCategoryData.expenses.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No records found for this category in the chosen period.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {singleCategoryData.expenses.map(exp => (
                    <div key={exp.id} className="p-2.5 flex items-center justify-between bg-white dark:bg-slate-900 text-xs">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {exp.description || 'Expense item'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDateDDMMYYYY(exp.date)} {exp.time} · {exp.paymentMethod.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {formatIndianCurrency(exp.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            {categoryStats.slice(0, 10).map(stat => (
              <div key={stat.category.id} className="p-2.5 flex items-center justify-between text-xs bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <CategoryIcon
                    iconName={stat.category.icon}
                    color={stat.category.color}
                    size={14}
                    className="w-7 h-7"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block leading-tight">
                      {language === 'hi' ? stat.category.nameHi || stat.category.name : stat.category.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {stat.count} items
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold font-mono text-slate-900 dark:text-white block">
                    {formatIndianCurrency(stat.totalAmount)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {stat.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
