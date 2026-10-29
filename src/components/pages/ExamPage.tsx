import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLanguage } from '../../context';
import { getWords, getNounTypes, saveExamResult } from '../../storage';
import type { Word, ExamResult } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { BookOpen, Check, X, ArrowRight, RefreshCw, Folder } from 'lucide-react';

type ExamMode = 'jp-sk' | 'jp-en' | 'sk-jp' | 'en-jp';

interface Question {
  word: Word;
  questionText: string;
  questionKanji?: string;
  correctAnswer: string;
  choices: string[];
}

interface ExamPageProps {
  initialCategory?: string;
  onResetCategory?: () => void;
}

function getQuestionText(word: Word, mode: ExamMode): string {
  switch (mode) {
    case 'jp-sk':
    case 'jp-en':
      return word.japWord;
    case 'sk-jp':
      return word.svkWord || word.engWord;
    case 'en-jp':
      return word.engWord || word.svkWord;
  }
}

function getAnswerText(word: Word, mode: ExamMode): string {
  switch (mode) {
    case 'jp-sk':
      return word.svkWord || word.engWord;
    case 'jp-en':
      return word.engWord || word.svkWord;
    case 'sk-jp':
    case 'en-jp':
      return word.japWord;
  }
}

function getModePrompt(mode: ExamMode, language: string): string {
  switch (mode) {
    case 'jp-sk':
      return language === 'sk' ? 'Preložte do slovenčiny' : 'Translate to Slovak';
    case 'jp-en':
      return language === 'sk' ? 'Preložte do angličtiny' : 'Translate to English';
    case 'sk-jp':
    case 'en-jp':
      return language === 'sk' ? 'Preložte do japončiny' : 'Translate to Japanese';
  }
}

