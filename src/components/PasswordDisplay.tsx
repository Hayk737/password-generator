import React, { useState } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  QrCode,
  BookmarkPlus,
  Volume2,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getPhoneticSpelling } from '../utils/passwordGenerator';
import { soundFx } from '../utils/soundEffects';

import { AppTheme, PasswordAnalysis } from '../types';

interface PasswordDisplayProps {
  theme?: AppTheme;
  password: string;
  analysis?: PasswordAnalysis;
  onRegenerate: () => void;
  onSaveToVault: () => void;
  onShowQrCode: () => void;
}

export const PasswordDisplay: React.FC<PasswordDisplayProps> = ({
  theme = 'light',
  password,
  analysis,
  onRegenerate,
  onSaveToVault,
  onShowQrCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showPhonetic, setShowPhonetic] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const isLight = theme === 'light';

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      soundFx.playCopySuccess();

      // Trigger celebration confetti
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#6366f1', '#10b981'],
      });

      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard fails
      const textArea = document.createElement('textarea');
      textArea.value = password;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = () => {
    setIsRotating(true);
    soundFx.playGenerate();
    onRegenerate();
    setTimeout(() => setIsRotating(false), 300);
  };

  // Color code characters for readability
  const renderColoredPassword = () => {
    if (!isVisible) {
      return <span className={`tracking-widest font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>••••••••••••••••••••</span>;
    }

    return password.split('').map((char, index) => {
      let colorClass = isLight ? 'text-slate-800' : 'text-slate-200'; // lowercase
      if (/[A-ZА-Я]/.test(char)) {
        colorClass = isLight ? 'text-cyan-700 font-bold' : 'text-cyan-400 font-semibold';
      } else if (/[0-9]/.test(char)) {
        colorClass = isLight ? 'text-amber-700 font-bold' : 'text-amber-400 font-semibold';
      } else if (/[^a-zA-Zа-яА-Я0-9]/.test(char)) {
        colorClass = isLight ? 'text-rose-700 font-black' : 'text-rose-400 font-extrabold';
      }

      return (
        <span key={index} className={`${colorClass} hover:opacity-80 transition-opacity inline-block`}>
          {char}
        </span>
      );
    });
  };

  const phoneticList = getPhoneticSpelling(password);

  return (
    <div className={`w-full rounded-3xl border shadow-xl p-4 sm:p-6 md:p-7 transition-all relative overflow-hidden ${
      isLight ? 'bg-white border-slate-200/90 text-slate-900' : 'bg-slate-900/90 border-slate-700/60 text-slate-100'
    }`}>
      {/* Background Accent glow */}
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Password Container */}
      <div className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 sm:gap-4 p-3.5 sm:p-5 rounded-2xl border shadow-inner ${
        isLight ? 'bg-slate-50 border-slate-200/90' : 'bg-slate-950/80 border-slate-800'
      }`}>
        {/* Password Text Area with Extra Large Font */}
        <div className="flex-1 min-w-0 flex items-center overflow-x-auto py-2 px-1 sm:px-3 font-mono text-xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-wider select-all scrollbar-thin scrollbar-thumb-slate-300">
          <div className="whitespace-pre flex flex-wrap break-all items-center">
            {renderColoredPassword()}
          </div>
        </div>

        {/* Action Buttons Toolbar - adaptive for phone & desktop */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full lg:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Hide/Show Toggle */}
            <button
              id="password-visibility-btn"
              onClick={() => {
                soundFx.playClick();
                setIsVisible(!isVisible);
              }}
              title={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
              className={`p-2.5 sm:p-3 rounded-2xl transition-all border shrink-0 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/50'
              }`}
            >
              {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Regenerate Button - Prominent 'Сгенерировать пароль' */}
            <button
              id="password-regenerate-btn"
              onClick={handleRegenerate}
              title="Сгенерировать новый пароль"
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-base transition-all active:scale-95 shadow-md ${
                isLight
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 shadow-indigo-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/70 shadow-indigo-600/30'
              }`}
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isRotating ? 'animate-spin' : ''}`} />
              <span className="truncate">Сгенерировать пароль</span>
            </button>
          </div>

          {/* Main Copy Button */}
          <button
            id="password-copy-btn"
            onClick={handleCopy}
            className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-base transition-all active:scale-95 shadow-md ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-600/30 border border-emerald-500'
                : isLight
                ? 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-900 shadow-slate-900/15'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 shrink-0" />
                <span>Скопировано!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 shrink-0" />
                <span>Копировать</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inline Quick Strength Summary on First Screen */}
      {analysis && (
        <div className={`mt-3 pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm ${
          isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800/80 text-slate-400'
        }`}>
          <div className="flex items-center flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-xs border ${analysis.colorClass}`}>
              {analysis.statusText}
            </span>
            <span className="font-medium text-xs sm:text-sm">
              {analysis.entropyBits} бит • взлом: <span className="font-bold text-emerald-600">{analysis.crackTimeOfflineGpu}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <span className="text-xs font-medium">Стойкость:</span>
            <div className={`w-28 sm:w-36 h-2 rounded-full overflow-hidden p-0.5 border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${Math.max(5, analysis.score)}%` }}
              />
            </div>
            <span className="font-mono font-bold text-xs">{analysis.score}%</span>
          </div>
        </div>
      )}

      {/* Auxiliary Action Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-2 mt-3.5 sm:mt-4 text-xs sm:text-sm font-medium ${
        isLight ? 'text-slate-600' : 'text-slate-400'
      }`}>
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Phonetic spelling trigger */}
          <button
            id="toggle-phonetic-btn"
            onClick={() => {
              soundFx.playClick();
              setShowPhonetic(!showPhonetic);
            }}
            className={`flex items-center space-x-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl transition-colors ${
              isLight ? 'hover:bg-slate-100 hover:text-indigo-600' : 'hover:bg-slate-800/60 hover:text-cyan-400'
            }`}
          >
            <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Фонетическое прочтение</span>
            {showPhonetic ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* QR Code button */}
          <button
            id="show-qrcode-btn"
            onClick={() => {
              soundFx.playClick();
              onShowQrCode();
            }}
            className={`flex items-center space-x-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl transition-colors ${
              isLight ? 'hover:bg-slate-100 hover:text-indigo-600' : 'hover:bg-slate-800/60 hover:text-cyan-400'
            }`}
          >
            <QrCode className="w-4 h-4 text-slate-400 shrink-0" />
            <span>QR-код</span>
          </button>
        </div>

        {/* Save to Vault */}
        <button
          id="save-vault-btn"
          onClick={() => {
            soundFx.playClick();
            onSaveToVault();
          }}
          className={`flex items-center space-x-1.5 py-1.5 px-2.5 sm:px-3 rounded-xl transition-colors font-bold ${
            isLight ? 'text-emerald-700 hover:bg-emerald-50' : 'text-emerald-400 hover:bg-slate-800/60'
          }`}
        >
          <BookmarkPlus className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Сохранить в Сейф</span>
        </button>
      </div>

      {/* Phonetic Spelling Drawer */}
      {showPhonetic && isVisible && (
        <div className={`mt-4 p-4 rounded-2xl border text-sm ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950/70 border-slate-800 text-slate-200'
        }`}>
          <div className="mb-3 flex items-center justify-between">
            <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              <Sparkles className="w-4 h-4 text-indigo-500" /> Фонетическая транскрипция (для прочтения по телефону):
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {phoneticList.map((item, idx) => (
              <div key={idx} className={`p-2 rounded-xl border flex items-center justify-between ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
              }`}>
                <span className={`font-mono font-bold text-base ${isLight ? 'text-indigo-600' : 'text-cyan-400'}`}>{item.char}</span>
                <div className="text-xs text-right">
                  <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{item.phoneticRu}</div>
                  <div className="text-slate-400 font-mono text-[11px]">{item.phoneticEn}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
