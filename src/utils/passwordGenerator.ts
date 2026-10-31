import {
  RandomOptions,
  PassphraseOptions,
  PronounceableOptions,
  PinOptions,
  PatternOptions,
  PasswordAnalysis
} from '../types';
import { ENGLISH_WORDS, RUSSIAN_WORDS, NATO_PHONETIC } from './wordlist';

const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR_CHARS = /[il1Lo0OI]/g;
const AMBIGUOUS_CHARS = /[{}[\]()/\b\\'"~,;:.<>]/g;

/**
 * Returns a cryptographically secure random integer between 0 and max (exclusive)
 */
export function getSecureRandomInt(max: number): number {
  if (max <= 0) return 0;
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}

/**
 * Shuffle array in-place using Fisher-Yates and cryptographically secure random numbers
 */
function secureShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateRandomPassword(options: RandomOptions): string {
  let lower = LOWERCASE_CHARS;
  let upper = UPPERCASE_CHARS;
  let numbers = NUMBER_CHARS;
  let symbols = SYMBOL_CHARS;

  if (options.excludeSimilar) {
    lower = lower.replace(SIMILAR_CHARS, '');
    upper = upper.replace(SIMILAR_CHARS, '');
    numbers = numbers.replace(SIMILAR_CHARS, '');
  }

  if (options.excludeAmbiguous) {
    symbols = symbols.replace(AMBIGUOUS_CHARS, '');
  }

  if (options.customExclude) {
    const customReg = new RegExp(`[${options.customExclude.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`, 'g');
    lower = lower.replace(customReg, '');
    upper = upper.replace(customReg, '');
    numbers = numbers.replace(customReg, '');
    symbols = symbols.replace(customReg, '');
  }

  let pool = '';
  const requiredChars: string[] = [];

  if (options.includeLowercase && lower.length > 0) {
    pool += lower;
    requiredChars.push(lower[getSecureRandomInt(lower.length)]);
  }
  if (options.includeUppercase && upper.length > 0) {
    pool += upper;
    requiredChars.push(upper[getSecureRandomInt(upper.length)]);
  }
  if (options.includeNumbers && numbers.length > 0) {
    pool += numbers;
    for (let i = 0; i < Math.max(1, options.minNumbers); i++) {
      requiredChars.push(numbers[getSecureRandomInt(numbers.length)]);
    }
  }
  if (options.includeSymbols && symbols.length > 0) {
    pool += symbols;
    for (let i = 0; i < Math.max(1, options.minSymbols); i++) {
      requiredChars.push(symbols[getSecureRandomInt(symbols.length)]);
    }
  }

  // Fallback if no sets selected
  if (!pool) {
    pool = LOWERCASE_CHARS + NUMBER_CHARS;
    requiredChars.push(lower[getSecureRandomInt(lower.length)]);
  }

  const targetLength = Math.max(options.length, requiredChars.length);
  const resultChars: string[] = [...requiredChars];

  while (resultChars.length < targetLength) {
    const randomIndex = getSecureRandomInt(pool.length);
    resultChars.push(pool[randomIndex]);
  }

  return secureShuffle(resultChars).join('');
}

export function generatePassphrase(options: PassphraseOptions): string {
  let wordPool: string[] = [];

  if (options.language === 'ru') {
    wordPool = [...RUSSIAN_WORDS];
  } else if (options.language === 'en') {
    wordPool = [...ENGLISH_WORDS];
  } else {
    wordPool = [...RUSSIAN_WORDS, ...ENGLISH_WORDS];
  }

  const selectedWords: string[] = [];
  for (let i = 0; i < options.wordCount; i++) {
    const randomWord = wordPool[getSecureRandomInt(wordPool.length)];
    selectedWords.push(randomWord);
  }

  // Format capitalization
  const formattedWords = selectedWords.map((word) => {
    if (options.capitalize === 'title') {
      return word.charAt(0).toUpperCase() + word.slice(1);
    } else if (options.capitalize === 'upper') {
      return word.toUpperCase();
    } else if (options.capitalize === 'random') {
      return getSecureRandomInt(2) === 1 ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    }
    return word.toLowerCase();
  });

  let result = formattedWords.join(options.separator);

  if (options.includeNumber) {
    const num = getSecureRandomInt(99) + 1; // 1 to 99
    result += options.separator + num;
  }

  if (options.includeSymbol) {
    const syms = '!@#$%^&*';
    result += syms[getSecureRandomInt(syms.length)];
  }

  return result;
}

export function generatePronounceablePassword(options: PronounceableOptions): string {
  const vowels = 'aeiou';
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  let result = '';

  for (let i = 0; i < options.length; i++) {
    if (i % 2 === 0) {
      result += consonants[getSecureRandomInt(consonants.length)];
    } else {
      result += vowels[getSecureRandomInt(vowels.length)];
    }
  }

  if (options.capitalizeFirst && result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  if (options.addNumberSuffix) {
    result += (getSecureRandomInt(90) + 10).toString(); // 10-99
  }

  return result;
}

export function generatePin(options: PinOptions): string {
  if (!options.allowRepeats && options.length > 10) {
    options.length = 10;
  }

  if (!options.allowRepeats) {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const shuffled = secureShuffle(digits);
    return shuffled.slice(0, options.length).join('');
  }

  let pin = '';
  for (let i = 0; i < options.length; i++) {
    pin += NUMBER_CHARS[getSecureRandomInt(NUMBER_CHARS.length)];
  }
  return pin;
}

export function generatePatternPassword(options: PatternOptions): string {
  // L = Upper letter, l = lower letter, N = Number, S = Symbol, A = Any
  let result = '';
  for (const ch of options.pattern) {
    if (ch === 'L') {
      result += UPPERCASE_CHARS[getSecureRandomInt(UPPERCASE_CHARS.length)];
    } else if (ch === 'l') {
      result += LOWERCASE_CHARS[getSecureRandomInt(LOWERCASE_CHARS.length)];
    } else if (ch === 'N') {
      result += NUMBER_CHARS[getSecureRandomInt(NUMBER_CHARS.length)];
    } else if (ch === 'S') {
      result += SYMBOL_CHARS[getSecureRandomInt(SYMBOL_CHARS.length)];
    } else if (ch === 'A') {
      const allPool = LOWERCASE_CHARS + UPPERCASE_CHARS + NUMBER_CHARS + SYMBOL_CHARS;
      result += allPool[getSecureRandomInt(allPool.length)];
    } else {
      result += ch; // keep separators like '-' or '_'
    }
  }
  return result;
}

/**
 * Calculate Entropy in Bits
 * Entropy = Length * log2(Pool Size)
 */
export function calculateEntropy(password: string): number {
  if (!password) return 0;

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  if (poolSize === 0) poolSize = 1;

  const entropy = password.length * Math.log2(poolSize);
  return Math.round(entropy * 10) / 10;
}

/**
 * Convert seconds into human-readable Russian time description
 */
export function formatCrackTime(seconds: number): string {
  if (seconds < 1) return 'Мгновенно (< 1 сек)';
  if (seconds < 60) return `${Math.round(seconds)} сек.`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} мин.`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} ч.`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} дн.`;
  if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} лет`;
  if (seconds < 31536000 * 1e6) return `${(seconds / 31536000 / 1e3).toFixed(0)} тыс. лет`;
  if (seconds < 31536000 * 1e9) return `${(seconds / 31536000 / 1e6).toFixed(0)} млн лет`;
  return 'Более 1 млрд лет';
}

