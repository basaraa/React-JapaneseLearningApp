import { useMemo, useState } from 'react';
import { useLanguage } from '../../context';
import { getWords, getNounTypes } from '../../storage';
import type { Word } from '../../types';
import { SearchBar } from '../ui/SearchBar';
import { Folder } from 'lucide-react';

export function CategoriesPage() {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {language === 'sk' ? 'Kategórie' : 'Categories'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'sk' ? 'Slovíčka zoradené podľa typov podstatných mien.' : 'Words grouped by noun types.'}
          </p>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder={language === 'sk' ? 'Hľadaj...' : 'Search...'} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...byCategory.entries()].map(([catId, catWords]) => {
          const type = nounTypes.find((t) => t.id === catId);
          const isUncategorized = catId === 'uncategorized';
          const label = isUncategorized
            ? language === 'sk'
              ? 'Bez kategórie'
              : 'Uncategorized'
            : type
              ? language === 'sk'
                ? type.name_sk
                : type.name_en
              : catId;
          return (
            <div key={catId} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-sakura-600 dark:text-sakura-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">{label}</span>
                </div>
                <span className="text-xs font-medium text-white bg-gray-500 dark:bg-gray-600 px-2 py-0.5 rounded">
                  {catWords.length}
                </span>
              </div>
              <div className="space-y-1">
                {catWords.slice(0, 6).map((w) => (
                  <div key={w.id} className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium truncate">{w.japWord}</span>
                    <span className="text-gray-500 dark:text-gray-500 truncate">{w.svkWord}</span>
                  </div>
                ))}
                {catWords.length > 6 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                    +{catWords.length - 6} {language === 'sk' ? 'viac' : 'more'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>{filtered.length}</span>
        <span>{language === 'sk' ? 'slovíčok celkom' : 'words total'}</span>
      </div>
    </div>
  );
}

