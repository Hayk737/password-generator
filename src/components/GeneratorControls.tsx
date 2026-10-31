import React from 'react';
import {
  Sliders,
  KeyRound,
  FileText,
  Hash,
  Layers,
  Sparkles,
  RefreshCw,
  Check,
  Zap,
  CheckSquare,
  Square
} from 'lucide-react';
import {
  GeneratorMode,
  RandomOptions,
  PassphraseOptions,
  PronounceableOptions,
  PinOptions,
  PatternOptions,
  LanguageMode,
  AppTheme
} from '../types';
import { soundFx } from '../utils/soundEffects';

interface GeneratorControlsProps {
  theme?: AppTheme;
  mode: GeneratorMode;
  setMode: (mode: GeneratorMode) => void;
  randomOptions: RandomOptions;
  setRandomOptions: React.Dispatch<React.SetStateAction<RandomOptions>>;
  passphraseOptions: PassphraseOptions;
  setPassphraseOptions: React.Dispatch<React.SetStateAction<PassphraseOptions>>;
  pronounceableOptions: PronounceableOptions;
  setPronounceableOptions: React.Dispatch<React.SetStateAction<PronounceableOptions>>;
  pinOptions: PinOptions;
  setPinOptions: React.Dispatch<React.SetStateAction<PinOptions>>;
  patternOptions: PatternOptions;
  setPatternOptions: React.Dispatch<React.SetStateAction<PatternOptions>>;
  onGenerate: () => void;
}

