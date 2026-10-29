import { v4 as uuidv4 } from 'uuid';
import type {
  Word, Grammar, GrammarSentence, Kanji, KanaRow,
  NounType, VerbFormType, VerbFormSuffix,
  ExamResult, StudySession, Language
} from './types';
import {
  SEED_WORDS, SEED_GRAMMAR, SEED_GRAMMAR_SENTENCES,
  SEED_KANJI, SEED_KANA, SEED_NOUN_TYPES,
  SEED_VERB_FORM_TYPES, SEED_VERB_FORM_SUFFIXES
} from '../data/seed';

const KEYS = {
  words: 'jla-words',
  grammar: 'jla-grammar',
  grammarSentences: 'jla-grammar-sentences',
  kanji: 'jla-kanji',
  kana: 'jla-kana',
  nounTypes: 'jla-noun-types',
  verbFormTypes: 'jla-verb-form-types',
  verbFormSuffixes: 'jla-verb-form-suffixes',
  examHistory: 'jla-exam-history',
  studySessions: 'jla-study-sessions',
  language: 'jla-language',
  theme: 'jla-theme',
} as const;

const DATA_VERSION = 2;
const DATA_VERSION_KEY = 'jla-data-version';

// ─── Generic helpers ──────────────────────────────────────────────────────────

function load<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
    const data = [...seed];
    save(key, data);
    return data;
  } catch {
    return [...seed];
  }
}

function save<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('localStorage save error:', key, e);
  }
}

function checkVersionAndUpgrade() {
  try {
    const currentVer = localStorage.getItem(DATA_VERSION_KEY);
    if (!currentVer || parseInt(currentVer, 10) < DATA_VERSION) {
      const oldRaw = localStorage.getItem(KEYS.words);
      if (oldRaw) {
        try {
          const oldWords = JSON.parse(oldRaw) as Word[];
          const oldStatsMap = new Map(oldWords.map(w => [w.id, {
            timesCorrect: w.timesCorrect,
            timesWrong: w.timesWrong,
            nextReview: w.nextReview,
            lastReviewed: w.lastReviewed
          }]));
          const updatedSeed = SEED_WORDS.map(sw => {
            const stats = oldStatsMap.get(sw.id);
            if (stats) {
              return {
                ...sw,
                timesCorrect: stats.timesCorrect ?? sw.timesCorrect,
                timesWrong: stats.timesWrong ?? sw.timesWrong,
                nextReview: stats.nextReview ?? sw.nextReview,
                lastReviewed: stats.lastReviewed ?? sw.lastReviewed,
              };
            }
            return sw;
          });
          save(KEYS.words, updatedSeed);
        } catch {
          save(KEYS.words, SEED_WORDS);
        }
      } else {
        save(KEYS.words, SEED_WORDS);
      }
      localStorage.setItem(DATA_VERSION_KEY, String(DATA_VERSION));
    }
  } catch (e) {
    console.error('Migration error:', e);
  }
}

checkVersionAndUpgrade();

export const resetAllDataToSeed = (): void => {
  save(KEYS.words, SEED_WORDS);
  save(KEYS.grammar, SEED_GRAMMAR);
  save(KEYS.grammarSentences, SEED_GRAMMAR_SENTENCES);
  save(KEYS.kanji, SEED_KANJI);
  save(KEYS.kana, SEED_KANA);
  save(KEYS.nounTypes, SEED_NOUN_TYPES);
  save(KEYS.verbFormTypes, SEED_VERB_FORM_TYPES);
  save(KEYS.verbFormSuffixes, SEED_VERB_FORM_SUFFIXES);
  localStorage.setItem(DATA_VERSION_KEY, String(DATA_VERSION));
};

// ─── Words ────────────────────────────────────────────────────────────────────

export const getWords = (): Word[] => load<Word>(KEYS.words, SEED_WORDS);

export const saveWords = (words: Word[]): void => save(KEYS.words, words);

export const saveWord = (word: Word): void => {
  const words = getWords();
  const idx = words.findIndex(w => w.id === word.id);
  if (idx >= 0) words[idx] = word;
  else words.push(word);
  saveWords(words);
};

