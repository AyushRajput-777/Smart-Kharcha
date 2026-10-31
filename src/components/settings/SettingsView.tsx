import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndianCurrency } from '../../utils/calculations';
import { 
  ShieldCheck, 
  Wallet, 
  Moon, 
  Sun, 
  Globe, 
  Cloud, 
  RefreshCw, 
  Download, 
  Upload, 
  Trash2, 
  Lock, 
  Smartphone, 
  Check, 
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { AndroidApkModal } from '../common/AndroidApkModal';

export const SettingsView: React.FC = () => {
  const { 
    user, 
    categories, 
    language, 
    setLanguage, 
    theme, 
    toggleTheme, 
    syncStatus, 
    syncNow, 
    updateMonthlyBudget, 
    updateCategoryBudget, 
    exportBackupJSON, 
    restoreBackupJSON, 
    resetAllData, 
    t, 
    playHapticSound 
  } = useApp();

  // Monthly budget input state
  const [budgetVal, setBudgetVal] = useState<string>(user.monthlyBudget.toString());
  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);

  // Category budget modal / state
  const [selectedCatId, setSelectedCatId] = useState<string>('grocery');
  const [catBudgetVal, setCatBudgetVal] = useState<string>('5000');
  const [catBudgetSuccess, setCatBudgetSuccess] = useState<string | null>(null);

  // Security PIN state
  const [pinEnabled, setPinEnabled] = useState<boolean>(user.pinEnabled);
  const [newPin, setNewPin] = useState<string>('');
  const [pinMsg, setPinMsg] = useState<string | null>(null);

  // Restore backup state
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [backupInput, setBackupInput] = useState<string>('');
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Android APK Guide Modal
  const [showApkGuide, setShowApkGuide] = useState<boolean>(false);

  const handleSaveMonthlyBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetVal);
    if (!isNaN(val) && val > 0) {
      updateMonthlyBudget(val);
      setIsEditingBudget(false);
    }
  };

  const handleSaveCategoryBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(catBudgetVal);
    if (!isNaN(val) && val > 0) {
      updateCategoryBudget(selectedCatId, val);
      setCatBudgetSuccess(language === 'hi' ? 'बजट सफलतापूर्वक सहेजा गया' : 'Budget saved successfully');
      setTimeout(() => setCatBudgetSuccess(null), 3000);
    }
  };

  const handleExportBackup = () => {
    playHapticSound('click');
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Smart_Kharcha_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupInput.trim()) return;
    const ok = restoreBackupJSON(backupInput.trim());
    if (ok) {
      setShowRestoreModal(false);
      setBackupInput('');
      setRestoreError(null);
    } else {
      setRestoreError('Invalid backup file. Please verify JSON format.');
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {user.name.slice(0, 1)}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {user.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user.email}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowApkGuide(true)}
          className="text-xs px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 active:scale-95"
        >
          <Smartphone size={14} />
          <span>Android App</span>
        </button>
      </div>

      {/* Budget Management Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Wallet size={14} className="text-emerald-600" />
            <span>{t.budgetManagement}</span>
          </h3>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {formatIndianCurrency(user.monthlyBudget)}/mo
          </span>
        </div>

        {/* Set Monthly Budget */}
        <div className="pt-1">
          {isEditingBudget ? (
            <form onSubmit={handleSaveMonthlyBudget} className="flex gap-2">
              <input
                type="number"
                min="1000"
                step="500"
                value={budgetVal}
                onChange={e => setBudgetVal(e.target.value)}
                className="w-full text-xs font-mono font-bold p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingBudget(false)}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsEditingBudget(true)}
              className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
            >
              <span>{t.setMonthlyBudget}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Edit Limit</span>
            </button>
          )}
        </div>

        {/* Category-wise Budgets */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
            {t.categoryBudgets}
          </label>
          <form onSubmit={handleSaveCategoryBudget} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedCatId}
                onChange={e => {
                  setSelectedCatId(e.target.value);
                  const existing = user.categoryBudgets[e.target.value] || 3000;
                  setCatBudgetVal(existing.toString());
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {language === 'hi' ? c.nameHi || c.name : c.name}
                  </option>
                ))}
              </select>

              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={catBudgetVal}
                  onChange={e => setCatBudgetVal(e.target.value)}
                  placeholder="Budget"
                  className="w-full pl-6 pr-2 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Update Category Limit
            </button>
            {catBudgetSuccess && (
              <p className="text-[11px] text-emerald-600 text-center font-medium mt-1">
                {catBudgetSuccess}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Preferences Section (Language, Theme) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Globe size={14} className="text-emerald-600" />
          <span>App Preferences</span>
        </h3>

        {/* Language Switch */}
        <div className="flex items-center justify-between py-1">
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              {t.language}
            </span>
            <span className="text-[11px] text-slate-400">
              English / हिन्दी
            </span>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
            <button
              onClick={() => {
                playHapticSound('click');
                setLanguage('en');
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                language === 'en'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              English
            </button>
            <button
              onClick={() => {
                playHapticSound('click');
                setLanguage('hi');
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                language === 'hi'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Theme Switch */}
        <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              {t.theme}
            </span>
            <span className="text-[11px] text-slate-400">
              {theme === 'dark' ? t.dark : t.light}
            </span>
          </div>
          <button
            onClick={() => {
              playHapticSound('click');
              toggleTheme();
            }}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 flex items-center gap-1.5 text-xs font-semibold"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span>{theme === 'dark' ? t.light : t.dark}</span>
          </button>
        </div>
      </div>

      {/* Cloud Backup & Sync Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Cloud size={14} className="text-emerald-600" />
            <span>{t.cloudBackup}</span>
          </h3>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {syncStatus === 'synced' ? t.synced : syncStatus === 'offline' ? t.offline : t.syncing}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              playHapticSound('click');
              syncNow();
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
            <span>{t.syncNow}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleExportBackup}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Download size={14} />
            <span>{t.backupData}</span>
          </button>
          <button
            onClick={() => setShowRestoreModal(true)}
            className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Upload size={14} />
            <span>{t.restoreData}</span>
          </button>
        </div>
      </div>

      {/* Security & Data Wipe */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Lock size={14} className="text-emerald-600" />
          <span>{t.security}</span>
        </h3>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100/50 flex items-center justify-center gap-1.5"
        >
          <Trash2 size={15} />
          <span>{t.deleteAccount}</span>
        </button>
      </div>

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.restoreData}
            </h3>
            <p className="text-xs text-slate-500">
              Paste your exported Smart Kharcha JSON backup:
            </p>
            <form onSubmit={handleRestoreSubmit} className="space-y-3">
              <textarea
                value={backupInput}
                onChange={e => setBackupInput(e.target.value)}
                placeholder='{"version": "1.0", "expenses": [...]}'
                rows={5}
                className="w-full p-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              {restoreError && (
                <p className="text-xs text-rose-600 font-semibold">{restoreError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRestoreModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
                >
                  Restore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.deleteAccount}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t.confirmDataWipe}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAllData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                Yes, Wipe All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Android Installation & APK Modal */}
      <AndroidApkModal isOpen={showApkGuide} onClose={() => setShowApkGuide(false)} />
    </div>
  );
};
