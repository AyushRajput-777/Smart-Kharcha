import { Category, CategoryStat, DashboardStats, DatePeriod, Expense } from '../types';
import { PREDEFINED_CATEGORIES } from './constants';

/**
 * Formats a number to Indian Currency string (₹) with Indian digit grouping
 * Example: 125000 -> ₹1,25,000
 */
export function formatIndianCurrency(amount: number, showDecimals = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format with standard en-IN locale
  const formatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: showDecimals ? 2 : (absAmount % 1 === 0 ? 0 : 2),
    minimumFractionDigits: showDecimals ? 2 : 0,
  });

  const formatted = formatter.format(absAmount);
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Formats YYYY-MM-DD or Date object into DD-MM-YYYY format
 */
export function formatDateDDMMYYYY(dateInput: string | Date): string {
  if (!dateInput) return '';
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split('-');
    return `${day}-${month}-${year}`;
  }
  
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Converts DD-MM-YYYY to YYYY-MM-DD for standard inputs
 */
export function convertDDMMYYYYtoYYYYMMDD(str: string): string {
  if (!str) return '';
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    const [day, month, year] = str.split('-');
    return `${year}-${month}-${day}`;
  }
  return str;
}

/**
 * Returns standard YYYY-MM-DD string from Date
 */
export function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Filter expenses based on period criteria
 */
export function filterExpensesByPeriod(
  expenses: Expense[],
  period: DatePeriod,
  customStart?: string,
  customEnd?: string,
  referenceDate: Date = new Date()
): Expense[] {
  const todayStr = toISODateString(referenceDate);
  
  const yestDate = new Date(referenceDate);
  yestDate.setDate(yestDate.getDate() - 1);
  const yestStr = toISODateString(yestDate);

  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth(); // 0-11
  
  // Start of week (Monday as day 1 in India)
  const dayOfWeek = referenceDate.getDay(); // 0 is Sun, 1 is Mon
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfWeek = new Date(referenceDate);
  startOfWeek.setDate(referenceDate.getDate() - diffToMonday);
  const startOfWeekStr = toISODateString(startOfWeek);

  // Month
  const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  
  // Previous month
  const prevMonthDate = new Date(referenceDate);
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  // Quarter (Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec)
  const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
  const quarterEndMonth = quarterStartMonth + 2;

  // Half year
  const isSecondHalf = currentMonth >= 6;

  return expenses.filter(exp => {
    if (!exp.date) return false;
    const expDateStr = exp.date; // YYYY-MM-DD
    const expDate = new Date(expDateStr + 'T00:00:00');
    if (isNaN(expDate.getTime())) return false;

    switch (period) {
      case 'today':
        return expDateStr === todayStr;

      case 'yesterday':
        return expDateStr === yestStr;

      case 'daily':
        // If customStart is given, match that single day, else match today
        return customStart ? expDateStr === customStart : expDateStr === todayStr;

      case 'weekly':
        return expDateStr >= startOfWeekStr && expDateStr <= todayStr;

      case 'monthly':
        return expDateStr.startsWith(currentMonthStr);

      case 'previous_month':
        return expDateStr.startsWith(prevMonthStr);

      case 'quarterly': {
        const expMonth = expDate.getMonth();
        const expYear = expDate.getFullYear();
        return expYear === currentYear && expMonth >= quarterStartMonth && expMonth <= quarterEndMonth;
      }

      case 'half_yearly': {
        const expMonth = expDate.getMonth();
        const expYear = expDate.getFullYear();
        if (expYear !== currentYear) return false;
        return isSecondHalf ? expMonth >= 6 : expMonth < 6;
      }

      case 'yearly':
        return expDate.getFullYear() === currentYear;

      case 'previous_year':
        return expDate.getFullYear() === currentYear - 1;

      case 'custom': {
        if (!customStart && !customEnd) return true;
        if (customStart && expDateStr < customStart) return false;
        if (customEnd && expDateStr > customEnd) return false;
        return true;
      }

      case 'all':
      default:
        return true;
    }
  });
}

