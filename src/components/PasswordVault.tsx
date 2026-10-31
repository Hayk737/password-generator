import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Search,
  Download,
  Upload,
  ShieldAlert,
  Tag,
  Key
} from 'lucide-react';
import { SavedPasswordItem, AppTheme } from '../types';
import { calculateEntropy } from '../utils/passwordGenerator';
import { soundFx } from '../utils/soundEffects';

interface PasswordVaultProps {
  theme?: AppTheme;
  vaultItems: SavedPasswordItem[];
  setVaultItems: React.Dispatch<React.SetStateAction<SavedPasswordItem[]>>;
  initialNewPassword?: string;
}

export const PasswordVault: React.FC<PasswordVaultProps> = ({
  theme = 'light',
  vaultItems,
  setVaultItems,
  initialNewPassword = '',
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleIds, setVisibleIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isLight = theme === 'light';

  // New Item Modal/Form State
  const [isAddingNew, setIsAddingNew] = useState<boolean>(!!initialNewPassword);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newValue, setNewValue] = useState<string>(initialNewPassword);
  const [newCategory, setNewCategory] = useState<SavedPasswordItem['category']>('general');
  const [newNotes, setNewNotes] = useState<string>('');

  // Lock Screen State
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [masterPin, setMasterPin] = useState<string>('');
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);
  const [setupPinInput, setSetupPinInput] = useState<string>('');

  useEffect(() => {
    if (initialNewPassword) {
      setNewValue(initialNewPassword);
      setIsAddingNew(true);
    }
  }, [initialNewPassword]);

  // Load Saved Pin from localStorage
  useEffect(() => {
    const savedPin = localStorage.getItem('vault_master_pin');
    if (savedPin) {
      setMasterPin(savedPin);
      setIsLocked(true);
    }
  }, []);

  const handleSetMasterPin = () => {
    if (setupPinInput.length < 4) return;
    localStorage.setItem('vault_master_pin', setupPinInput);
    setMasterPin(setupPinInput);
    setIsLocked(true);
    setSetupPinInput('');
  };

  const handleUnlock = () => {
    if (enteredPin === masterPin) {
      setIsLocked(false);
      setPinError(false);
      setEnteredPin('');
      soundFx.playCopySuccess();
    } else {
      setPinError(true);
      soundFx.playClick();
    }
  };

  const handleRemovePin = () => {
    if (window.confirm('Удалить защиту ПИН-кодом?')) {
      localStorage.removeItem('vault_master_pin');
      setMasterPin('');
      setIsLocked(false);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newValue) return;

    const newItem: SavedPasswordItem = {
      id: Date.now().toString(),
      title: newTitle,
      passwordValue: newValue,
      category: newCategory,
      notes: newNotes,
      createdAt: Date.now(),
      entropyBits: calculateEntropy(newValue),
    };

    setVaultItems((prev) => [newItem, ...prev]);
    soundFx.playCopySuccess();

    // Reset Form
    setNewTitle('');
    setNewValue('');
    setNewNotes('');
    setIsAddingNew(false);
  };

  const handleDeleteItem = (id: string) => {
    soundFx.playClick();
    setVaultItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleVisibility = (id: string) => {
    soundFx.playClick();
    setVisibleIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyPassword = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      soundFx.playCopySuccess();
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // ignore
    }
  };

  const exportBackup = () => {
    soundFx.playClick();
    const blob = new Blob([JSON.stringify(vaultItems, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `password_vault_backup_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (Array.isArray(data)) {
          setVaultItems(data);
          soundFx.playCopySuccess();
        }
      } catch {
        alert('Ошибка при импорте резервной копии');
      }
    };
    reader.readAsText(file);
  };

  const filteredItems = vaultItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'Все' },
    { id: 'general', label: 'Общее' },
    { id: 'wifi', label: 'WiFi' },
    { id: 'social', label: 'Соцсети' },
    { id: 'work', label: 'Работа' },
    { id: 'finance', label: 'Банки' },
  ];

  // Render Master Lock Screen
  if (isLocked) {
    return (
      <div className={`w-full rounded-3xl border p-8 shadow-2xl flex flex-col items-center justify-center text-center space-y-4 my-6 ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
      }`}>
        <div className="p-4 bg-indigo-600/20 text-indigo-600 rounded-full border border-indigo-500/30">
          <Lock className="w-10 h-10 animate-pulse" />
        </div>
        <h3 className={`text-2xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Сейф заблокирован</h3>
        <p className={`text-sm max-w-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Введите ПИН-код для разблокировки сохраненных записей
        </p>

        <div className="space-y-3.5 w-full max-w-xs">
          <input
            type="password"
            maxLength={8}
            placeholder="ПИН-код"
            value={enteredPin}
            onChange={(e) => {
              setEnteredPin(e.target.value);
              setPinError(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            className={`w-full border rounded-2xl px-4 py-3 text-center font-mono text-xl font-bold focus:outline-none focus:border-indigo-500 ${
              isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-cyan-400'
            }`}
          />

          {pinError && <p className="text-sm text-rose-600 font-bold">Неверный ПИН-код!</p>}

          <button
            onClick={handleUnlock}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-extrabold transition-all shadow-lg shadow-indigo-600/25 active:scale-95"
          >
            Разблокировать
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full rounded-3xl border p-5 sm:p-7 space-y-6 shadow-xl transition-all ${
      isLight ? 'bg-white border-slate-200/90 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-slate-100'
    }`}>
      {/* Vault Header & Toolbar */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4 border-b pb-4 ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div>
          <h2 className={`text-xl font-extrabold flex items-center space-x-2.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Bookmark className="w-6 h-6 text-emerald-500 shrink-0" />
            <span>Защищенный Сейф Записей</span>
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
            Локальное хранилище паролей в вашем браузере (LocalStorage)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          {masterPin ? (
            <button
              onClick={() => setIsLocked(true)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Заблокировать</span>
            </button>
          ) : (
            <div className={`flex items-center space-x-1.5 p-1 rounded-xl border text-xs ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <input
                type="password"
                placeholder="Новый ПИН"
                value={setupPinInput}
                onChange={(e) => setSetupPinInput(e.target.value)}
                className={`w-20 sm:w-24 px-2 py-1.5 rounded-lg text-center text-xs font-bold focus:outline-none ${
                  isLight ? 'bg-white text-slate-900 border border-slate-200' : 'bg-slate-900 text-slate-200'
                }`}
              />
              <button
                onClick={handleSetMasterPin}
                className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500 whitespace-nowrap"
              >
                Задать ПИН
              </button>
            </div>
          )}

          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Добавить запись</span>
          </button>
        </div>
      </div>

      {/* Add Item Drawer Form */}
      {isAddingNew && (
        <form
          onSubmit={handleAddItem}
          className={`p-5 rounded-2xl border space-y-4 animate-fadeIn ${
            isLight ? 'bg-slate-50 border-indigo-200 shadow-md' : 'bg-slate-950 border-indigo-500/30'
          }`}
        >
          <div className="text-sm font-extrabold text-indigo-600 flex items-center space-x-2">
            <Key className="w-4 h-4" />
            <span>Новая запись в Сейф</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
            <div>
              <label className={`mb-1.5 block font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Название (Сервис / Назначение):</label>
              <input
                type="text"
                placeholder="Например: GitHub Work / Домашний WiFi"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-200'
                }`}
              />
            </div>

            <div>
              <label className={`mb-1.5 block font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Пароль:</label>
              <input
                type="text"
                required
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 font-mono font-bold focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-white border-slate-300 text-indigo-700' : 'bg-slate-900 border-slate-700 text-cyan-400'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
            <div>
              <label className={`mb-1.5 block font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Категория:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as SavedPasswordItem['category'])}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-200'
                }`}
              >
                <option value="general">Общее</option>
                <option value="wifi">WiFi</option>
                <option value="social">Соцсети</option>
                <option value="work">Работа</option>
                <option value="finance">Банки</option>
              </select>
            </div>

            <div>
              <label className={`mb-1.5 block font-bold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Заметки / Логин (опционально):</label>
              <input
                type="text"
                placeholder="логин, email или примечание..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-200'
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border ${
                isLight ? 'bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-sm shadow-md"
            >
              Сохранить
            </button>
          </div>
        </form>
      )}

      {/* Category Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm font-medium">
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 font-bold ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по Сейфу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-3.5 py-2 border rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-200'
            }`}
          />
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 ${
              isLight ? 'bg-slate-50 border-slate-200/90 hover:border-slate-300 shadow-sm' : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <span className={`font-bold text-sm sm:text-base truncate max-w-[200px] sm:max-w-none ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{item.title}</span>
                <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full border uppercase font-mono font-bold ${
                  isLight ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-400 border-slate-700/60'
                }`}>
                  {item.category}
                </span>
                <span className="text-xs text-indigo-600 font-mono font-bold">
                  {item.entropyBits} bits
                </span>
              </div>
              {item.notes && <p className={`text-xs sm:text-sm truncate mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{item.notes}</p>}
            </div>

            <div className="flex items-center space-x-2 self-stretch sm:self-auto shrink-0 justify-between sm:justify-start pt-1 sm:pt-0">
              <div className={`flex-1 sm:flex-initial min-w-0 px-2.5 py-1.5 rounded-xl border font-mono text-xs sm:text-sm font-bold truncate text-center ${
                isLight ? 'bg-white border-slate-300 text-indigo-700' : 'bg-slate-900 border-slate-800 text-cyan-400'
              }`}>
                {visibleIds[item.id] ? item.passwordValue : '••••••••••••'}
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  onClick={() => toggleVisibility(item.id)}
                  className={`p-2 rounded-xl border transition-all ${
                    isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
                  }`}
                  title={visibleIds[item.id] ? 'Скрыть' : 'Показать'}
                >
                  {visibleIds[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => copyPassword(item.id, item.passwordValue)}
                  className={`p-2 rounded-xl border transition-all ${
                    isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
                  }`}
                  title="Скопировать"
                >
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className={`p-2 rounded-xl border transition-colors ${
                    isLight ? 'bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border-slate-200' : 'bg-slate-900 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border-slate-800'
                  }`}
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className={`text-center py-12 text-sm rounded-2xl border space-y-1.5 font-medium ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950/30 border-slate-800/50 text-slate-500'
          }`}>
            <p>В Сейфе нет сохраненных записей.</p>
            <p className="text-xs text-slate-500">
              Сгенерируйте пароль и нажмите "Сохранить в Сейф".
            </p>
          </div>
        )}
      </div>

      {/* Backup / Export / Import Footer */}
      <div className={`flex items-center justify-between border-t pt-4 text-xs sm:text-sm font-medium ${
        isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
      }`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportBackup}
            disabled={vaultItems.length === 0}
            className="flex items-center space-x-1.5 hover:text-indigo-600 disabled:opacity-40 font-bold"
          >
            <Download className="w-4 h-4" />
            <span>Экспорт резервной копии (JSON)</span>
          </button>

          <label className="flex items-center space-x-1.5 hover:text-indigo-600 cursor-pointer font-bold">
            <Upload className="w-4 h-4" />
            <span>Импорт</span>
            <input type="file" accept=".json" onChange={importBackup} className="hidden" />
          </label>
        </div>

        {masterPin && (
          <button onClick={handleRemovePin} className="text-rose-600 hover:text-rose-700 font-bold">
            Сбросить ПИН
          </button>
        )}
      </div>
    </div>
  );
};