/**
 * Full Analysis of Password Strength
 */
export function analyzePasswordStrength(password: string): PasswordAnalysis {
  const length = password.length;
  const entropy = calculateEntropy(password);

  // Character stats
  const uppercaseCount = (password.match(/[A-ZА-Я]/g) || []).length;
  const lowercaseCount = (password.match(/[a-zа-я]/g) || []).length;
  const digitsCount = (password.match(/[0-9]/g) || []).length;
  const symbolsCount = (password.match(/[^a-zA-Zа-яА-Я0-9]/g) || []).length;

  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check weak patterns
  if (length < 8) {
    warnings.push('Пароль слишком короткий (менее 8 символов)');
    suggestions.push('Увеличьте длину пароля минимум до 12-16 символов');
  }

  if (/^(1234|qwerty|password|admin|master|1111|0000)/i.test(password)) {
    warnings.push('Содержит очевидный комбинаторный шаблон');
  }

  if (/(.)\1{2,}/.test(password)) {
    warnings.push('Содержит повторяющиеся символы подряд (например, "aaa")');
  }

  if (digitsCount === length) {
    warnings.push('Пароль состоит только из цифр');
    suggestions.push('Добавьте буквы и специальные символы');
  } else if (lowercaseCount === length) {
    warnings.push('Используются только строчные буквы');
    suggestions.push('Добавьте заглавные буквы и цифры');
  }

  // Calculate score (0 to 100)
  let score = 0;
  if (entropy > 0) {
    score = Math.min(100, Math.round((entropy / 100) * 100));
  }
  if (warnings.length > 0) {
    score = Math.max(5, score - warnings.length * 15);
  }

  let statusLevel: PasswordAnalysis['statusLevel'] = 'very-weak';
  let statusText = 'Очень слабый';
  let colorClass = 'text-red-500 bg-red-500/10 border-red-500/30';

  if (score >= 85 || entropy >= 90) {
    statusLevel = 'ultra';
    statusText = 'Максимальная защита (Неуязвимый)';
    colorClass = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
  } else if (score >= 65 || entropy >= 60) {
    statusLevel = 'strong';
    statusText = 'Очень надежный';
    colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (score >= 45 || entropy >= 40) {
    statusLevel = 'good';
    statusText = 'Хороший';
    colorClass = 'text-green-400 bg-green-500/10 border-green-500/30';
  } else if (score >= 25 || entropy >= 25) {
    statusLevel = 'fair';
    statusText = 'Средний';
    colorClass = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  } else if (score >= 10) {
    statusLevel = 'weak';
    statusText = 'Слабый';
    colorClass = 'text-orange-400 bg-orange-500/10 border-orange-500/30';
  }

  // Estimate Crack Speeds:
  // Offline GPU Cluster: ~100 billion guesses/sec (10^11)
  // Online API Throttle: ~100 guesses/sec
  const poolSize = Math.pow(2, entropy / Math.max(1, length));
  const totalPossibilities = Math.pow(poolSize, length);

  const secondsOffline = totalPossibilities / (1e11 * 0.5); // Average half search space
  const secondsOnline = totalPossibilities / (100 * 0.5);

  return {
    password,
    length,
    entropyBits: entropy,
    score,
    statusLevel,
    statusText,
    colorClass,
    crackTimeOfflineGpu: formatCrackTime(secondsOffline),
    crackTimeOnline: formatCrackTime(secondsOnline),
    characterStats: {
      uppercase: uppercaseCount,
      lowercase: lowercaseCount,
      digits: digitsCount,
      symbols: symbolsCount,
    },
    warnings,
    suggestions,
  };
}

/**
 * Phonetic reading for dictating over audio/phone
 */
export function getPhoneticSpelling(password: string): Array<{ char: string; phoneticEn: string; phoneticRu: string }> {
  return password.split('').map((char) => {
    const lower = char.toLowerCase();
    const entry = NATO_PHONETIC[lower];
    return {
      char,
      phoneticEn: entry ? entry.en : char,
      phoneticRu: entry ? entry.ru : char,
    };
  });
}

/**
 * Generate Hash of string (SHA-256)
 */
export async function generateHash(text: string, algorithm: 'SHA-256' | 'SHA-512' | 'SHA-1'): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
