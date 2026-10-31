import React from 'react';
import { ShieldCheck, Volume2, VolumeX, Sparkles, Moon, Sun, Cpu, Palette } from 'lucide-react';
import { AppTheme } from '../types';
import { soundFx } from '../utils/soundEffects';

interface HeaderProps {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  activeTab: 'generator' | 'batch' | 'vault' | 'tools';
  setActiveTab: (tab: 'generator' | 'batch' | 'vault' | 'tools') => void;
  vaultCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  setTheme,
  soundEnabled,
  setSoundEnabled,
  activeTab,
  setActiveTab,
  vaultCount,
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.setEnabled(next);
    if (next) soundFx.playClick();
  };

  const isLight = theme === 'light';

  const themes: { id: AppTheme; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: 'Светлая', icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { id: 'dark', label: 'Тёмная', icon: <Moon className="w-4 h-4" /> },
    { id: 'cyberpunk', label: 'Киберпанк', icon: <Cpu className="w-4 h-4 text-cyan-400" /> },
    { id: 'midnight', label: 'OLED', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
  ];

  return (
    <header className={`w-full border-b sticky top-0 z-40 transition-colors duration-200 ${
      isLight
        ? 'bg-white/95 border-slate-200 shadow-sm backdrop-blur-xl text-slate-900'
        : 'bg-slate-900/90 border-slate-800/80 backdrop-blur-xl text-slate-100'
    }`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-5 py-2.5 sm:py-3.5 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Top Row on mobile: Logo + Controls */}
        <div className="flex items-center justify-between w-full md:w-auto">
          {/* Logo & Title */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('generator')}>
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 shadow-md shadow-indigo-500/25 text-white shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <h1 className={`text-lg sm:text-2xl font-extrabold tracking-tight leading-tight ${
                  isLight ? 'text-slate-900' : 'bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent'
                }`}>
                  Генератор Паролей
                </h1>
                <span className={`text-[10px] sm:text-xs uppercase font-mono font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full ${
                  isLight ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                }`}>
                  PRO
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500 font-medium' : 'text-slate-400'} hidden sm:block`}>
                Криптографическая безопасность & инструменты
              </p>
            </div>
          </div>

          {/* Sound & Theme Controls (Visible on right on mobile) */}
          <div className="flex md:hidden items-center space-x-1.5">
            {/* Sound Toggle */}
            <button
              id="sound-toggle-btn-mobile"
              onClick={toggleSound}
              title={soundEnabled ? 'Звуковые эффекты вкл' : 'Звуковые эффекты выкл'}
              className={`p-2 rounded-xl border transition-all ${
                soundEnabled
                  ? isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-800 border-slate-700 text-cyan-400'
                  : isLight ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Theme Selector */}
            <div className={`flex items-center p-0.5 rounded-xl border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/80 border-slate-700/50'
            }`}>
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    soundFx.playClick();
                    setTheme(t.id);
                  }}
                  title={t.label}
                  className={`p-1.5 rounded-lg text-xs transition-all ${
                    theme === t.id
                      ? isLight ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'bg-slate-700 text-white shadow-sm'
                      : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <nav className={`w-full md:w-auto flex items-center justify-between sm:justify-center p-1 rounded-2xl border text-xs sm:text-sm font-bold overflow-x-auto scrollbar-none transition-all ${
          isLight ? 'bg-slate-100/90 border-slate-200 text-slate-700' : 'bg-slate-800/80 border-slate-700/50 text-slate-300'
        }`}>
          <button
            id="nav-tab-generator"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('generator');
            }}
            className={`flex-1 md:flex-initial text-center px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'generator'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white'
            }`}
          >
            Генератор
          </button>
          <button
            id="nav-tab-batch"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('batch');
            }}
            className={`flex-1 md:flex-initial text-center px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'batch'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white'
            }`}
          >
            Пакетный
          </button>
          <button
            id="nav-tab-vault"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('vault');
            }}
            className={`flex-1 md:flex-initial text-center px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all whitespace-nowrap flex items-center justify-center space-x-1 sm:space-x-1.5 ${
              activeTab === 'vault'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Сейф</span>
            {vaultCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] sm:text-xs rounded-full bg-cyan-500 text-slate-950 font-extrabold">
                {vaultCount}
              </span>
            )}
          </button>
          <button
            id="nav-tab-tools"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('tools');
            }}
            className={`flex-1 md:flex-initial text-center px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'tools'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white'
            }`}
          >
            Утилиты
          </button>
        </nav>

        {/* Right Actions: Sound & Theme (Desktop only) */}
        <div className="hidden md:flex items-center space-x-2.5">
          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={toggleSound}
            title={soundEnabled ? 'Звуковые эффекты вкл' : 'Звуковые эффекты выкл'}
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100' : 'bg-slate-800 border-slate-700 text-cyan-400 hover:bg-slate-700'
                : isLight ? 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Theme Selector Dropdown / Pills */}
          <div className={`flex items-center p-1 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/80 border-slate-700/50'
          }`}>
            {themes.map((t) => (
              <button
                key={t.id}
                id={`theme-btn-${t.id}`}
                onClick={() => {
                  soundFx.playClick();
                  setTheme(t.id);
                }}
                title={t.label}
                className={`p-2 rounded-lg text-sm transition-all flex items-center justify-center ${
                  theme === t.id
                    ? isLight ? 'bg-white text-indigo-700 shadow-sm font-bold border border-slate-200' : 'bg-slate-700 text-white shadow-sm'
                    : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
