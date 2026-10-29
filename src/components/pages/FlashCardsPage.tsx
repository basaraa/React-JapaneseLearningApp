import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLanguage } from '../../context';
import { getWords, getNounTypes, updateWordProgress } from '../../storage';
import type { Word } from '../../types';
import { FlipCard } from '../ui/FlipCard';
import { SearchBar } from '../ui/SearchBar';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface FlashCardsPageProps {
  initialCategory?: string;
}

export function FlashCardsPage({ initialCategory }: FlashCardsPageProps) {
  const { language } = useLanguage();
  const [words] = useState<Word[]>(getWords());
  const [nounTypes] = useState(getNounTypes());
  const [category, setCategory] = useState<string>(initialCategory || 'all');
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<'jp2lang' | 'lang2jp'>('jp2lang');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return words.filter((w) => {
      const matchCat =
        category === 'all' ||
        (category === 'uncategorized'
          ? w.subtypeIds.length === 0
          : w.subtypeIds.includes(category));
      if (!matchCat) return false;
      return (
        w.japWord.toLowerCase().includes(q) ||
        w.svkWord.toLowerCase().includes(q) ||
        w.engWord.toLowerCase().includes(q)
      );
    });
  }, [words, search, category]);

  const current = filtered[index];
  const total = filtered.length;

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    setIndex(0);
    setFlipped(false);
  }, []);

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
    setCorrect((c) => c + 1);
    updateWordProgress(current.id, true);
    handleNext();
  }, [current, handleNext]);

  const handleWrong = useCallback(() => {
    if (!current) return;
    setWrong((w) => w + 1);
    updateWordProgress(current.id, false);
    handleNext();
  }, [current, handleNext]);

  const handleReset = useCallback(() => {
    setCorrect(0);
    setWrong(0);
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
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {mode === 'jp2lang' ? current?.japWord : translation}
      </div>
      {mode === 'jp2lang' && current?.kanji && (
        <div className="text-sm font-mono text-gray-500 dark:text-gray-400">
          {current.kanji}
        </div>
      )}
    </div>
  );

  const back = (
    <div className="flex flex-col items-center justify-center h-full space-y-2">
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {mode === 'jp2lang' ? translation : current?.japWord}
      </div>
      {mode !== 'jp2lang' && current?.kanji && (
        <div className="text-sm font-mono text-gray-500 dark:text-gray-400">
          {current.kanji}
        </div>
      )}
      <div className="text-xs uppercase tracking-wider text-sakura-600 dark:text-sakura-400 font-semibold mt-1">
        {typeLabel(current?.wordType)}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {language === 'sk' ? 'Kartičky' : 'Flashcards'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'sk' ? 'Otočte kartičku a ohodnoťte svoje vedomosti.' : 'Flip the card and rate your knowledge.'}
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setIndex(0);
              setFlipped(false);
            }}
            className="rounded-lg px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border-none outline-none"
          >
            <option value="all">{language === 'sk' ? 'Všetky kategórie' : 'All categories'}</option>
            {nounTypes.map((nt) => (
              <option key={nt.id} value={nt.id}>
                {language === 'sk' ? nt.name_sk : nt.name_en}
              </option>
            ))}
            <option value="uncategorized">{language === 'sk' ? 'Bez kategórie' : 'Uncategorized'}</option>
          </select>

          <button
            onClick={() => setMode(mode === 'jp2lang' ? 'lang2jp' : 'jp2lang')}
            className="rounded-lg px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {mode === 'jp2lang' ? 'JP → Preklad' : 'Preklad → JP'}
          </button>
        </div>
      </div>

      <SearchBar value={search} onChange={handleSearch} placeholder={language === 'sk' ? 'Hľadaj slovíčko...' : 'Search word...'} />

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-gray-500 dark:text-gray-400 p-8 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <p className="mb-2">{language === 'sk' ? 'V tejto kategórii / filtri sa nenašli žiadne slovíčka.' : 'No words found in this category or search.'}</p>
          <button
            onClick={() => { setCategory('all'); setSearch(''); }}
            className="text-xs font-semibold text-sakura-600 dark:text-sakura-400 hover:underline"
          >
            {language === 'sk' ? 'Zobraziť všetky slovíčka' : 'Show all words'}
          </button>
        </div>
      ) : (
        <>
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


      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <span className="text-green-600">●</span> <span>{correct}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <span className="text-red-600">●</span> <span>{wrong}</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {index + 1} / {total}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handlePrev}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={index === 0}
        >
          {language === 'sk' ? 'Predchádzajúca' : 'Previous'}
        </button>
        <button
          onClick={handleFlip}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          {flipped ? (language === 'sk' ? 'Predná strana' : 'Front') : (language === 'sk' ? 'Zadná strana' : 'Back')}
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={index === total - 1}
        >
          {language === 'sk' ? 'Ďalšia' : 'Next'}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={handleCorrect}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
        >
          <span className="text-green-400 mr-1">✓</span> {language === 'sk' ? 'Správne' : 'Correct'}
        </button>
        <button
          onClick={handleWrong}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
        >
          <span className="text-red-400 mr-1">✗</span> {language === 'sk' ? 'Nesprávne' : 'Wrong'}
        </button>
      </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleReset}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <span className="text-gray-400 mr-1">↻</span> {language === 'sk' ? 'Resetovať' : 'Reset'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
