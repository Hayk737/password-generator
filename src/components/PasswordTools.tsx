import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Hash,
  Wifi,
  Eye,
  EyeOff,
  Copy,
  Check,
  QrCode,
  Sparkles,
  Download
} from 'lucide-react';
import QRCode from 'qrcode';
import { AppTheme } from '../types';
import { analyzePasswordStrength, generateHash } from '../utils/passwordGenerator';
import { StrengthMeter } from './StrengthMeter';
import { soundFx } from '../utils/soundEffects';

interface PasswordToolsProps {
  theme?: AppTheme;
}

export const PasswordTools: React.FC<PasswordToolsProps> = ({ theme = 'light' }) => {
  const [activeToolTab, setActiveToolTab] = useState<'audit' | 'hash' | 'wifi'>('audit');

  const isLight = theme === 'light';

  // Tool 1: Audit
  const [testPassword, setTestPassword] = useState<string>('');
  const [showTestPassword, setShowTestPassword] = useState<boolean>(true);

  // Tool 2: Hash
  const [inputText, setInputText] = useState<string>('');
  const [sha256Hash, setSha256Hash] = useState<string>('');
  const [sha512Hash, setSha512Hash] = useState<string>('');
  const [sha1Hash, setSha1Hash] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Tool 3: WiFi QR
  const [wifiSsid, setWifiSsid] = useState<string>('MyHomeWiFi');
  const [wifiPassword, setWifiPassword] = useState<string>('SuperSecretPass123!');
  const [wifiSecurity, setWifiSecurity] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Update Hashes
  useEffect(() => {
    if (!inputText) {
      setSha256Hash('');
      setSha512Hash('');
      setSha1Hash('');
      return;
    }
    const compute = async () => {
      const h256 = await generateHash(inputText, 'SHA-256');
      const h512 = await generateHash(inputText, 'SHA-512');
      const h1 = await generateHash(inputText, 'SHA-1');
      setSha256Hash(h256);
      setSha512Hash(h512);
      setSha1Hash(h1);
    };
    compute();
  }, [inputText]);

  // Update WiFi QR Code
  useEffect(() => {
    if (!wifiSsid) return;
    // Format: WIFI:T:WPA;S:mynetwork;P:mypass;H:true;;
    const payload = `WIFI:T:${wifiSecurity};S:${wifiSsid};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
    QRCode.toDataURL(payload, {
      width: 250,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});
  }, [wifiSsid, wifiPassword, wifiSecurity, wifiHidden]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(label);
      soundFx.playCopySuccess();
      setTimeout(() => setCopiedHash(null), 1500);
    } catch {
      // ignore
    }
  };

  const downloadQrCode = () => {
    if (!qrDataUrl) return;
    soundFx.playClick();
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `wifi_qr_${wifiSsid}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const auditResult = analyzePasswordStrength(testPassword);

  return (
    <div className={`w-full rounded-3xl border p-4 sm:p-6 md:p-7 space-y-5 sm:space-y-6 shadow-xl transition-all ${
      isLight ? 'bg-white border-slate-200/90 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
    }`}>
      {/* Tools Navigation Sub-header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4 border-b pb-4 ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div>
          <h2 className={`text-xl font-extrabold flex items-center space-x-2.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Sparkles className="w-6 h-6 text-indigo-600 shrink-0" />
            <span>Инструменты & Утилиты безопасности</span>
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
            Локальная проверка паролей, хэширование данных и генерация WiFi QR
          </p>
        </div>

        <div className={`flex items-center p-1 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-bold w-full sm:w-auto overflow-x-auto scrollbar-none justify-between sm:justify-start ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveToolTab('audit');
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all whitespace-nowrap ${
              activeToolTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Аудит</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveToolTab('hash');
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all whitespace-nowrap ${
              activeToolTab === 'hash'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hash className="w-4 h-4 shrink-0" />
            <span>Хэширование</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveToolTab('wifi');
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all whitespace-nowrap ${
              activeToolTab === 'wifi'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-4 h-4 shrink-0" />
            <span>WiFi QR</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AUDIT */}
      {activeToolTab === 'audit' && (
        <div className="space-y-5">
          <div>
            <label className={`text-sm font-bold mb-2 block ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
              Введите или вставьте свой текущий пароль для анализа:
            </label>
            <div className="relative">
              <input
                type={showTestPassword ? 'text' : 'password'}
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="Введи пароль для тестирования..."
                className={`w-full border rounded-2xl px-4 py-3.5 font-mono text-base font-bold pr-12 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowTestPassword(!showTestPassword)}
                className={`absolute right-3.5 top-4 ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
              >
                {showTestPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {testPassword ? (
            <StrengthMeter theme={theme} analysis={auditResult} />
          ) : (
            <div className={`text-center py-10 rounded-2xl border text-sm font-medium ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
            }`}>
              Введи любой пароль выше, чтобы узнать время его взлома, энтропию и потенциальные уязвимости.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HASH CONVERTER */}
      {activeToolTab === 'hash' && (
        <div className="space-y-5">
          <div>
            <label className={`text-sm font-bold mb-2 block ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
              Текст для хэширования (Crypto API):
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Введите любой текст или пароль..."
              rows={2}
              className={`w-full border rounded-2xl p-3.5 font-mono text-sm font-medium focus:outline-none focus:border-indigo-500 ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-100'
              }`}
            />
          </div>

          <div className="space-y-3.5 font-mono text-sm">
            {/* SHA-256 */}
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <span className="font-extrabold text-indigo-600 text-sm">SHA-256</span>
                {sha256Hash && (
                  <button
                    onClick={() => copyToClipboard(sha256Hash, 'sha256')}
                    className="flex items-center space-x-1.5 font-bold text-slate-500 hover:text-indigo-600"
                  >
                    {copiedHash === 'sha256' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>Копировать</span>
                  </button>
                )}
              </div>
              <div className={`break-all font-bold select-all ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                {sha256Hash || '...'}
              </div>
            </div>

            {/* SHA-512 */}
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <span className="font-extrabold text-indigo-600 text-sm">SHA-512</span>
                {sha512Hash && (
                  <button
                    onClick={() => copyToClipboard(sha512Hash, 'sha512')}
                    className="flex items-center space-x-1.5 font-bold text-slate-500 hover:text-indigo-600"
                  >
                    {copiedHash === 'sha512' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>Копировать</span>
                  </button>
                )}
              </div>
              <div className={`break-all font-bold select-all max-h-24 overflow-y-auto ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                {sha512Hash || '...'}
              </div>
            </div>

            {/* SHA-1 */}
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <span className="font-extrabold text-amber-600 text-sm">SHA-1</span>
                {sha1Hash && (
                  <button
                    onClick={() => copyToClipboard(sha1Hash, 'sha1')}
                    className="flex items-center space-x-1.5 font-bold text-slate-500 hover:text-indigo-600"
                  >
                    {copiedHash === 'sha1' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>Копировать</span>
                  </button>
                )}
              </div>
              <div className={`break-all font-bold select-all ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                {sha1Hash || '...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WIFI QR GENERATOR */}
      {activeToolTab === 'wifi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4 text-sm font-medium">
            <div>
              <label className={`mb-1.5 block font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Имя сети (SSID):</label>
              <input
                type="text"
                value={wifiSsid}
                onChange={(e) => setWifiSsid(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 font-mono font-bold focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-200'
                }`}
              />
            </div>

            <div>
              <label className={`mb-1.5 block font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Пароль от WiFi:</label>
              <input
                type="text"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 font-mono font-bold focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-200'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`mb-1.5 block font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Тип шифрования:</label>
                <select
                  value={wifiSecurity}
                  onChange={(e) => setWifiSecurity(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                  className={`w-full border rounded-xl px-3 py-2.5 font-medium focus:outline-none ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-slate-200'
                  }`}
                >
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Без пароля</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className={`flex items-center space-x-2.5 cursor-pointer font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  <input
                    type="checkbox"
                    checked={wifiHidden}
                    onChange={(e) => setWifiHidden(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-100 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Скрытая сеть</span>
                </label>
              </div>
            </div>
          </div>

          {/* QR Preview Card */}
          <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center space-y-4 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                <img src={qrDataUrl} alt="WiFi QR Code" className="w-48 h-48 object-contain" />
              </div>
            ) : (
              <div className="w-48 h-48 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
                <QrCode className="w-14 h-14" />
              </div>
            )}

            <button
              onClick={downloadQrCode}
              className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Скачать QR-код PNG</span>
            </button>
            <p className={`text-xs text-center font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Отсканируйте камерой смартфона для автоматического подключения к WiFi
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
