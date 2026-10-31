import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useApp } from '../../context/AppContext';
import { 
  Smartphone, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Share2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  X,
  FileCode,
  Layers
} from 'lucide-react';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const { language, t, playHapticSound } = useApp();
  const [activeTab, setActiveTab] = useState<'instant' | 'apk' | 'source'>('instant');
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const appUrl = window.location.origin;
  const pwaBuilderUrl = `https://www.pwabuilder.com/?site=${encodeURIComponent(appUrl)}`;

  const handleInstallClick = async () => {
    playHapticSound('click');
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
      }
    } else {
      // Direct Chrome guide
      alert(
        language === 'hi'
          ? 'अपने Android फोन में Chrome के शीर्ष दाईं ओर 3-डॉट मेनू (⋮) पर टैप करें और "ऐप इंस्टॉल करें" या "होम स्क्रीन पर जोड़ें" चुनें।'
          : 'In Google Chrome on your Android phone, tap the 3-dot menu (⋮) at top right and tap "Install App" or "Add to Home screen".'
      );
    }
  };

  const handleDownloadAndroidPackage = () => {
    playHapticSound('click');
    // Generate a downloadable package info JSON with Android manifest specifications
    const packageConfig = {
      appName: 'Smart Kharcha',
      packageName: 'com.smartkharcha.app',
      versionName: '1.0.0',
      versionCode: 1,
      minSdkVersion: 24,
      targetSdkVersion: 34,
      themeColor: '#059669',
      backgroundColor: '#ffffff',
      startUrl: appUrl,
      generatedAt: new Date().toISOString(),
      permissions: [
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.VIBRATE',
      ],
      twaConfig: {
        host: window.location.host,
        enableNotifications: true,
        offlineStrategy: 'CacheFirst',
      },
    };

    const blob = new Blob([JSON.stringify(packageConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-kharcha-android-spec.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
              <Smartphone size={22} />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">
                {language === 'hi' ? 'स्मार्ट खर्चा - एंड्रॉइड ऐप (APK)' : 'Smart Kharcha - Android APK & Install'}
              </h2>
              <p className="text-[11px] text-emerald-200">
                Official Android Deployment & WebAPK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-1">
          <button
            onClick={() => setActiveTab('instant')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'instant'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {language === 'hi' ? '1-क्लिक इंस्टॉल (WebAPK)' : 'Direct WebAPK'}
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'apk'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {language === 'hi' ? 'APK फ़ाइल डाउनलोड' : 'Download APK'}
          </button>
          <button
            onClick={() => setActiveTab('source')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'source'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Android Source
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'instant' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white text-xs">
                    {language === 'hi'
                      ? 'Google Play Services द्वारा प्रमाणित WebAPK'
                      : 'Google Play Services Native WebAPK'}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {language === 'hi'
                      ? 'Android पर Google Chrome सीधे आपके फोन के लिए एक मूल WebAPK पैकेज बनाता है। यह बिना किसी अज्ञात स्रोत अनुमति के सुरक्षित रूप से इंस्टॉल होता है और ऐप ड्रॉअर में दिखता है।'
                      : 'On Android, Google Chrome automatically synthesizes a signed WebAPK package directly into your device. It installs cleanly into your app drawer with offline database capability.'}
                  </p>
                </div>
              </div>

              {/* Install button */}
              <button
                onClick={handleInstallClick}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all"
              >
                <Smartphone size={16} />
                <span>
                  {isInstalled
                    ? language === 'hi' ? 'ऐप पहले से इंस्टॉल है' : 'App Already Installed'
                    : isInstallable
                    ? language === 'hi' ? 'एंड्रॉइड पर इंस्टॉल करें' : 'Install on Android Now'
                    : language === 'hi' ? 'Chrome में इंस्टॉल करें' : 'Install via Chrome'}
                </span>
              </button>

              {installSuccess && (
                <p className="text-[11px] text-emerald-600 font-semibold text-center">
                  App installed successfully! Check your Android home screen.
                </p>
              )}

              {/* Manual 3-step instructions */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white text-[11px]">
                  {language === 'hi' ? 'फोन पर मैन्युअल इंस्टॉल कैसे करें:' : 'How to install on any Android phone:'}
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <li>
                    {language === 'hi'
                      ? 'इस ऐप को Chrome ब्राउज़र में खोलें'
                      : 'Open this URL in Google Chrome on your phone'}
                  </li>
                  <li>
                    {language === 'hi'
                      ? 'ऊपरी दाएँ कोने में 3-डॉट मेनू (⋮) पर टैप करें'
                      : 'Tap the top-right 3-dot menu (⋮)'}
                  </li>
                  <li>
                    {language === 'hi'
                      ? '"ऐप इंस्टॉल करें" या "होम स्क्रीन पर जोड़ें" चुनें'
                      : 'Select "Install App" or "Add to Home screen"'}
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-start gap-2.5">
                <Sparkles size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white text-xs">
                    {language === 'hi'
                      ? 'APK फ़ाइल जनरेटर (PWABuilder / TWA)'
                      : 'Generate Signed Android APK (.apk / .aab)'}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {language === 'hi'
                      ? 'PWABuilder (Microsoft का आधिकारिक PWA-to-APK टूल) का उपयोग करके आप 1 मिनट में Google Play Store और साइडलोडिंग के लिए हस्ताक्षरित Android APK डाउनलोड कर सकते हैं।'
                      : 'Using PWABuilder (the official open-source PWA-to-Android packaging service), you can download a standalone signed Android APK file (.apk) for sideloading or an Android App Bundle (.aab) for Google Play.'}
                  </p>
                </div>
              </div>

              {/* Direct APK Download Button */}
              <a
                href="/smart-kharcha.apk"
                download="smart-kharcha.apk"
                onClick={() => playHapticSound('success')}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all block text-center"
              >
                <Download size={16} />
                <span>
                  {language === 'hi' ? 'स्मार्ट खर्चा APK डाउनलोड करें (.apk)' : 'Download smart-kharcha.apk (Direct File)'}
                </span>
              </a>

              {/* PWABuilder Cloud Build Alternative */}
              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all block text-center"
              >
                <span>
                  {language === 'hi' ? 'Google Play Store बंडल (.aab) जनरेट करें' : 'Generate Play Store Bundle (.aab / APK)'}
                </span>
                <ExternalLink size={13} />
              </a>

              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-white">
                  Package Details:
                </p>
                <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
                  <div>Package ID:</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold">com.smartkharcha.app</div>
                  <div>App Name:</div>
                  <div>Smart Kharcha</div>
                  <div>Target SDK:</div>
                  <div>Android 14 (API 34)</div>
                  <div>Offline Engine:</div>
                  <div>ServiceWorker + LocalStorage</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'source' && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                You can download the Android specification configuration file containing the package identifier, theme colors, permissions, and TWA launcher configuration.
              </p>

              <button
                onClick={handleDownloadAndroidPackage}
                className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
              >
                <Download size={15} />
                <span>Download Android Spec (JSON)</span>
              </button>

              <div className="bg-slate-900 text-emerald-400 p-3 rounded-2xl font-mono text-[10px] overflow-x-auto space-y-1">
                <div className="text-slate-400">// Bubblewrap CLI Quick Command:</div>
                <div>npx @bubblewrap/cli init \</div>
                <div>  --manifest={appUrl}/manifest.webmanifest</div>
                <div>npx @bubblewrap/cli build</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-300"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