export const GeneratorControls: React.FC<GeneratorControlsProps> = ({
  theme = 'light',
  mode,
  setMode,
  randomOptions,
  setRandomOptions,
  passphraseOptions,
  setPassphraseOptions,
  pronounceableOptions,
  setPronounceableOptions,
  pinOptions,
  setPinOptions,
  patternOptions,
  setPatternOptions,
  onGenerate,
}) => {
  const isLight = theme === 'light';

  const modes: { id: GeneratorMode; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'random', label: 'Случайный', desc: 'Символы & цифры', icon: <KeyRound className="w-5 h-5" /> },
    { id: 'passphrase', label: 'Фразовый', desc: 'Из понятных слов', icon: <FileText className="w-5 h-5" /> },
    { id: 'pronounceable', label: 'Произносимый', desc: 'Легко запомнить', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'pin', label: 'ПИН-код', desc: 'Только цифры', icon: <Hash className="w-5 h-5" /> },
    { id: 'pattern', label: 'По шаблону', desc: 'Своя структура', icon: <Layers className="w-5 h-5" /> },
  ];

  // Quick preset lengths
  const quickLengths = [8, 12, 16, 24, 32, 64];

  return (
    <div className={`w-full rounded-3xl border p-4 sm:p-6 md:p-7 space-y-5 sm:space-y-7 shadow-xl transition-all ${
      isLight ? 'bg-white border-slate-200/90 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
    }`}>
      {/* Mode Navigation Tabs */}
      <div>
        <label className={`text-xs sm:text-sm font-bold uppercase tracking-wider mb-2.5 sm:mb-3 block flex items-center gap-2 ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}>
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span>Режим генерации</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
          {modes.map((m) => (
            <button
              key={m.id}
              id={`mode-btn-${m.id}`}
              onClick={() => {
                soundFx.playClick();
                setMode(m.id);
              }}
              className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all flex flex-col justify-between ${
                m.id === 'pattern' ? 'col-span-2 sm:col-span-1' : ''
              } ${
                mode === m.id
                  ? isLight
                    ? 'bg-indigo-50/90 border-indigo-500 text-indigo-950 font-bold shadow-md shadow-indigo-500/10'
                    : 'bg-indigo-600/20 border-indigo-500/60 text-white shadow-lg shadow-indigo-500/10'
                  : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <span className={mode === m.id ? 'text-indigo-600' : 'text-slate-400'}>{m.icon}</span>
                {mode === m.id && <Check className="w-4 h-4 text-indigo-600" />}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold leading-tight">{m.label}</div>
                <div className={`text-[11px] sm:text-xs line-clamp-1 mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Generate Button right near top / first screen */}
      <div>
        <button
          id="generate-cta-btn-top"
          onClick={() => {
            soundFx.playGenerate();
            onGenerate();
          }}
          className="w-full py-3.5 sm:py-4 px-6 rounded-2xl font-extrabold text-base sm:text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-xl shadow-indigo-600/25 flex items-center justify-center space-x-2.5 transition-all active:scale-[0.99] group cursor-pointer"
        >
          <Zap className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
          <span>Сгенерировать пароль</span>
        </button>
      </div>

      <div className={`border-t pt-5 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        {/* MODE 1: RANDOM */}
        {mode === 'random' && (
          <div className="space-y-6">
            {/* Length Control Slider & Numerical Input */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-base font-bold text-slate-800 sm:text-lg">Длина пароля</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={4}
                    max={128}
                    value={randomOptions.length}
                    onChange={(e) => {
                      const val = Math.min(128, Math.max(4, parseInt(e.target.value) || 4));
                      setRandomOptions((prev) => ({ ...prev, length: val }));
                    }}
                    className={`w-20 border rounded-xl px-2.5 py-1.5 text-center font-mono text-base font-extrabold focus:outline-none focus:border-indigo-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-indigo-700' : 'bg-slate-950 border-slate-700 text-cyan-400'
                    }`}
                  />
                  <span className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>симв.</span>
                </div>
              </div>

              <input
                type="range"
                min={4}
                max={128}
                value={randomOptions.length}
                onChange={(e) => {
                  setRandomOptions((prev) => ({ ...prev, length: parseInt(e.target.value) }));
                }}
                className={`w-full h-3 rounded-lg appearance-none cursor-pointer accent-indigo-600 ${
                  isLight ? 'bg-slate-200' : 'bg-slate-950'
                }`}
              />

              {/* Quick length chips */}
              <div className="flex items-center space-x-3 mt-3">
                <span className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Быстрый выбор:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {quickLengths.map((len) => (
                    <button
                      key={len}
                      onClick={() => {
                        soundFx.playClick();
                        setRandomOptions((prev) => ({ ...prev, length: len }));
                      }}
                      className={`px-3 py-1 rounded-xl text-sm font-mono font-bold transition-all ${
                        randomOptions.length === len
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : isLight
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Included Sets Toggles */}
            <div>
              <label className={`text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 block ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Используемые наборы символов
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Uppercase */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    randomOptions.includeUppercase
                      ? isLight ? 'bg-indigo-50/70 border-indigo-400 text-slate-900 shadow-sm' : 'bg-slate-800/80 border-indigo-500/50 text-white'
                      : isLight ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-extrabold text-cyan-600 text-base">A-Z</span>
                    <span className="text-sm sm:text-base font-semibold">Заглавные буквы</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={randomOptions.includeUppercase}
                    onChange={(e) =>
                      setRandomOptions((prev) => ({ ...prev, includeUppercase: e.target.checked }))
                    }
                    className="hidden"
                  />
                  {randomOptions.includeUppercase ? (
                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </label>

                {/* Lowercase */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    randomOptions.includeLowercase
                      ? isLight ? 'bg-indigo-50/70 border-indigo-400 text-slate-900 shadow-sm' : 'bg-slate-800/80 border-indigo-500/50 text-white'
                      : isLight ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`font-mono font-extrabold text-base ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>a-z</span>
                    <span className="text-sm sm:text-base font-semibold">Строчные буквы</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={randomOptions.includeLowercase}
                    onChange={(e) =>
                      setRandomOptions((prev) => ({ ...prev, includeLowercase: e.target.checked }))
                    }
                    className="hidden"
                  />
                  {randomOptions.includeLowercase ? (
                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </label>

                {/* Numbers */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    randomOptions.includeNumbers
                      ? isLight ? 'bg-indigo-50/70 border-indigo-400 text-slate-900 shadow-sm' : 'bg-slate-800/80 border-indigo-500/50 text-white'
                      : isLight ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-extrabold text-amber-600 text-base">0-9</span>
                    <span className="text-sm sm:text-base font-semibold">Цифры</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={randomOptions.includeNumbers}
                    onChange={(e) =>
                      setRandomOptions((prev) => ({ ...prev, includeNumbers: e.target.checked }))
                    }
                    className="hidden"
                  />
                  {randomOptions.includeNumbers ? (
                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </label>

                {/* Symbols */}
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    randomOptions.includeSymbols
                      ? isLight ? 'bg-indigo-50/70 border-indigo-400 text-slate-900 shadow-sm' : 'bg-slate-800/80 border-indigo-500/50 text-white'
                      : isLight ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-extrabold text-rose-600 text-base">!@#$</span>
                    <span className="text-sm sm:text-base font-semibold">Спецсимволы</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={randomOptions.includeSymbols}
                    onChange={(e) =>
                      setRandomOptions((prev) => ({ ...prev, includeSymbols: e.target.checked }))
                    }
                    className="hidden"
                  />
                  {randomOptions.includeSymbols ? (
                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </label>
              </div>
            </div>

            {/* Advanced Exclusions & Rules */}
            <div className={`space-y-4 p-4.5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800/80'
            }`}>
              <label className={`text-xs sm:text-sm font-bold uppercase tracking-wider block ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Исключения и правила
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium">
                {/* Exclude Similar */}
                <label className="flex items-center space-x-2.5 cursor-pointer text-slate-800">
                  <input
                    type="checkbox"
                    checked={randomOptions.excludeSimilar}
                    onChange={(e) =>
                      setRandomOptions((prev) => ({ ...prev, excludeSimilar: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-0"
                  />
                  <span>Исключить похожие <code className="text-amber-700 font-mono font-bold">(i, l, 1, L, o, 0, O)</code></span>
                </label>

                {/* Exclude Ambiguous */}
                <label className="flex items-center space-x-2.5 cursor-pointer text-slate-800">
                  <input
                    type="checkbox"
                    checked={randomOptions.excludeAmbiguous}
                    onChange={(e) =>
                      setRandomOptions((prev) => ({ ...prev, excludeAmbiguous: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-0"
                  />
                  <span>Исключить двусмысленные <code className="text-rose-700 font-mono font-bold">([ ] &#123; &#125; ( ) / \ ~)</code></span>
                </label>
              </div>

              {/* Custom Exclude Chars */}
              <div className="pt-2">
                <label className={`text-xs sm:text-sm font-semibold mb-1.5 block ${
                  isLight ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  Собственные исключаемые символы:
                </label>
                <input
                  type="text"
                  placeholder="Например: $ % ^ & *"
                  value={randomOptions.customExclude}
                  onChange={(e) =>
                    setRandomOptions((prev) => ({ ...prev, customExclude: e.target.value }))
                  }
                  className={`w-full border rounded-xl px-3.5 py-2 font-mono text-sm focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700/80 text-slate-200'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: PASSPHRASE */}
        {mode === 'passphrase' && (
          <div className="space-y-5">
            {/* Word Count */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-base font-bold text-slate-800">Количество слов</label>
                <span className="font-mono text-base font-bold text-indigo-600">
                  {passphraseOptions.wordCount} слов
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={10}
                value={passphraseOptions.wordCount}
                onChange={(e) =>
                  setPassphraseOptions((prev) => ({ ...prev, wordCount: parseInt(e.target.value) }))
                }
                className={`w-full h-3 rounded-lg appearance-none cursor-pointer accent-indigo-600 ${
                  isLight ? 'bg-slate-200' : 'bg-slate-950'
                }`}
              />
            </div>

            {/* Language & Separator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`text-xs sm:text-sm font-bold mb-1.5 block ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                  Язык словаря:
                </label>
                <select
                  value={passphraseOptions.language}
                  onChange={(e) =>
                    setPassphraseOptions((prev) => ({
                      ...prev,
                      language: e.target.value as LanguageMode,
                    }))
                  }
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-200'
                  }`}
                >
                  <option value="ru">Русский словарь</option>
                  <option value="en">Английский словарь (English)</option>
                  <option value="mixed">Смешанный (RU + EN)</option>
                </select>
              </div>

              <div>
                <label className={`text-xs sm:text-sm font-bold mb-1.5 block ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                  Разделитель слов:
                </label>
                <select
                  value={passphraseOptions.separator}
                  onChange={(e) =>
                    setPassphraseOptions((prev) => ({ ...prev, separator: e.target.value }))
                  }
                  className={`w-full border rounded-xl px-3.5 py-2.5 font-mono text-sm focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-200'
                  }`}
                >
                  <option value="-">Дефис (-)</option>
                  <option value="_">Нижнее подчеркивание (_)</option>
                  <option value=".">Точка (.)</option>
                  <option value=" ">Пробел ( )</option>
                  <option value="#">Решетка (#)</option>
                  <option value="/">Слэш (/)</option>
                </select>
              </div>
            </div>

            {/* Capitalization & Addons */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border text-sm font-medium ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'
            }`}>
              <div>
                <label className={`mb-1.5 block font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Регистр букв:</label>
                <select
                  value={passphraseOptions.capitalize}
                  onChange={(e) =>
                    setPassphraseOptions((prev) => ({
                      ...prev,
                      capitalize: e.target.value as PassphraseOptions['capitalize'],
                    }))
                  }
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-200'
                  }`}
                >
                  <option value="title">Заглавные С Первой (Title Case)</option>
                  <option value="none">все строчные (lowercase)</option>
                  <option value="upper">ВСЕ ЗАГЛАВНЫЕ (UPPERCASE)</option>
                  <option value="random">Случайный регистр</option>
                </select>
              </div>

              <div className="space-y-2.5 pt-1">
                <label className="flex items-center space-x-2.5 cursor-pointer text-slate-800">
                  <input
                    type="checkbox"
                    checked={passphraseOptions.includeNumber}
                    onChange={(e) =>
                      setPassphraseOptions((prev) => ({ ...prev, includeNumber: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                  />
                  <span>Добавить цифру в конец</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer text-slate-800">
                  <input
                    type="checkbox"
                    checked={passphraseOptions.includeSymbol}
                    onChange={(e) =>
                      setPassphraseOptions((prev) => ({ ...prev, includeSymbol: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                  />
                  <span>Добавить спецсимвол</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: PRONOUNCEABLE */}
        {mode === 'pronounceable' && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-base font-bold text-slate-800">Длина слова</label>
                <span className="font-mono text-base font-bold text-indigo-600">
                  {pronounceableOptions.length} символов
                </span>
              </div>
              <input
                type="range"
                min={4}
                max={32}
                value={pronounceableOptions.length}
                onChange={(e) =>
                  setPronounceableOptions((prev) => ({
                    ...prev,
                    length: parseInt(e.target.value),
                  }))
                }
                className={`w-full h-3 rounded-lg appearance-none cursor-pointer accent-indigo-600 ${
                  isLight ? 'bg-slate-200' : 'bg-slate-950'
                }`}
              />
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border text-sm font-medium ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'
            }`}>
              <label className="flex items-center space-x-2.5 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={pronounceableOptions.capitalizeFirst}
                  onChange={(e) =>
                    setPronounceableOptions((prev) => ({
                      ...prev,
                      capitalizeFirst: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                />
                <span>Заглавная первая буква</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={pronounceableOptions.addNumberSuffix}
                  onChange={(e) =>
                    setPronounceableOptions((prev) => ({
                      ...prev,
                      addNumberSuffix: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600"
                />
                <span>Числовой суффикс в конце (10-99)</span>
              </label>
            </div>
          </div>
        )}

        {/* MODE 4: PIN CODE */}
        {mode === 'pin' && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-base font-bold text-slate-800">Длина ПИН-кода</label>
                <span className="font-mono text-base font-bold text-indigo-600">
                  {pinOptions.length} цифр
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={12}
                value={pinOptions.length}
                onChange={(e) =>
                  setPinOptions((prev) => ({ ...prev, length: parseInt(e.target.value) }))
                }
                className={`w-full h-3 rounded-lg appearance-none cursor-pointer accent-indigo-600 ${
                  isLight ? 'bg-slate-200' : 'bg-slate-950'
                }`}
              />
            </div>

            <label className={`flex items-center space-x-2.5 cursor-pointer text-sm font-medium p-4 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/50 border-slate-800 text-slate-300'
            }`}>
              <input
                type="checkbox"
                checked={pinOptions.allowRepeats}
                onChange={(e) =>
                  setPinOptions((prev) => ({ ...prev, allowRepeats: e.target.checked }))
                }
                className="w-4 h-4 rounded border-slate-300 text-indigo-600"
              />
              <span>Разрешить повторяющиеся цифры (например: 7712)</span>
            </label>
          </div>
        )}

        {/* MODE 5: PATTERN / TEMPLATE */}
        {mode === 'pattern' && (
          <div className="space-y-5">
            <div>
              <label className={`text-xs sm:text-sm font-bold mb-1.5 block ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                Строка шаблона:
              </label>
              <input
                type="text"
                value={patternOptions.pattern}
                onChange={(e) => setPatternOptions({ pattern: e.target.value })}
                className={`w-full border rounded-xl px-4 py-2.5 font-mono text-base font-bold focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-indigo-700' : 'bg-slate-950 border-slate-700 text-cyan-400'
                }`}
                placeholder="например: LLL-NNN-SSS"
              />
              <div className={`text-xs sm:text-sm mt-2 flex flex-wrap gap-3 font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                <span>
                  <code className="text-cyan-600 font-bold">L</code> = Буква (A-Z)
                </span>
                <span>
                  <code className="text-slate-800 font-bold">l</code> = строчная (a-z)
                </span>
                <span>
                  <code className="text-amber-600 font-bold">N</code> = Цифра (0-9)
                </span>
                <span>
                  <code className="text-rose-600 font-bold">S</code> = Символ (!@#)
                </span>
              </div>
            </div>

            <div>
              <label className={`text-xs sm:text-sm font-bold mb-2 block ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                Предустановленные шаблоны:
              </label>
              <div className="flex flex-wrap gap-2">
                {['LLLL-NNNN', 'LLll-NNNS', 'LLLL-LLLL-LLLL', 'NNNN-NNNN-NNNN', 'AAAA-AAAA'].map(
                  (pat) => (
                    <button
                      key={pat}
                      onClick={() => {
                        soundFx.playClick();
                        setPatternOptions({ pattern: pat });
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-mono font-bold transition-all ${
                        isLight
                          ? 'bg-slate-100 border-slate-200 text-slate-800 hover:border-indigo-500 hover:bg-indigo-50'
                          : 'bg-slate-800 border-slate-700 hover:border-indigo-500 text-slate-300'
                      }`}
                    >
                      {pat}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Generate CTA Button */}
      <div className="pt-2">
        <button
          id="generate-cta-btn"
          onClick={() => {
            soundFx.playGenerate();
            onGenerate();
          }}
          className="w-full py-4 px-6 rounded-2xl font-extrabold text-base sm:text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-xl shadow-indigo-600/25 flex items-center justify-center space-x-2.5 transition-all active:scale-[0.99]"
        >
          <Zap className="w-5 h-5 fill-white" />
          <span>Сгенерировать Пароль</span>
        </button>
      </div>
    </div>
  );
};