export const deleteWord = (id: string): void => {
  saveWords(getWords().filter(w => w.id !== id));
};

export const createWord = (): Word => ({
  id: uuidv4(),
  japWord: '',
  svkWord: '',
  engWord: '',
  wordType: 'noun',
  subtypeIds: [],
  dayOfAddition: new Date().toISOString().split('T')[0],
  timesCorrect: 0,
  timesWrong: 0,
});

export const updateWordProgress = (id: string, correct: boolean): void => {
  const words = getWords();
  const word = words.find(w => w.id === id);
  if (!word) return;
  if (correct) word.timesCorrect++;
  else word.timesWrong++;

  // Simple spaced repetition: next review in (timesCorrect+1) days if correct
  const daysFromNow = correct ? Math.min(word.timesCorrect + 1, 30) : 1;
  const next = new Date();
  next.setDate(next.getDate() + daysFromNow);
  word.nextReview = next.toISOString().split('T')[0];

  saveWords(words);
};

// ─── Grammar ──────────────────────────────────────────────────────────────────

export const getGrammar = (): Grammar[] => load<Grammar>(KEYS.grammar, SEED_GRAMMAR);

export const saveGrammar = (g: Grammar): void => {
  const list = getGrammar();
  const idx = list.findIndex(x => x.id === g.id);
  if (idx >= 0) list[idx] = g;
  else list.push(g);
  save(KEYS.grammar, list);
};

export const deleteGrammar = (id: string): void => {
  save(KEYS.grammar, getGrammar().filter(g => g.id !== id));
  // Also delete sentences
  save(KEYS.grammarSentences, getGrammarSentences().filter(s => s.grammarId !== id));
};

export const createGrammar = (): Grammar => ({
  id: uuidv4(),
  title_sk: '',
  title_en: '',
  description_sk: '',
  description_en: '',
});

// ─── Grammar Sentences ────────────────────────────────────────────────────────

export const getGrammarSentences = (): GrammarSentence[] =>
  load<GrammarSentence>(KEYS.grammarSentences, SEED_GRAMMAR_SENTENCES);

export const saveGrammarSentence = (s: GrammarSentence): void => {
  const list = getGrammarSentences();
  const idx = list.findIndex(x => x.id === s.id);
  if (idx >= 0) list[idx] = s;
  else list.push(s);
  save(KEYS.grammarSentences, list);
};

export const deleteGrammarSentence = (id: string): void => {
  save(KEYS.grammarSentences, getGrammarSentences().filter(s => s.id !== id));
};

export const createGrammarSentence = (grammarId: string): GrammarSentence => ({
  id: uuidv4(),
  grammarId,
  japSentence: '',
  svkSentence: '',
  engSentence: '',
});

// ─── Kanji ────────────────────────────────────────────────────────────────────

export const getKanji = (): Kanji[] => load<Kanji>(KEYS.kanji, SEED_KANJI);

export const saveKanji = (k: Kanji): void => {
  const list = getKanji();
  const idx = list.findIndex(x => x.id === k.id);
  if (idx >= 0) list[idx] = k;
  else list.push(k);
  save(KEYS.kanji, list);
};

export const deleteKanji = (id: string): void => {
  save(KEYS.kanji, getKanji().filter(k => k.id !== id));
};

export const createKanji = (): Kanji => ({
  id: uuidv4(),
  kanjiChar: '',
  kunyomi: '',
  onyomi: '',
  meaning_sk: '',
  meaning_en: '',
});

// ─── Kana (read-only seed) ────────────────────────────────────────────────────

export const getKana = (): KanaRow[] => load<KanaRow>(KEYS.kana, SEED_KANA);

// ─── Noun Types ───────────────────────────────────────────────────────────────

export const getNounTypes = (): NounType[] => load<NounType>(KEYS.nounTypes, SEED_NOUN_TYPES);

// ─── Verb Form Types ──────────────────────────────────────────────────────────

export const getVerbFormTypes = (): VerbFormType[] =>
  load<VerbFormType>(KEYS.verbFormTypes, SEED_VERB_FORM_TYPES);

