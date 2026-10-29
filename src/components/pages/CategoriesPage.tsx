import { useMemo, useState } from 'react';
import { useLanguage } from '../../context';
import { getWords, getNounTypes } from '../../storage';
import type { Word, NounType } from '../../types';
import { SearchBar } from '../ui/SearchBar';
import { Modal } from '../ui/Modal';
import { Folder, GraduationCap, BookOpen, List, Sparkles } from 'lucide-react';

interface CategoriesPageProps {
  onStartExam?: (categoryId: string) => void;
  onStartFlashcards?: (categoryId: string) => void;
}

export function CategoriesPage({ onStartExam, onStartFlashcards }: CategoriesPageProps) {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [inspectCategory, setInspectCategory] = useState<NounType | { id: string; name_sk: string; name_en: string; imageName?: string } | null>(null);

  const words = getWords();
  const nounTypes = getNounTypes();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return words.filter(
      (w) =>
        w.japWord.toLowerCase().includes(q) ||
        w.svkWord.toLowerCase().includes(q) ||
        w.engWord.toLowerCase().includes(q)
    );
  }, [words, search]);

  const byCategory = useMemo(() => {
    const map = new Map<string, Word[]>();
    nounTypes.forEach((t) => map.set(t.id, []));
    map.set('uncategorized', []);
    filtered.forEach((w) => {
      if (w.subtypeIds.length === 0) {
        map.get('uncategorized')!.push(w);
      } else {
        w.subtypeIds.forEach((id) => {
          const arr = map.get(id);
          if (arr) arr.push(w);
        });
      }
    });
    return map;
  }, [filtered, nounTypes]);

  const inspectWords = useMemo(() => {
    if (!inspectCategory) return [];
    if (inspectCategory.id === 'uncategorized') {
      return words.filter((w) => w.subtypeIds.length === 0);
    }
    return words.filter((w) => w.subtypeIds.includes(inspectCategory.id));
  }, [inspectCategory, words]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sakura-500" />
            {language === 'sk' ? 'Tematické kategórie' : 'Thematic Categories'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'sk'
              ? 'Slovíčka rozdelené podľa tém (reštaurácia, zvieratá, jedlo...). Zvoľte kategóriu a spustite z nej test alebo kartičky.'
              : 'Words organized by topic (restaurant, animals, food...). Select a category to test or practice.'}
          </p>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder={language === 'sk' ? 'Hľadaj v kategóriách...' : 'Search categories...'} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...byCategory.entries()].map(([catId, catWords]) => {
          const type = nounTypes.find((t) => t.id === catId);
          const isUncategorized = catId === 'uncategorized';
          const label = isUncategorized
            ? (language === 'sk' ? 'Bez kategórie' : 'Uncategorized')
            : (type ? (language === 'sk' ? type.name_sk : type.name_en) : catId);
          const altLabel = isUncategorized
            ? ''
            : (type ? (language === 'sk' ? type.name_en : type.name_sk) : '');

          const catObj = type || { id: 'uncategorized', name_sk: 'Bez kategórie', name_en: 'Uncategorized' };

          return (
            <div
              key={catId}
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              {/* Category card header */}
              <div className="relative h-28 bg-gradient-to-r from-sakura-100 to-indigo-100 dark:from-sakura-950/50 dark:to-indigo-950/50 overflow-hidden flex items-center justify-between p-4">
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-sakura-600 dark:text-sakura-400" />
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white capitalize">
                      {label}
                    </h2>
                  </div>
                  {altLabel && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 capitalize ml-7">
                      {altLabel}
                    </p>
                  )}
                </div>
                <div className="relative z-10">
                  <span className="text-xs font-bold text-sakura-700 dark:text-sakura-300 bg-white/90 dark:bg-gray-800/90 border border-sakura-200 dark:border-sakura-800 px-2.5 py-1 rounded-full shadow-sm">
                    {catWords.length} {language === 'sk' ? 'slov' : 'words'}
                  </span>
                </div>
              </div>

              {/* Sample words list */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5 min-h-[90px]">
                  {catWords.slice(0, 4).map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between text-xs sm:text-sm text-gray-700 dark:text-gray-300 py-0.5 border-b border-gray-50 dark:border-gray-700/50"
                    >
                      <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[45%]">
                        {w.japWord}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 truncate max-w-[50%] text-right">
                        {language === 'sk' ? w.svkWord : (w.engWord || w.svkWord)}
                      </span>
                    </div>
                  ))}
                  {catWords.length > 4 && (
                    <div className="text-[11px] text-sakura-600 dark:text-sakura-400 font-medium italic pt-1">
                      +{catWords.length - 4} {language === 'sk' ? 'ďalších slov...' : 'more words...'}
                    </div>
                  )}
                  {catWords.length === 0 && (
                    <div className="text-xs text-gray-400 italic py-4 text-center">
                      {language === 'sk' ? 'Žiadne slová v tejto kategórii' : 'No words in this category'}
                    </div>
                  )}
                </div>

                {/* Actions: Test, Flashcards, View All */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onStartExam?.(catId)}
                    disabled={catWords.length === 0}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-white bg-sakura-600 hover:bg-sakura-700 disabled:opacity-40 transition-colors shadow-sm"
                    title={language === 'sk' ? 'Spustiť test z tejto kategórie' : 'Take quiz for this category'}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{language === 'sk' ? 'Test' : 'Exam'}</span>
                  </button>

                  <button
                    onClick={() => onStartFlashcards?.(catId)}
                    disabled={catWords.length === 0}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 disabled:opacity-40 transition-colors"
                    title={language === 'sk' ? 'Otvoriť kartičky pre túto kategóriu' : 'Open flashcards for this category'}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{language === 'sk' ? 'Karty' : 'Cards'}</span>
                  </button>

                  <button
                    onClick={() => setInspectCategory(catObj)}
                    disabled={catWords.length === 0}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 transition-colors"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>{language === 'sk' ? 'Slová' : 'Words'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Category Modal */}
      <Modal
        open={inspectCategory !== null}
        onClose={() => setInspectCategory(null)}
        title={
          inspectCategory
            ? `${language === 'sk' ? inspectCategory.name_sk : inspectCategory.name_en} (${inspectWords.length} ${language === 'sk' ? 'slov' : 'words'})`
            : ''
        }
      >
        <div className="space-y-4 max-h-[70vh] flex flex-col">
          

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (inspectCategory) {
                  onStartExam?.(inspectCategory.id);
                  setInspectCategory(null);
                }
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-white bg-sakura-600 hover:bg-sakura-700 transition-colors shadow-sm"
            >
              <GraduationCap className="w-4 h-4" />
              {language === 'sk' ? 'Spustiť test z kategórie' : 'Start category test'}
            </button>
            <button
              onClick={() => {
                if (inspectCategory) {
                  onStartFlashcards?.(inspectCategory.id);
                  setInspectCategory(null);
                }
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              {language === 'sk' ? 'Učiť sa cez kartičky' : 'Study via flashcards'}
            </button>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-gray-700 pr-1">
            {inspectWords.map((w) => (
              <div key={w.id} className="py-2 flex items-center justify-between text-sm">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-gray-900 dark:text-white">{w.japWord}</span>
                  {w.kanji && (
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1 rounded">
                      {w.kanji}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-gray-800 dark:text-gray-200">
                    {language === 'sk' ? w.svkWord : (w.engWord || w.svkWord)}
                  </div>
                  {language === 'sk' && w.engWord && (
                    <div className="text-[11px] text-gray-400">{w.engWord}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span>
        <span>{language === 'sk' ? 'slovíčok celkom v kategóriách' : 'words total across categories'}</span>
      </div>
    </div>
  );
}

