/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AndroidTopBar } from './components/common/AndroidTopBar';
import { AndroidBottomNav } from './components/common/AndroidBottomNav';
import { HomeDashboard } from './components/home/HomeDashboard';
import { AddExpenseForm } from './components/expense/AddExpenseForm';
import { TransactionHistory } from './components/history/TransactionHistory';
import { ReportsAndAnalytics } from './components/reports/ReportsAndAnalytics';
import { SettingsView } from './components/settings/SettingsView';
import { Smartphone, Lock, AlertCircle } from 'lucide-react';

function MainAppShell() {
  const { activeTab, isMobileFrame, isLocked, unlockWithPin, t } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockWithPin(pinInput)) {
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-850 border border-slate-700 p-6 rounded-3xl max-w-xs w-full text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Lock size={28} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Smart Kharcha</h2>
            <p className="text-xs text-slate-400 mt-1">{t.enterPin}</p>
          </div>
          <form onSubmit={handlePinSubmit} className="space-y-3">
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              placeholder="••••"
              autoFocus
              className="w-32 mx-auto text-center tracking-widest text-2xl font-mono p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            {pinError && (
              <p className="text-xs text-rose-400 font-semibold flex items-center justify-center gap-1">
                <AlertCircle size={14} />
                <span>{t.pinMismatch}</span>
              </p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active Screen View
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeDashboard />;
      case 'add':
        return <AddExpenseForm />;
      case 'history':
        return <TransactionHistory />;
      case 'reports':
        return <ReportsAndAnalytics />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-200/70 dark:bg-slate-950 py-0 sm:py-6 sm:px-4 transition-colors">
      {/* Container: Phone Frame or Responsive Desktop Container */}
      <div
        className={`w-full transition-all duration-300 overflow-hidden flex flex-col ${
          isMobileFrame
            ? 'max-w-[430px] sm:rounded-[44px] sm:shadow-2xl sm:ring-8 sm:ring-slate-900/90 dark:sm:ring-slate-800 bg-white dark:bg-slate-900 min-h-screen sm:min-h-[860px] sm:max-h-[920px]'
            : 'max-w-2xl sm:rounded-3xl shadow-xl bg-white dark:bg-slate-900 min-h-screen sm:min-h-[800px]'
        }`}
      >
        {/* Android Punch Hole Camera on Mobile Frame */}
        {isMobileFrame && (
          <div className="hidden sm:flex justify-center pt-2 bg-emerald-700 select-none">
            <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-900/60 shadow-inner" />
          </div>
        )}

        {/* Top App Bar */}
        <AndroidTopBar />

        {/* Main Content Area (Scrollable) */}
        <main className="flex-1 overflow-y-auto px-4 pt-3 pb-2 scroll-smooth">
          {renderScreen()}
        </main>

        {/* Android Bottom Navigation */}
        <AndroidBottomNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}
