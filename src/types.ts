// ============================================================
// Core domain types for the Japanese Learning App
// ============================================================

export type Language = 'sk' | 'en';

// ------- Words / Vocabulary -------

export type WordType = 'noun' | 'adjective' | 'verb' | 'sentence';

export interface NounType {
  id: string;
  name_sk: string;
  name_en: string;
  imageName: string;
}

export interface Word {
  id: string;
  japWord: string;
  svkWord: string;   // Slovak translation
  engWord: string;   // English translation
  wordType: WordType;
  subtypeIds: string[];   // NounType ids
  kanji?: string;
  dayOfAddition: string;  // ISO date string e.g. "2023-05-10"
  // Spaced repetition
  timesCorrect: number;
  timesWrong: number;
  nextReview?: string; // ISO date string
}

// ------- Grammar -------

export interface GrammarSentence {
  id: string;
  grammarId: string;
  japSentence: string;
  svkSentence: string;
  engSentence: string;
}

export interface Grammar {
  id: string;
  title_sk: string;
  title_en: string;
  description_sk: string;
  description_en: string;
}

// ------- Alphabet: Kana -------

export interface KanaRow {
  id: string;
  hiragana: string;
  katakana: string;
  romaji: string;
}

// ------- Kanji -------

export interface Kanji {
  id: string;
  kanjiChar: string;
  kunyomi: string;
  onyomi: string;
  meaning_sk: string;
  meaning_en: string;
}

// ------- Verb Forms -------

export interface VerbFormType {
  id: string;
  name_sk: string;
  name_en: string;
}

export interface VerbFormSuffix {
  id: string;
  formTypeId: string;
  origin: string;  // e.g. "ru", "u", "ku", "suru", "kuru"
  formalSuffix: string | null;
  informalSuffix: string | null;
}

// ------- Exam -------

export interface ExamQuestion {
  wordId: string;
  question: string;
  correctAnswer: string;
  choices: string[];
}

export interface ExamResult {
  id: string;
  date: string;
  score: number;
  total: number;
  wordType: WordType | 'all';
  subtypeId: string | null;
  language: string;
}

// ------- Progress / Spaced Repetition -------

export type StudyMode = 'flashcard' | 'typeIn' | 'multipleChoice';

export interface StudySession {
  id: string;
  date: string;
  wordsStudied: number;
  correctAnswers: number;
  mode: StudyMode;
}

// ------- App State Views -------

export type AppView =
  | 'home'
  | 'vocabulary'
  | 'flashcards'
  | 'grammar'
  | 'grammar-detail'
  | 'alphabet'
  | 'kanji'
  | 'exam'
  | 'verb-forms'
  | 'verb-form-table'
  | 'study'
  | 'progress'
  | 'add-word'
  | 'add-grammar'
  | 'add-sentence'
  | 'add-kanji';
