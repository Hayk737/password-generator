export type GeneratorMode = 'random' | 'passphrase' | 'pronounceable' | 'pin' | 'pattern';

export type LanguageMode = 'ru' | 'en' | 'mixed';

export interface RandomOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean; // e.g. i, l, 1, L, o, 0, O
  excludeAmbiguous: boolean; // e.g. {} [] () / \ ' " ` ~ , ; . < >
  customExclude: string;
  minNumbers: number;
  minSymbols: number;
}

export interface PassphraseOptions {
  wordCount: number;
  separator: string; // '-', '_', '.', ' ', '#', etc.
  capitalize: 'none' | 'title' | 'upper' | 'random';
  includeNumber: boolean;
  includeSymbol: boolean;
  language: LanguageMode;
}

export interface PronounceableOptions {
  length: number;
  capitalizeFirst: boolean;
  addNumberSuffix: boolean;
}

export interface PinOptions {
  length: number;
  allowRepeats: boolean;
}

export interface PatternOptions {
  pattern: string; // e.g. "LLL-NNN-SSS" (L=Letter, N=Number, S=Symbol, U=Upper, l=lower)
}

export interface PasswordAnalysis {
  password: string;
  length: number;
  entropyBits: number;
  score: number; // 0 to 100
  statusLevel: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'ultra';
  statusText: string;
  colorClass: string;
  crackTimeOfflineGpu: string; // e.g. "3.5 секунды", "1,200 лет"
  crackTimeOnline: string;     // e.g. "45 минут"
  characterStats: {
    uppercase: number;
    lowercase: number;
    digits: number;
    symbols: number;
  };
  warnings: string[];
  suggestions: string[];
}

export interface SavedPasswordItem {
  id: string;
  title: string;
  passwordValue: string;
  category: 'general' | 'wifi' | 'social' | 'work' | 'finance';
  notes?: string;
  createdAt: number;
  entropyBits: number;
}

export type AppTheme = 'dark' | 'cyberpunk' | 'light' | 'midnight';
