import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  RefreshCw,
  Layers,
  FileText,
  Search,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { RandomOptions, PassphraseOptions, AppTheme } from '../types';
import {
  generateRandomPassword,
  generatePassphrase,
  calculateEntropy
} from '../utils/passwordGenerator';
import { soundFx } from '../utils/soundEffects';

interface BatchGeneratorProps {
  theme?: AppTheme;
  defaultRandomOpts: RandomOptions;
  defaultPassphraseOpts: PassphraseOptions;
}

export const BatchGenerator: React.FC<BatchGeneratorProps> = ({
  theme = 'light',
  defaultRandomOpts,
  defaultPassphraseOpts,
}) => {
  const [count, setCount] = useState<number>(10);
  const [batchType, setBatchType] = useState<'random' | 'passphrase'>('random');
  const [passwords, setPasswords] = useState<Array<{ id: number; text: string; entropy: number }>>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isLight = theme === 'light';

  const generateBatch = () => {
    soundFx.playGenerate();
    const list: Array<{ id: number; text: string; entropy: number }> = [];

    for (let i = 0; i < count; i++) {
      let pwd = '';
      if (batchType === 'random') {
        pwd = generateRandomPassword(defaultRandomOpts);
      } else {
        pwd = generatePassphrase(defaultPassphraseOpts);
      }
      list.push({
        id: i + 1,
        text: pwd,
        entropy: calculateEntropy(pwd),
      });
    }

    setPasswords(list);
  };

  useEffect(() => {
    generateBatch();
    // eslint-disable-next-line react-hooks.exhaustive-deps
  }, [count, batchType]);

  const copyIndividual = async (id: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      soundFx.playCopySuccess();
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // ignore
    }
  };

  const copyAll = async () => {
    const fullText = passwords.map((p) => p.text).join('\n');
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedAll(true);
      soundFx.playCopySuccess();
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // ignore
    }
  };

  const downloadFile = (format: 'txt' | 'csv' | 'json') => {
    soundFx.playClick();
    let content = '';
    let mimeType = 'text/plain';
    let fileName = `passwords_batch_${Date.now()}.${format}`;

    if (format === 'txt') {
      content = passwords.map((p) => p.text).join('\n');
    } else if (format === 'csv') {
      mimeType = 'text/csv';
      content = 'ID,Password,EntropyBits\n' + passwords.map((p) => `${p.id},"${p.text}",${p.entropy}`).join('\n');
    } else if (format === 'json') {
      mimeType = 'application/json';
      content = JSON.stringify(passwords, null, 2);
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredPasswords = passwords.filter((p) =>
    p.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`w-full rounded-3xl border p-4 sm:p-6 md:p-7 space-y-5 sm:space-y-6 shadow-xl transition-all ${
      isLight ? 'bg-white border-slate-200/90 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
    }`}>
      {/* Batch Header & Controls */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4 pb-4 border-b ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div>
          <h2 className={`text-xl font-extrabold flex items-center space-x-2.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Layers className="w-6 h-6 text-indigo-600 shrink-0" />
            <span>Пакетная генерация паролей</span>
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
            Создайте до 50 паролей одновременно и экспортируйте в TXT, CSV или JSON
          </p>
        </div>

        <div className="flex items-center space-x-2 self-stretch sm:self-auto">
          <button
            onClick={generateBatch}
            className="w-full sm:w-auto justify-center flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            <span>Обновить весь список</span>
          </button>
        </div>
      </div>

      {/* Settings Row */}
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border text-sm ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
      }`}>
        {/* Type Selector */}
        <div>
          <label className={`font-bold mb-1.5 block text-xs sm:text-sm ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Тип генерации:</label>
          <div className={`grid grid-cols-2 gap-1.5 p-1 rounded-xl border ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <button
              onClick={() => {
                soundFx.playClick();
                setBatchType('random');
              }}
              className={`py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                batchType === 'random'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Случайные
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setBatchType('passphrase');
              }}
              className={`py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                batchType === 'passphrase'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Фразовые
            </button>
          </div>
        </div>

        {/* Amount Slider */}
        <div className="sm:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between font-bold mb-1 text-xs sm:text-sm">
            <span className={isLight ? 'text-slate-800' : 'text-slate-300'}>Количество паролей в пачке:</span>
            <span className="font-mono text-indigo-600 font-extrabold text-sm sm:text-base">{count} шт.</span>
          </div>
          <input
            type="range"
            min={2}
            max={50}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            className={`w-full h-3 rounded-lg appearance-none cursor-pointer accent-indigo-600 ${
              isLight ? 'bg-slate-200' : 'bg-slate-900'
            }`}
          />
        </div>
      </div>

      {/* Export Toolbar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Search filter */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по результатам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-3.5 py-2 border rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-indigo-500 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-200'
            }`}
          />
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            onClick={copyAll}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border shrink-0 transition-all ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {copiedAll ? <Check className="w-4 h-4 text-emerald-500 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
            <span className="whitespace-nowrap">{copiedAll ? 'Скопировано!' : 'Скопировать все'}</span>
          </button>

          <button
            onClick={() => downloadFile('txt')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border shrink-0 transition-all ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Скачать TXT"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>TXT</span>
          </button>

          <button
            onClick={() => downloadFile('csv')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border shrink-0 transition-all ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Скачать CSV"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => downloadFile('json')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border shrink-0 transition-all ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Скачать JSON"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Generated List Grid */}
      <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1 font-mono text-sm sm:text-base scrollbar-thin scrollbar-thumb-slate-300">
        {filteredPasswords.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
              isLight ? 'bg-slate-50 border-slate-200/90 hover:border-slate-300' : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3.5 min-w-0 pr-2">
              <span className={`text-xs w-6 text-right font-bold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{item.id}.</span>
              <span className={`truncate select-all font-bold tracking-wide ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                {item.text}
              </span>
            </div>

            <div className="flex items-center space-x-2.5 shrink-0">
              <span
                className={`text-xs px-2.5 py-1 rounded-full border font-bold ${
                  item.entropy >= 80
                    ? isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    : item.entropy >= 50
                    ? isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {item.entropy} bits
              </span>

              <button
                onClick={() => copyIndividual(item.id, item.text)}
                title="Скопировать этот пароль"
                className={`p-2 rounded-xl border transition-all ${
                  isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm' : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                {copiedId === item.id ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}

        {filteredPasswords.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-sm font-medium">
            Ничего не найдено по вашему запросу.
          </div>
        )}
      </div>
    </div>
  );
};