/**
 * Calculates all totals for Home Dashboard
 */
export function calculateDashboardStats(
  expenses: Expense[],
  referenceDate: Date = new Date(),
  categories: Category[] = PREDEFINED_CATEGORIES
): DashboardStats {
  const todayExpenses = filterExpensesByPeriod(expenses, 'today', undefined, undefined, referenceDate);
  const yestExpenses = filterExpensesByPeriod(expenses, 'yesterday', undefined, undefined, referenceDate);
  const weekExpenses = filterExpensesByPeriod(expenses, 'weekly', undefined, undefined, referenceDate);
  const monthExpenses = filterExpensesByPeriod(expenses, 'monthly', undefined, undefined, referenceDate);
  const quarterExpenses = filterExpensesByPeriod(expenses, 'quarterly', undefined, undefined, referenceDate);
  const yearExpenses = filterExpensesByPeriod(expenses, 'yearly', undefined, undefined, referenceDate);

  const sum = (list: Expense[]) => list.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const todayTotal = sum(todayExpenses);
  const yesterdayTotal = sum(yestExpenses);
  const thisWeekTotal = sum(weekExpenses);
  const thisMonthTotal = sum(monthExpenses);
  const thisQuarterTotal = sum(quarterExpenses);
  const thisYearTotal = sum(yearExpenses);
  const overallTotal = sum(expenses);
  const totalTransactions = expenses.length;

  // Calculate highest spending category (from month or overall if month is 0)
  const categoryPool = monthExpenses.length > 0 ? monthExpenses : expenses;
  const categoryTotals: Record<string, number> = {};
  for (const exp of categoryPool) {
    categoryTotals[exp.categoryId] = (categoryTotals[exp.categoryId] || 0) + (Number(exp.amount) || 0);
  }

  let topCategoryId = '';
  let maxAmount = 0;
  for (const [catId, amount] of Object.entries(categoryTotals)) {
    if (amount > maxAmount) {
      maxAmount = amount;
      topCategoryId = catId;
    }
  }

  let highestCategory: DashboardStats['highestCategory'] = null;
  if (topCategoryId && maxAmount > 0) {
    const cat = categories.find(c => c.id === topCategoryId) || {
      id: topCategoryId,
      name: topCategoryId,
      nameHi: topCategoryId,
    };
    const poolTotal = sum(categoryPool);
    const percentage = poolTotal > 0 ? Math.round((maxAmount / poolTotal) * 100) : 0;
    highestCategory = {
      categoryId: topCategoryId,
      categoryName: cat.name,
      categoryNameHi: cat.nameHi || cat.name,
      amount: maxAmount,
      percentage,
    };
  }

  return {
    todayTotal,
    yesterdayTotal,
    thisWeekTotal,
    thisMonthTotal,
    thisQuarterTotal,
    thisYearTotal,
    overallTotal,
    totalTransactions,
    highestCategory,
  };
}

/**
 * Calculates spending breakdown per category
 */
export function calculateCategoryStats(
  expenses: Expense[],
  categories: Category[] = PREDEFINED_CATEGORIES
): CategoryStat[] {
  const totalSpent = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const catMap: Record<string, { totalAmount: number; count: number }> = {};

  for (const exp of expenses) {
    const id = exp.categoryId;
    if (!catMap[id]) catMap[id] = { totalAmount: 0, count: 0 };
    catMap[id].totalAmount += Number(exp.amount) || 0;
    catMap[id].count += 1;
  }

  // Map all categories that have expenses, plus guarantee predefined order
  const result: CategoryStat[] = categories.map(cat => {
    const data = catMap[cat.id] || { totalAmount: 0, count: 0 };
    const percentage = totalSpent > 0 ? Number(((data.totalAmount / totalSpent) * 100).toFixed(1)) : 0;
    return {
      category: cat,
      totalAmount: data.totalAmount,
      count: data.count,
      percentage,
    };
  });

  // Sort by total amount descending
  return result.sort((a, b) => b.totalAmount - a.totalAmount);
}

