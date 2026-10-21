import { useMemo, useState } from 'react';
import { useLanguage } from '../../context';
import { getVerbFormTypes, getVerbFormSuffixes } from '../../storage';
import { SearchBar } from '../ui/SearchBar';

import { BookOpen } from 'lucide-react';

export function VerbFormsPage() {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');

  const types = getVerbFormTypes();
  const suffixes = getVerbFormSuffixes();

  const filteredTypes = useMemo(() => {
    const q = search.toLowerCase();
    return types.filter(
      (t) => t.name_sk.toLowerCase().includes(q) || t.name_en.toLowerCase().includes(q)
    );
  }, [types, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {language === 'sk' ? 'Tvary slovies' : 'Verb Forms'}
          </h1>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder={language === 'sk' ? 'Hľadaj...' : 'Search...'} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTypes.map((type) => {
          const related = suffixes.filter((s) => s.formTypeId === type.id);
          return (
            <div key={type.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {language === 'sk' ? type.name_sk : type.name_en}
                </span>
                <span className="text-xs font-medium text-white bg-indigo-500 dark:bg-indigo-600 px-2 py-0.5 rounded">
                  {related.length}
                </span>
              </div>
              <div className="space-y-2">
                {related.map((s) => (
                  <div key={s.id} className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-mono text-gray-500 dark:text-gray-400 mr-2">{s.origin}</span>
                    <span>
                      {s.formalSuffix ? `formal: ${s.formalSuffix}` : '—'}
                    </span>
                    <span className="ml-2 text-gray-500 dark:text-gray-400">|</span>
                    <span>
                      {s.informalSuffix ? `informal: ${s.informalSuffix}` : '—'}
                    </span>
                  </div>
                ))}
                {related.length === 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                    {language === 'sk' ? 'Žiadne prípony.' : 'No suffixes.'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filteredTypes.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            {language === 'sk' ? 'Nenašli sa žiadne tvary.' : 'No verb forms found.'}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>{suffixes.length}</span>
        <span>{language === 'sk' ? 'prípony celkom' : 'suffixes total'}</span>
      </div>
    </div>
  );
}
