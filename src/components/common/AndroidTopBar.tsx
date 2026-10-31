import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wifi, 
  BatteryMedium, 
  Moon, 
  Sun, 
  CloudCheck, 
  CloudOff, 
  Smartphone, 
  Maximize2,
  RefreshCw,
  Download,
} from 'lucide-react';
import { AndroidApkModal } from './AndroidApkModal';

export const AndroidTopBar: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    theme, 
    toggleTheme, 
    syncStatus, 
    syncNow, 
    isMobileFrame, 
    setIsMobileFrame,
    playHapticSound,
    t,
  } = useApp();

  const [currentTime, setCurrentTime] = useState('10:45');
  const [showApkModal, setShowApkModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      let hours = d.getHours();
      const mins = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${mins} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-emerald-700 text-white select-none transition-colors">
      {/* Android Native Status Bar */}
      <div className="px-5 pt-2 pb-1 flex items-center justify-between text-xs font-medium tracking-tight text-emerald-100/90 border-b border-emerald-600/40">
        <div className="flex items-center gap-1.5 font-mono">
          <span>{currentTime}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Sync indicator */}
          <button
            onClick={() => {
              playHapticSound('click');
              syncNow();
            }}
            title={syncStatus === 'synced' ? t.synced : syncStatus === 'offline' ? t.offline : t.syncing}
            className="flex items-center gap-1 text-[11px] hover:text-white transition-opacity active:opacity-75"
            aria-label="Cloud sync status"
          >
            {syncStatus === 'synced' ? (
              <CloudCheck size={14} className="text-emerald-200" />
            ) : syncStatus === 'offline' ? (
              <CloudOff size={14} className="text-amber-300" />
            ) : (
              <RefreshCw size={14} className="animate-spin text-emerald-200" />
            )}
          </button>
          
          <div className="flex items-center gap-1 text-emerald-200">
            <Wifi size={13} />
            <span className="text-[10px] font-semibold">5G</span>
            <BatteryMedium size={14} />
          </div>
        </div>
      </div>

      {/* Main Top App Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 border border-emerald-500/50 flex items-center justify-center font-bold text-white shadow-sm">
            ₹
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-tight flex items-center gap-1.5">
              <span>{t.appName}</span>
              <span className="text-[10px] font-normal uppercase tracking-wider bg-emerald-800/80 px-1.5 py-0.5 rounded text-emerald-200 border border-emerald-600/30">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-emerald-200/90 leading-none">
              {t.appTagline}
            </p>
          </div>
        </div>

        {/* Quick Actions (APK Download, Language, Theme, Frame Toggle) */}
        <div className="flex items-center gap-1">
          {/* APK / Install Button */}
          <button
            onClick={() => {
              playHapticSound('click');
              setShowApkModal(true);
            }}
            className="h-8 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold tracking-tight shadow-sm transition-all active:scale-95 flex items-center gap-1"
            title="Download APK / Install on Android"
            aria-label="Download APK or Install on Android"
          >
            <Download size={13} strokeWidth={2.5} />
            <span>APK</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => {
              playHapticSound('click');
              setLanguage(language === 'en' ? 'hi' : 'en');
            }}
            className="h-8 px-2.5 rounded-lg bg-emerald-800/60 hover:bg-emerald-800 border border-emerald-600/30 text-xs font-semibold tracking-tight transition-all active:scale-95 flex items-center gap-1"
            title="Switch Language (English / हिंदी)"
            aria-label="Toggle English or Hindi"
          >
            <span>{language === 'en' ? 'हिंदी' : 'ENG'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              playHapticSound('click');
              toggleTheme();
            }}
            className="w-8 h-8 rounded-lg bg-emerald-800/60 hover:bg-emerald-800 border border-emerald-600/30 flex items-center justify-center transition-all active:scale-95"
            title="Toggle Light/Dark Theme"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Frame Toggle */}
          <button
            onClick={() => {
              playHapticSound('click');
              setIsMobileFrame((prev: boolean) => !prev);
            }}
            className="w-8 h-8 rounded-lg bg-emerald-800/60 hover:bg-emerald-800 border border-emerald-600/30 hidden sm:flex items-center justify-center transition-all active:scale-95"
            title={isMobileFrame ? t.fullScreen : t.androidFrame}
            aria-label="Toggle mobile device view"
          >
            {isMobileFrame ? <Maximize2 size={15} /> : <Smartphone size={15} />}
          </button>
        </div>
      </div>

      {/* APK Modal */}
      <AndroidApkModal isOpen={showApkModal} onClose={() => setShowApkModal(false)} />
    </div>
  );
};
