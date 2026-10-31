import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, PlusCircle, History, BarChart3, Settings } from 'lucide-react';

export const AndroidBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, t, playHapticSound, setEditingExpense } = useApp();

  const handleTabClick = (tab: 'home' | 'add' | 'history' | 'reports' | 'settings') => {
    playHapticSound('click');
    if (tab === 'add') {
      setEditingExpense(null);
    }
    setActiveTab(tab);
  };

  const navItems = [
    { id: 'home' as const, label: t.home, icon: Home },
    { id: 'history' as const, label: t.history, icon: History },
    { id: 'add' as const, label: t.addExpense, icon: PlusCircle, isPrimary: true },
    { id: 'reports' as const, label: t.reports, icon: BarChart3 },
    { id: 'settings' as const, label: t.settings, icon: Settings },
  ];

  return (
    <nav 
      aria-label="App Navigation"
      className="sticky bottom-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <div key={item.id} className="flex justify-center -mt-5">
                <button
                  onClick={() => handleTabClick('add')}
                  className={`w-13 h-13 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 border-2 ${
                    isActive
                      ? 'bg-emerald-700 text-white border-white dark:border-slate-800 ring-4 ring-emerald-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border-white dark:border-slate-800'
                  }`}
                  aria-label={t.addExpense}
                >
                  <PlusCircle size={26} strokeWidth={2.4} />
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Android bottom gesture pill bar */}
      <div className="flex justify-center pb-1">
        <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
      </div>
    </nav>
  );
};
