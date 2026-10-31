import React, { useState, useEffect, useCallback } from 'react';
import {
  GeneratorMode,
  RandomOptions,
  PassphraseOptions,
  PronounceableOptions,
  PinOptions,
  PatternOptions,
  SavedPasswordItem,
  AppTheme
} from './types';
import {
  generateRandomPassword,
  generatePassphrase,
  generatePronounceablePassword,
  generatePin,
  generatePatternPassword,
  analyzePasswordStrength
} from './utils/passwordGenerator';
import { Header } from './components/Header';
import { PasswordDisplay } from './components/PasswordDisplay';
import { StrengthMeter } from './components/StrengthMeter';
import { GeneratorControls } from './components/GeneratorControls';
import { BatchGenerator } from './components/BatchGenerator';
import { PasswordTools } from './components/PasswordTools';
import { PasswordVault } from './components/PasswordVault';
import { QRCodeModal } from './components/QRCodeModal';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Application Theme & Sound
  const [theme, setTheme] = useState<AppTheme>('light');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'generator' | 'batch' | 'vault' | 'tools'>('generator');

  // Generator Mode
  const [mode, setMode] = useState<GeneratorMode>('random');

  // Mode Options
  const [randomOptions, setRandomOptions] = useState<RandomOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
    customExclude: '',
    minNumbers: 2,
    minSymbols: 2,
  });

  const [passphraseOptions, setPassphraseOptions] = useState<PassphraseOptions>({
    wordCount: 4,
    separator: '-',
    capitalize: 'title',
    includeNumber: true,
    includeSymbol: true,
    language: 'ru',
  });

  const [pronounceableOptions, setPronounceableOptions] = useState<PronounceableOptions>({
    length: 12,
    capitalizeFirst: true,
    addNumberSuffix: true,
  });

  const [pinOptions, setPinOptions] = useState<PinOptions>({
    length: 6,
    allowRepeats: true,
  });

  const [patternOptions, setPatternOptions] = useState<PatternOptions>({
    pattern: 'LLLL-NNNN-SSSS',
  });

  // Current Generated Password & QR Modal State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Vault Items State (Persisted in localStorage)
  const [vaultItems, setVaultItems] = useState<SavedPasswordItem[]>(() => {
    try {
      const saved = localStorage.getItem('password_vault_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [saveToVaultPreset, setSaveToVaultPreset] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem('password_vault_items', JSON.stringify(vaultItems));
    } catch {
      // ignore
    }
  }, [vaultItems]);

  // Main Generator Function
  const handleGenerate = useCallback(() => {
    let result = '';
    if (mode === 'random') {
      result = generateRandomPassword(randomOptions);
    } else if (mode === 'passphrase') {
      result = generatePassphrase(passphraseOptions);
    } else if (mode === 'pronounceable') {
      result = generatePronounceablePassword(pronounceableOptions);
    } else if (mode === 'pin') {
      result = generatePin(pinOptions);
    } else if (mode === 'pattern') {
      result = generatePatternPassword(patternOptions);
    }
    setCurrentPassword(result);
  }, [mode, randomOptions, passphraseOptions, pronounceableOptions, pinOptions, patternOptions]);

  // Trigger initial password generation
  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleSaveToVaultCurrent = () => {
    setSaveToVaultPreset(currentPassword);
    setActiveTab('vault');
  };

  const currentAnalysis = analyzePasswordStrength(currentPassword);

  // Theme Styling CSS Wrapper Class
  const getThemeWrapperClass = () => {
    switch (theme) {
      case 'cyberpunk':
        return 'bg-slate-950 text-cyan-50 selection:bg-cyan-500 selection:text-slate-950';
      case 'midnight':
        return 'bg-black text-slate-100 selection:bg-purple-500 selection:text-white';
      case 'light':
        return 'bg-slate-100 text-slate-900 selection:bg-indigo-500 selection:text-white';
      case 'dark':
      default:
        return 'bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white';
    }
  };

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getThemeWrapperClass()} flex flex-col font-sans antialiased text-base`}>
      {/* Top Application Header */}
      <Header
        theme={theme}
        setTheme={setTheme}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        vaultCount={vaultItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-5 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
        {/* TAB 1: MAIN GENERATOR */}
        {activeTab === 'generator' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Display Card with instant 'Сгенерировать пароль' action */}
            <PasswordDisplay
              theme={theme}
              password={currentPassword}
              analysis={currentAnalysis}
              onRegenerate={handleGenerate}
              onSaveToVault={handleSaveToVaultCurrent}
              onShowQrCode={() => setShowQrModal(true)}
            />

            {/* Controls & Mode Settings (closer to the first screen) */}
            <GeneratorControls
              theme={theme}
              mode={mode}
              setMode={setMode}
              randomOptions={randomOptions}
              setRandomOptions={setRandomOptions}
              passphraseOptions={passphraseOptions}
              setPassphraseOptions={setPassphraseOptions}
              pronounceableOptions={pronounceableOptions}
              setPronounceableOptions={setPronounceableOptions}
              pinOptions={pinOptions}
              setPinOptions={setPinOptions}
              patternOptions={patternOptions}
              setPatternOptions={setPatternOptions}
              onGenerate={handleGenerate}
            />

            {/* Comprehensive Strength Analysis Card */}
            <StrengthMeter theme={theme} analysis={currentAnalysis} />
          </div>
        )}

        {/* TAB 2: BATCH GENERATOR */}
        {activeTab === 'batch' && (
          <div className="animate-fadeIn">
            <BatchGenerator
              theme={theme}
              defaultRandomOpts={randomOptions}
              defaultPassphraseOpts={passphraseOptions}
            />
          </div>
        )}

        {/* TAB 3: VAULT SCRATCHPAD */}
        {activeTab === 'vault' && (
          <div className="animate-fadeIn">
            <PasswordVault
              theme={theme}
              vaultItems={vaultItems}
              setVaultItems={setVaultItems}
              initialNewPassword={saveToVaultPreset}
            />
          </div>
        )}

        {/* TAB 4: SECURITY TOOLS */}
        {activeTab === 'tools' && (
          <div className="animate-fadeIn">
            <PasswordTools theme={theme} />
          </div>
        )}

        {/* Security Best Practices Footer Banner */}
        <section className={`${isLight ? 'bg-white border-slate-200/90 shadow-md text-slate-700' : 'bg-slate-900/60 border-slate-800/80 text-slate-400'} rounded-2xl border p-5 sm:p-6 text-sm space-y-3`}>
          <h3 className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'} text-base flex items-center space-x-2`}>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Советы по безопасности паролей</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800/60'} p-3 rounded-xl border space-y-1`}>
              <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-slate-300'} block text-xs sm:text-sm flex items-center gap-1.5`}>
                <CheckCircle2 className="w-4 h-4 text-cyan-600" /> Длина важнее сложности
              </span>
              <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Пароль из 16 простых символов в сотни раз устойчивее к брутфорсу, чем сложный 8-значный пароль.
              </p>
            </div>

            <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800/60'} p-3 rounded-xl border space-y-1`}>
              <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-slate-300'} block text-xs sm:text-sm flex items-center gap-1.5`}>
                <Lock className="w-4 h-4 text-amber-500" /> Никогда не используйте повторно
              </span>
              <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Утечка пароля с одного сайта может скомпрометировать ваши аккаунты на других ресурсах.
              </p>
            </div>

            <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800/60'} p-3 rounded-xl border space-y-1`}>
              <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-slate-300'} block text-xs sm:text-sm flex items-center gap-1.5`}>
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Двухфакторная аутентификация (2FA)
              </span>
              <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Всегда включайте 2FA (TOTP апплексы или ключ) для важных учетных записей.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* QR Code Modal */}
      <QRCodeModal
        theme={theme}
        password={currentPassword}
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
      />

      {/* Simple Footer */}
      <footer className={`${isLight ? 'border-slate-200 text-slate-600 bg-white/50' : 'border-slate-800/60 text-slate-500'} border-t py-4 text-center text-xs sm:text-sm`}>
        <p>Криптографическая безопасность <code className={`${isLight ? 'text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 font-bold' : 'text-cyan-400'} font-mono`}>crypto.getRandomValues</code> • Все данные обрабатываются строго локально в вашем браузере.</p>
      </footer>
    </div>
  );
}
