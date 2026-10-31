import React from 'react';
import { Shield, ShieldAlert, Zap, Clock, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PasswordAnalysis, AppTheme } from '../types';

interface StrengthMeterProps {
  theme?: AppTheme;
  analysis: PasswordAnalysis;
}

export const StrengthMeter: React.FC<StrengthMeterProps> = ({ theme = 'light', analysis }) => {
  const isLight = theme === 'light';

  const getProgressColor = () => {
    switch (analysis.statusLevel) {
      case 'ultra':
        return 'from-cyan-500 to-blue-500 shadow-cyan-500/50';
      case 'strong':
        return 'from-emerald-500 to-green-500 shadow-emerald-500/50';
      case 'good':
        return 'from-green-500 to-amber-400 shadow-green-500/50';
      case 'fair':
        return 'from-amber-500 to-orange-500 shadow-amber-500/50';
      case 'weak':
      case 'very-weak':
      default:
        return 'from-rose-600 to-red-500 shadow-rose-500/50';
    }
  };

  return (
    <div className={`w-full rounded-3xl border p-4 sm:p-6 shadow-md transition-all ${
      isLight ? 'bg-white border-slate-200/90 text-slate-900' : 'bg-slate-900/80 border-slate-800 text-slate-200'
    }`}>
      {/* Top Header & Status Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 mb-4">
        <div className="flex items-center space-x-2.5">
          {analysis.score >= 60 ? (
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 shrink-0" />
          )}
          <span className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
            Стойкость пароля
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <span className={`text-xs sm:text-sm font-extrabold px-3 py-1 rounded-full border ${analysis.colorClass}`}>
            {analysis.statusText}
          </span>
          <span className={`text-xs sm:text-sm font-mono font-bold px-2.5 py-1 rounded-lg border ${
            isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700/50 text-slate-300'
          }`}>
            {analysis.entropyBits} бит энтропии
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`w-full h-2.5 sm:h-3 rounded-full overflow-hidden p-0.5 border mb-4 sm:mb-5 ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
      }`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 shadow-sm`}
          style={{ width: `${Math.max(5, analysis.score)}%` }}
        />
      </div>

      {/* Crack Time Estimates & Composition Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3">
        {/* Crack Time Box */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800/80'
        }`}>
          <div className={`text-xs sm:text-sm mb-2.5 flex items-center space-x-2 font-bold ${
            isLight ? 'text-slate-800' : 'text-slate-300'
          }`}>
            <Clock className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>Время подбора (Брутфорс):</span>
          </div>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-center gap-2">
              <span className={`truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Офлайн GPU кластер:</span>
              <span className={`font-mono font-bold text-right shrink-0 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{analysis.crackTimeOfflineGpu}</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className={`truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Онлайн с лимитом:</span>
              <span className="font-mono font-bold text-emerald-600 text-right shrink-0">{analysis.crackTimeOnline}</span>
            </div>
          </div>
        </div>

        {/* Character Breakdown Box */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800/80'
        }`}>
          <div className={`text-xs sm:text-sm mb-2.5 flex items-center space-x-2 font-bold ${
            isLight ? 'text-slate-800' : 'text-slate-300'
          }`}>
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Состав символов ({analysis.length} шт):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center font-mono text-xs sm:text-sm">
            <div className={`p-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <span className={`text-[11px] block font-medium truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Заглавные</span>
              <span className="font-bold text-cyan-600 text-base">{analysis.characterStats.uppercase}</span>
            </div>
            <div className={`p-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <span className={`text-[11px] block font-medium truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Строчные</span>
              <span className={`font-bold text-base ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{analysis.characterStats.lowercase}</span>
            </div>
            <div className={`p-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <span className={`text-[11px] block font-medium truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Цифры</span>
              <span className="font-bold text-amber-600 text-base">{analysis.characterStats.digits}</span>
            </div>
            <div className={`p-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <span className={`text-[11px] block font-medium truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Символы</span>
              <span className="font-bold text-rose-600 text-base">{analysis.characterStats.symbols}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings / Security Tips if applicable */}
      {analysis.warnings.length > 0 && (
        <div className={`mt-3 p-3 rounded-xl border text-xs sm:text-sm flex items-start space-x-2.5 ${
          isLight ? 'bg-amber-50 border-amber-200 text-amber-900 font-medium' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
        }`}>
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
          <div className="space-y-1">
            {analysis.warnings.map((warn, i) => (
              <div key={i}>• {warn}</div>
            ))}
          </div>
        </div>
      )}

      {analysis.suggestions.length > 0 && (
        <div className={`mt-3 p-3 rounded-xl border text-xs sm:text-sm flex items-start space-x-2.5 ${
          isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-medium' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
        }`}>
          <Info className="w-5 h-5 shrink-0 text-indigo-600 mt-0.5" />
          <div className="space-y-1">
            {analysis.suggestions.map((sug, i) => (
              <div key={i}>• {sug}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
