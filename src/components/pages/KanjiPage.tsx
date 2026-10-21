import { useMemo, useState } from 'react';
import { useLanguage } from '../../context';
import { getKanji } from '../../storage';
import { SearchBar } from '../ui/SearchBar';
import { Compass, BookOpen } from 'lucide-react';


export function KanjiPage() {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');

  const kanji = getKanji();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return kanji.filter(
      (k) =>
        k.kanjiChar.toLowerCase().includes(q) ||
        k.meaning_sk.toLowerCase().includes(q) ||
        k.meaning_en.toLowerCase().includes(q) ||
        k.kunyomi.toLowerCase().includes(q) ||
        k.onyomi.toLowerCase().includes(q)
    );
  }, [kanji, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {language === 'sk' ? 'Kanji znaky' : 'Kanji Characters'}
          </h1>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder={language === 'sk' ? 'Hľadaj kanji...' : 'Search kanji...'} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((k) => (
          <div key={k.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-center">
            <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-2">
              {k.kanjiChar}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {k.kunyomi ? `Kun: ${k.kunyomi}` : '—'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {k.onyomi ? `On: ${k.onyomi}` : '—'}
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              {language === 'sk' ? k.meaning_sk : k.meaning_en}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 italic">
              {language === 'sk' ? k.meaning_sk : k.meaning_en}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            {language === 'sk' ? 'Nenašli sa žiadne kanji.' : 'No kanji found.'}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <BookOpen className="w-4 h-4" />
        <span>{filtered.length}</span>
        <span>{language === 'sk' ? 'kanji celkom' : 'kanji total'}</span>
      </div>
    </div>
  );
}
