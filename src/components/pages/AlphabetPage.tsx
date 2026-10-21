import { useMemo, useState } from 'react';
import { useLanguage } from '../../context';
import { getKana } from '../../storage';
import { SearchBar } from '../ui/SearchBar';
import { BookOpen, Landmark } from 'lucide-react';


export function AlphabetPage() {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'hiragana' | 'katakana' | 'both'>('both');

  const kana = getKana();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return kana.filter((k) =>
      k.hiragana.toLowerCase().includes(q) ||
      k.katakana.toLowerCase().includes(q) ||
      k.romaji.toLowerCase().includes(q)
    );
  }, [kana, search]);

  const display = useMemo(() => {
    if (tab === 'hiragana') return filtered.map((k) => ({ char: k.hiragana, romaji: k.romaji, label: 'Hiragana' }));
    if (tab === 'katakana') return filtered.map((k) => ({ char: k.katakana, romaji: k.romaji, label: 'Katakana' }));
    return filtered.map((k) => [
      { char: k.hiragana, romaji: k.romaji, label: 'Hiragana' },
      { char: k.katakana, romaji: k.romaji, label: 'Katakana' },
    ]).flat();
  }, [filtered, tab]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-sakura-600 dark:text-sakura-400" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {language === 'sk' ? 'Kana abeceda' : 'Kana Alphabet'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {[
            ['both', language === 'sk' ? 'Všetko' : 'Both'],
            ['hiragana', 'Hiragana'],
            ['katakana', 'Katakana'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id as 'hiragana' | 'katakana' | 'both')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === id
                  ? 'bg-sakura-100 dark:bg-sakura-900/30 text-sakura-700 dark:text-sakura-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder={language === 'sk' ? 'Hľadaj kanu...' : 'Search kana...'} />

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {display.map((item, i) => (
          <button
            key={`${item.char}-${i}`}
            className="aspect-square rounded-xl flex flex-col items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center text-2xl font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors active:scale-95"
          >
            <span className="text-3xl font-bold leading-none">{item.char}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 uppercase tracking-wider">{item.romaji}</span>
          </button>
        ))}
        {display.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            {language === 'sk' ? 'Nenašli sa žiadne znaky.' : 'No characters found.'}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Landmark className="w-4 h-4" />
        <span>{display.length}</span>
        <span>{language === 'sk' ? 'znakov' : 'characters'}</span>
      </div>
    </div>
  );
}
