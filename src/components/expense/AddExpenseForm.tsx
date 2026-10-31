import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import { PAYMENT_METHODS } from '../../utils/constants';
import { formatDateDDMMYYYY, toISODateString } from '../../utils/calculations';
import { CategoryIcon } from '../common/CategoryIcon';
import confetti from 'canvas-confetti';
import { 
  Check, 
  Trash2, 
  X, 
  Clock, 
  Calendar as CalendarIcon, 
  Plus, 
  AlertCircle 
} from 'lucide-react';

export const AddExpenseForm: React.FC = () => {
  const { 
    categories, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    editingExpense, 
    setEditingExpense, 
    setActiveTab, 
    t, 
    language,
    addCustomCategory,
    playHapticSound
  } = useApp();

  const isEditing = Boolean(editingExpense);

  // Form State
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('grocery');
  const [date, setDate] = useState<string>(toISODateString(new Date()));
  const [time, setTime] = useState<string>('12:00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Custom Category Modal State
  const [showCustomCatModal, setShowCustomCatModal] = useState<boolean>(false);
  const [customCatName, setCustomCatName] = useState<string>('');
  const [customCatNameHi, setCustomCatNameHi] = useState<string>('');

  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Populate if editing
  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setCategoryId(editingExpense.categoryId);
      setDate(editingExpense.date);
      setTime(editingExpense.time || '12:00');
      setPaymentMethod(editingExpense.paymentMethod);
      setDescription(editingExpense.description || '');
    } else {
      // Default new expense
      const now = new Date();
      setAmount('');
      setCategoryId('grocery');
      setDate(toISODateString(now));
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${mins}`);
      setPaymentMethod('upi');
      setDescription('');
    }
    setError(null);
  }, [editingExpense]);

  // Quick Amount Handlers
  const handleAddQuickAmount = (val: number) => {
    playHapticSound('click');
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  // Set quick date
  const setQuickDate = (type: 'today' | 'yesterday') => {
    playHapticSound('click');
    const d = new Date();
    if (type === 'yesterday') {
      d.setDate(d.getDate() - 1);
    }
    setDate(toISODateString(d));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError(language === 'hi' ? 'कृपया एक वैध राशि दर्ज करें (₹ > 0)' : 'Please enter a valid amount (₹ > 0)');
      return;
    }

    if (!categoryId) {
      setError(language === 'hi' ? 'कृपया एक श्रेणी चुनें' : 'Please select a category');
      return;
    }

    if (!date) {
      setError(language === 'hi' ? 'कृपया दिनांक चुनें' : 'Please select a date');
      return;
    }

    setError(null);

    try {
      if (isEditing && editingExpense) {
        await updateExpense(editingExpense.id, {
          amount: numAmount,
          categoryId,
          date,
          time,
          paymentMethod,
          description: description.trim(),
        });
        setEditingExpense(null);
      } else {
        await addExpense({
          amount: numAmount,
          categoryId,
          date,
          time,
          paymentMethod,
          description: description.trim(),
        });
        // Trigger celebratory confetti for successfully logging expense!
        try {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#059669', '#10b981', '#34d399', '#f59e0b'],
          });
        } catch {
          // confetti fallback
        }
      }

      setActiveTab('history');
    } catch (err) {
      console.error(err);
      setError('Failed to save expense. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (editingExpense) {
      await deleteExpense(editingExpense.id);
      setEditingExpense(null);
      setShowDeleteConfirm(false);
      setActiveTab('history');
    }
  };

  const handleCreateCustomCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCatName.trim()) return;
    const newCat = await addCustomCategory(customCatName.trim(), customCatNameHi.trim());
    setCategoryId(newCat.id);
    setCustomCatName('');
    setCustomCatNameHi('');
    setShowCustomCatModal(false);
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {isEditing ? t.editExpense : t.addExpense}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isEditing ? 'Modify your expense record' : 'Record your daily spending in Indian Rupees (₹)'}
          </p>
        </div>
        {isEditing && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete Expense"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Input */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {t.amount} *
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹
            </span>
            <input
              type="number"
              step="any"
              min="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              autoFocus={!isEditing}
              className="w-full pl-9 pr-4 py-2.5 text-2xl font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* Quick Amount Add Pills */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {[50, 100, 200, 500, 1000, 2000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => handleAddQuickAmount(val)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors active:scale-95 font-mono"
              >
                +₹{val}
              </button>
            ))}
          </div>
        </div>

        {/* Category Selector */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {t.category} *
            </label>
            <button
              type="button"
              onClick={() => {
                playHapticSound('click');
                setShowCustomCatModal(true);
              }}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>{t.customCategory}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
            {categories.map(cat => {
              const isSelected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    playHapticSound('click');
                    setCategoryId(cat.id);
                  }}
                  className={`p-2 rounded-xl flex flex-col items-center text-center transition-all min-h-[64px] justify-center ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/30'
                      : 'bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <CategoryIcon
                    iconName={cat.icon}
                    color={isSelected ? '#ffffff' : cat.color}
                    size={16}
                    className="w-7 h-7 mb-1"
                  />
                  <span className="text-[11px] font-medium leading-tight truncate w-full px-0.5">
                    {language === 'hi' ? cat.nameHi || cat.name : cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date and Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <CalendarIcon size={14} />
                <span>{t.date} (DD-MM-YYYY) *</span>
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setQuickDate('today')}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                >
                  {t.today}
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate('yesterday')}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  {t.yesterday}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
              />
              <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
                {formatDateDDMMYYYY(date)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Clock size={14} />
              <span>{t.time}</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            {t.paymentMethod} *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map(method => {
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    playHapticSound('click');
                    setPaymentMethod(method.id);
                  }}
                  className={`p-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center min-h-[44px] ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="truncate w-full text-center">
                    {language === 'hi' ? method.nameHi.split(' ')[0] : method.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description / Note */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            {t.description}
          </label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Blinkit grocery, Shell petrol, Thali dinner..."
            maxLength={120}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              playHapticSound('click');
              setEditingExpense(null);
              setActiveTab('home');
            }}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Check size={16} strokeWidth={2.5} />
            <span>{isEditing ? t.updateExpense : t.saveExpense}</span>
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Category Modal */}
      {showCustomCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.customCategory}
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomCatModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t.categoryName} *
                </label>
                <input
                  type="text"
                  value={customCatName}
                  onChange={e => setCustomCatName(e.target.value)}
                  placeholder="e.g. Gym & Fitness, Pet Care..."
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t.categoryNameHi}
                </label>
                <input
                  type="text"
                  value={customCatNameHi}
                  onChange={e => setCustomCatNameHi(e.target.value)}
                  placeholder="उदा. जिम और फिटनेस"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomCatModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
                >
                  {t.add}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