export function ExamPage({ initialCategory, onResetCategory }: ExamPageProps) {
  const { language } = useLanguage();
  const [phase, setPhase] = useState<'menu' | 'quiz' | 'result'>('menu');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [wordTypeFilter, setWordTypeFilter] = useState<Word['wordType'] | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory || 'all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [mode, setMode] = useState<ExamMode>(language === 'sk' ? 'jp-sk' : 'jp-en');

  const words = getWords();
  const nounTypes = getNounTypes();

  useEffect(() => {
    if (initialCategory) {
      setCategoryFilter(initialCategory);
    }
  }, [initialCategory]);

  const filteredWords = useMemo(
    () =>
      words.filter((w) => {
        const matchType = wordTypeFilter === 'all' || w.wordType === wordTypeFilter;
        const matchCategory =
          categoryFilter === 'all' ||
          (categoryFilter === 'uncategorized'
            ? w.subtypeIds.length === 0
            : w.subtypeIds.includes(categoryFilter));
        return matchType && matchCategory;
      }),
    [words, wordTypeFilter, categoryFilter]
  );

  useEffect(() => {
    if (phase === 'menu') {
      setQIndex(0);
      setSelected(null);
      setScore(0);
      setAnswered(false);
      setQuestions([]);
    }
  }, [phase]);

  const startQuiz = useCallback(() => {
    if (filteredWords.length < 1) return;

    // Shuffle pool of words
    const shuffledWords = [...filteredWords].sort(() => Math.random() - 0.5);
    const count = questionCount === -1 ? shuffledWords.length : Math.min(questionCount, shuffledWords.length);
    const selectedWords = shuffledWords.slice(0, count);

    // Fall back to broader candidate pool for distractors if filtered set has few items
    const distractorPool = filteredWords.length >= 6 ? filteredWords : words;
    const allAnswers = Array.from(
      new Set(
        distractorPool
          .map((w) => getAnswerText(w, mode).trim())
          .filter((txt) => txt.length > 0)
      )
    );

    const qs: Question[] = selectedWords.map((w) => {
      const questionText = getQuestionText(w, mode);
      const correctAnswer = getAnswerText(w, mode).trim();
      const questionKanji = (mode === 'jp-sk' || mode === 'jp-en') ? w.kanji : undefined;

      // Filter other candidate answers (must be distinct and not equal to correctAnswer)
      const wrongCandidates = allAnswers.filter((ans) => ans !== correctAnswer);
      // Shuffle wrong candidates and take up to 3
      const shuffledWrong = [...wrongCandidates].sort(() => Math.random() - 0.5).slice(0, 3);

      // Combine correctAnswer with the wrong choices and shuffle
      const choices = [correctAnswer, ...shuffledWrong].sort(() => Math.random() - 0.5);

      return {
        word: w,
        questionText,
        questionKanji,
        correctAnswer,
        choices,
      };
    });

    setQuestions(qs);
    setQIndex(0);
    setSelected(null);
    setScore(0);
    setAnswered(false);
    setPhase('quiz');
  }, [filteredWords, words, questionCount, mode]);

  const current = questions[qIndex];
  const isLast = qIndex >= questions.length - 1;

  const handleSelect = useCallback(
    (choice: string) => {
      if (answered || !current) return;
      setSelected(choice);
      setAnswered(true);
      if (choice === current.correctAnswer) {
        setScore((s) => s + 1);
      }
    },
    [answered, current]
  );

  const handleNext = useCallback(() => {
    if (isLast) {
      setPhase('result');
      const result: ExamResult = {
        id: uuidv4(),
        date: new Date().toISOString().split('T')[0],
        score,
        total: questions.length,
        wordType: wordTypeFilter,
        subtypeId: null,
        language: mode,
      };
      saveExamResult(result);
      return;
    }
    setQIndex((i) => i + 1);
    setSelected(null);
    setAnswered(false);
  }, [isLast, questions.length, score, wordTypeFilter, mode]);

  const handleRestart = useCallback(() => setPhase('menu'), []);

  if (phase === 'menu') {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <BookOpen className="w-12 h-12 text-sakura-600 dark:text-sakura-400" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {language === 'sk' ? 'Test' : 'Exam'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            {language === 'sk'
              ? 'Otestujte svoje vedomosti zo slovíčok vo viacnásobnom výbere.'
              : 'Test your knowledge with a multiple-choice quiz.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'sk' ? 'Typ slova' : 'Word type'}
            </label>
            <select
              value={wordTypeFilter}
              onChange={(e) => setWordTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none"
            >
              <option value="all">{language === 'sk' ? 'Všetky typy' : 'All types'}</option>
              <option value="noun">{language === 'sk' ? 'Podstatné mená' : 'Nouns'}</option>
              <option value="adjective">{language === 'sk' ? 'Prídavné mená' : 'Adjectives'}</option>
              <option value="verb">{language === 'sk' ? 'Slovesá' : 'Verbs'}</option>
              <option value="sentence">{language === 'sk' ? 'Vety' : 'Sentences'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'sk' ? 'Kategória / Podtyp' : 'Category / Subtype'}
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none"
            >
              <option value="all">{language === 'sk' ? 'Všetky kategórie' : 'All categories'}</option>
              {nounTypes.map((nt) => (
                <option key={nt.id} value={nt.id}>
                  {language === 'sk' ? nt.name_sk : nt.name_en}
                </option>
              ))}
              <option value="uncategorized">{language === 'sk' ? 'Bez kategórie' : 'Uncategorized'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'sk' ? 'Režim testovania' : 'Quiz direction'}
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ExamMode)}
              className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none"
            >
              <option value="jp-sk">
                {language === 'sk' ? 'Japončina → Slovenčina (JP → SK)' : 'Japanese → Slovak (JP → SK)'}
              </option>
              <option value="jp-en">
                {language === 'sk' ? 'Japončina → Angličtina (JP → EN)' : 'Japanese → English (JP → EN)'}
              </option>
              <option value="sk-jp">
                {language === 'sk' ? 'Slovenčina → Japončina (SK → JP)' : 'Slovak → Japanese (SK → JP)'}
              </option>
              <option value="en-jp">
                {language === 'sk' ? 'Angličtina → Japončina (EN → JP)' : 'English → Japanese (EN → JP)'}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {language === 'sk' ? 'Počet otázok' : 'Question count'}
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="-1">{language === 'sk' ? 'Všetky v kategórii' : 'All in category'}</option>
            </select>
          </div>
        </div>

        {categoryFilter !== 'all' && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-sakura-50 dark:bg-sakura-950/40 border border-sakura-200 dark:border-sakura-800 text-sm">
            <div className="flex items-center gap-2 text-sakura-800 dark:text-sakura-200">
              <Folder className="w-4 h-4" />
              <span>
                {language === 'sk' ? 'Vybraná kategória:' : 'Selected category:'}{' '}
                <strong>
                  {categoryFilter === 'uncategorized'
                    ? (language === 'sk' ? 'Bez kategórie' : 'Uncategorized')
                    : nounTypes.find((n) => n.id === categoryFilter)?.[language === 'sk' ? 'name_sk' : 'name_en'] || categoryFilter}
                </strong>
              </span>
            </div>
            <button
              onClick={() => {
                setCategoryFilter('all');
                onResetCategory?.();
              }}
              className="text-xs text-sakura-700 dark:text-sakura-300 hover:underline"
            >
              {language === 'sk' ? 'Zrušiť filter' : 'Clear filter'}
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">{filteredWords.length}</span>
          <span>{language === 'sk' ? 'slovíčok zodpovedá filtrom' : 'words match filters'}</span>
        </div>

        <button
          onClick={startQuiz}
          disabled={filteredWords.length === 0}
          className="w-full md:w-auto px-6 py-3 text-sm font-medium text-white bg-sakura-600 hover:bg-sakura-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl focus:outline-none focus:ring-2 focus:ring-sakura-500 focus:ring-offset-2 transition-colors font-semibold"
        >
          {language === 'sk' ? 'ZAČAŤ TEST' : 'START QUIZ'}
        </button>
      </div>
    );
  }

  if (phase === 'result') {
    const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-6xl">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📚'}</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {language === 'sk' ? 'Výsledok testu' : 'Quiz Result'}
          </h2>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            {score} / {questions.length}
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">{pct}%</p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-4">
          <button
            onClick={startQuiz}
            className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-sm font-medium text-white bg-sakura-600 hover:bg-sakura-700 focus:outline-none focus:ring-2 focus:ring-sakura-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-1" /> {language === 'sk' ? 'Znova' : 'Retry'}
          </button>
          <button
            onClick={handleRestart}
            className="px-5 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
          >
            {language === 'sk' ? 'Návrat do menu' : 'Back to Menu'}
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {language === 'sk' ? 'Otázka' : 'Question'} <span className="font-semibold text-gray-900 dark:text-white">{qIndex + 1}</span> /
          <span className="font-semibold text-gray-900 dark:text-white"> {questions.length}</span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
          {language === 'sk' ? 'Skóre' : 'Score'}: <span className="font-bold text-sakura-600 dark:text-sakura-400">{score}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 min-h-[220px] flex flex-col justify-center">
        <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-1">
          {current.questionText}
        </div>
        {current.questionKanji && (
          <div className="text-base font-mono text-gray-500 dark:text-gray-400 text-center mb-2">
            {current.questionKanji}
          </div>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-6 uppercase tracking-wider font-semibold">
          {getModePrompt(mode, language)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {current.choices.map((choice) => {
            const isCorrect = choice === current.correctAnswer;
            const isChosen = choice === selected;

            let btnStyle = 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/80';
            if (answered) {
              if (isCorrect) {
                btnStyle = 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold shadow-sm';
              } else if (isChosen) {
                btnStyle = 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-semibold shadow-sm';
              } else {
                btnStyle = 'border-gray-200 dark:border-gray-700 opacity-50 text-gray-400 dark:text-gray-500';
              }
            }

            return (
              <button
                key={choice}
                onClick={() => handleSelect(choice)}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-left text-sm font-medium transition-all border-2 ${btnStyle}`}
                disabled={answered}
              >
                <span>{choice}</span>
                {answered && isCorrect && <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 ml-2" />}
                {answered && isChosen && !isCorrect && <X className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {answered && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleNext}
            className="flex items-center px-6 py-3 rounded-xl text-sm font-medium text-white bg-sakura-600 hover:bg-sakura-700 focus:outline-none focus:ring-2 focus:ring-sakura-500 transition-colors shadow-sm"
          >
            {isLast ? (
              <span>{language === 'sk' ? 'Ukončiť test' : 'Finish Quiz'}</span>
            ) : (
              <>
                <span>{language === 'sk' ? 'Ďalšia otázka' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}