export const getVerbFormSuffixes = (): VerbFormSuffix[] =>
  load<VerbFormSuffix>(KEYS.verbFormSuffixes, SEED_VERB_FORM_SUFFIXES);

// ─── Exam History ────────────────────────────────────────────────────────────

export const getExamHistory = (): ExamResult[] =>
  load<ExamResult>(KEYS.examHistory, []);

export const saveExamResult = (result: ExamResult): void => {
  const history = getExamHistory();
  history.unshift(result);
  save(KEYS.examHistory, history.slice(0, 100)); // keep last 100
};

// ─── Study Sessions ──────────────────────────────────────────────────────────

export const getStudySessions = (): StudySession[] =>
  load<StudySession>(KEYS.studySessions, []);

export const saveStudySession = (session: StudySession): void => {
  const sessions = getStudySessions();
  sessions.unshift(session);
  save(KEYS.studySessions, sessions.slice(0, 200));
};

// ─── Preferences ─────────────────────────────────────────────────────────────

export const getStoredLanguage = (): Language => {
  const val = localStorage.getItem(KEYS.language);
  return (val === 'en' || val === 'sk') ? val : 'sk';
};

export const setStoredLanguage = (lang: Language): void => {
  localStorage.setItem(KEYS.language, lang);
};

export const getStoredTheme = (): 'dark' | 'light' => {
  const val = localStorage.getItem(KEYS.theme);
  if (val === 'dark' || val === 'light') return val;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const setStoredTheme = (theme: 'dark' | 'light'): void => {
  localStorage.setItem(KEYS.theme, theme);
};

// ─── CSV Import ───────────────────────────────────────────────────────────────

export function parseCSVWords(csv: string): Word[] {
  const lines = csv.trim().split('\n');
  const words: Word[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split(',');
    const [jap, svk, eng, type, subtypes, kanji] = cols;
    if (!jap || !svk) continue;
    const wordType = (['noun','adjective','verb','sentence'].includes(type?.trim()))
      ? type.trim() as Word['wordType']
      : 'noun';
    const subtypeIds = subtypes?.trim()
      ? subtypes.trim().split(';').filter(Boolean)
      : [];
    words.push({
      id: uuidv4(),
      japWord: jap.trim(),
      svkWord: svk.trim(),
      engWord: eng?.trim() || '',
      wordType,
      subtypeIds,
      kanji: kanji?.trim() || undefined,
      dayOfAddition: new Date().toISOString().split('T')[0],
      timesCorrect: 0,
      timesWrong: 0,
    });
  }
  return words;
}

export function parseCSVGrammar(csv: string): Grammar[] {
  const lines = csv.trim().split('\n');
  const list: Grammar[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const [titleSK, descSK, titleEN, descEN] = line.split(',');
    if (!titleSK) continue;
    list.push({
      id: uuidv4(),
      title_sk: titleSK.trim(),
      title_en: titleEN?.trim() || '',
      description_sk: descSK?.trim() || '',
      description_en: descEN?.trim() || '',
    });
  }
  return list;
}

export function parseCSVGrammarSentences(csv: string): GrammarSentence[] {
  const lines = csv.trim().split('\n');
  const list: GrammarSentence[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const [grammarId, jap, svk, eng] = line.split(',');
    if (!grammarId || !jap) continue;
    list.push({
      id: uuidv4(),
      grammarId: grammarId.trim(),
      japSentence: jap.trim(),
      svkSentence: svk?.trim() || '',
      engSentence: eng?.trim() || '',
    });
  }
  return list;
}

export function parseCSVKanji(csv: string): Kanji[] {
  const lines = csv.trim().split('\n');
  const list: Kanji[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const [char, kunyomi, onyomi, meaningSK, meaningEN] = line.split(',');
    if (!char) continue;
    list.push({
      id: uuidv4(),
      kanjiChar: char.trim(),
      kunyomi: kunyomi?.trim() || '',
      onyomi: onyomi?.trim() || '',
      meaning_sk: meaningSK?.trim() || '',
      meaning_en: meaningEN?.trim() || '',
    });
  }
  return list;
}
