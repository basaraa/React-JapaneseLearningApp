import { useState, useCallback, useMemo } from 'react';
import { useLanguage } from '../../context';
import { getWords, updateWordProgress } from '../../storage';
import type { Word } from '../../types';
import { FlipCard } from '../ui/FlipCard';
import { ArrowRight, ArrowLeft, Clock } from 'lucide-react';

export function StudyModePage() {
  const { language } = useLanguage();
  const [words, setWords] = useState<Word[]>(getWords());
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const studyWords = useMemo(() => {
    return words.filter(
      (w) =>
        !w.nextReview ||
        w.nextReview <= today ||
        w.timesWrong > 0 ||
        w.timesCorrect === 0
    );
  }, [words, today]);

  const learned = words.filter((w) => w.timesCorrect > 0 && w.timesWrong === 0).length;

  const current = studyWords[index];
  const total = studyWords.length;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-gray-500 dark:text-gray-400">
        <Clock className="w-12 h-12 mb-3 opacity-50" />
        <p>{language === 'sk' ? 'Žiadne slová na opakovanie.' : 'No words due for review.'}</p>
        <button
          onClick={() => setWords(getWords())}
          className="mt-4 text-sm underline decoration-sakura-600 dark:decoration-sakura-400 hover:text-sakura-600 dark:hover:text-sakura-400"
        >
          {language === 'sk' ? 'Obnoviť zoznam' : 'Refresh list'}
        </button>
      </div>
    );
  }

  const handleNext = useCallback(() => {
    setFlipped(false);
    setIndex((i) => (i + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setFlipped(false);
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const handleFlip = () => setFlipped((f) => !f);

  const handleCorrect = useCallback(() => {
    if (!current) return;
    updateWordProgress(current.id, true);
    setIndex((i) => (i + 1) % total);
    setFlipped(false);
  }, [current]);

  const handleWrong = useCallback(() => {
    if (!current) return;
    updateWordProgress(current.id, false);
    setIndex((i) => (i + 1) % total);
    setFlipped(false);
  }, [current]);

  const handleRefresh = useCallback(() => {
    setWords(getWords());
    setIndex(0);
    setFlipped(false);
  }, []);
  const typeLabel = (t?: Word['wordType']) => {
    if (!t) return '';
    const labels: Record<Word['wordType'], string> =
      language === 'sk'
        ? { noun: 'Podstatné meno', adjective: 'Prídavné meno', verb: 'Sloveso', sentence: 'Veta' }
        : { noun: 'Noun', adjective: 'Adjective', verb: 'Verb', sentence: 'Sentence' };
    return labels[t] || t;
  };
  const translation = (language === 'sk' ? current?.svkWord : current?.engWord) || current?.svkWord || current?.engWord || '';

  const front = (
    <div className="flex flex-col items-center justify-center">
      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{current?.japWord}</div>
      {current?.kanji && (
        <div className="text-sm font-mono text-gray-500 dark:text-gray-400">{current.kanji}</div>
      )}
    </div>
  );

  const back = (
    <div className="space-y-2 flex flex-col items-center justify-center">
      <div className="text-2xl font-bold text-white">{translation}</div>
      <div className="text-xs uppercase tracking-wide text-sakura-400 font-semibold">{typeLabel(current?.wordType)}</div>
      {current?.nextReview && (
        <div className="text-xs text-gray-400 mt-1">
          {language === 'sk' ? `Ďalšie opakovanie: ${current.nextReview}` : `Next review: ${current.nextReview}`}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {language === 'sk' ? 'Inteligentné štúdium' : 'Smart Study'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'sk' ? 'Slová na opakovanie podľa spaced repetition.' : 'Words due for review via spaced repetition.'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-sakura-600 dark:text-sakura-400">{total}</span>
          <span>{language === 'sk' ? 'na opakovanie' : 'due'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">{language === 'sk' ? 'Naučené' : 'Learned'}</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{learned}</div>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">{language === 'sk' ? 'Celkom' : 'Total'}</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{words.length}</div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[340px]">
        <div className="relative w-full max-w-sm">
          <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 md:hidden">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <FlipCard front={front} back={back} flipped={flipped} onFlip={handleFlip} className="mx-auto max-w-xs" />
          <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 md:hidden">
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleWrong}
          className="px-5 py-3 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
        >
          <span className="text-red-400 mr-1">✗</span> {language === 'sk' ? 'Nesprávne' : 'Wrong'}
        </button>
        <button
          onClick={handleCorrect}
          className="px-5 py-3 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
        >
          <span className="text-green-400 mr-1">✓</span> {language === 'sk' ? 'Správne' : 'Correct'}
        </button>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleRefresh}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <span className="text-gray-400 mr-1">↻</span> {language === 'sk' ? 'Obnoviť' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}