/**
 * Calculate budget status and health
 */
export function calculateBudgetStatus(budget: number, spent: number) {
  const remaining = Math.max(0, budget - spent);
  const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  
  let status: 'safe' | 'warning' | 'danger' = 'safe';
  if (percentage >= 100) {
    status = 'danger';
  } else if (percentage >= 80) {
    status = 'warning';
  }

  return {
    budget,
    spent,
    remaining,
    percentage,
    status,
    isOverBudget: spent > budget,
  };
}

/**
 * Groups expenses by date in descending order
 */
export function groupExpensesByDate(expenses: Expense[]) {
  const groups: Record<string, Expense[]> = {};
  
  for (const exp of expenses) {
    const dateKey = exp.date || 'Unknown';
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(exp);
  }

  // Sort dates descending
  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return sortedDates.map(dateKey => {
    const items = groups[dateKey].sort((a, b) => (b.time || '').localeCompare(a.time || ''));
    const totalAmount = items.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);
    return {
      date: dateKey,
      displayDate: formatDateDDMMYYYY(dateKey),
      totalAmount,
      expenses: items,
    };
  });
}

/**
 * Generates RFC4180 CSV export with UTF-8 BOM
 */
export function generateCSV(expenses: Expense[], categories: Category[]): string {
  const catLookup = new Map(categories.map(c => [c.id, c.name]));
  
  const headers = ['Transaction ID', 'Date (DD-MM-YYYY)', 'Time', 'Category', 'Amount (INR)', 'Payment Method', 'Description'];
  
  const rows = expenses.map(exp => {
    const categoryName = catLookup.get(exp.categoryId) || exp.categoryId;
    const cleanDesc = `"${(exp.description || '').replace(/"/g, '""')}"`;
    return [
      exp.id,
      formatDateDDMMYYYY(exp.date),
      exp.time || '',
      `"${categoryName}"`,
      exp.amount.toFixed(2),
      exp.paymentMethod.toUpperCase(),
      cleanDesc,
    ].join(',');
  });

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generates Excel Spreadsheet XML (opens directly in MS Excel & LibreOffice)
 */
export function generateExcelXML(expenses: Expense[], categories: Category[]): string {
  const catLookup = new Map(categories.map(c => [c.id, c.name]));
  const totalAmount = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#059669" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Currency">
   <NumberFormat ss:Format="₹#,##0.00"/>
  </Style>
  <Style ss:ID="Total">
   <Font ss:Bold="1"/>
   <Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Expenses">
  <Table>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Date (DD-MM-YYYY)</Data></Cell>
    <Cell><Data ss:Type="String">Time</Data></Cell>
    <Cell><Data ss:Type="String">Category</Data></Cell>
    <Cell><Data ss:Type="String">Amount (₹)</Data></Cell>
    <Cell><Data ss:Type="String">Payment Method</Data></Cell>
    <Cell><Data ss:Type="String">Description</Data></Cell>
   </Row>`;

  for (const exp of expenses) {
    const categoryName = catLookup.get(exp.categoryId) || exp.categoryId;
    xml += `
   <Row>
    <Cell><Data ss:Type="String">${formatDateDDMMYYYY(exp.date)}</Data></Cell>
    <Cell><Data ss:Type="String">${exp.time || ''}</Data></Cell>
    <Cell><Data ss:Type="String">${categoryName}</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${exp.amount}</Data></Cell>
    <Cell><Data ss:Type="String">${exp.paymentMethod.toUpperCase()}</Data></Cell>
    <Cell><Data ss:Type="String">${(exp.description || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>
   </Row>`;
  }

  // Total summary row
  xml += `
   <Row ss:StyleID="Total">
    <Cell><Data ss:Type="String">TOTAL</Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">${totalAmount}</Data></Cell>
    <Cell><Data ss:Type="String"></Data></Cell>
    <Cell><Data ss:Type="String">Total Transactions: ${expenses.length}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  return xml;
}
