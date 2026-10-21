import { useMemo, useState } from 'react';
import { useLanguage } from '../../context';
import { getGrammar, getGrammarSentences } from '../../storage';
import { SearchBar } from '../ui/SearchBar';

import { BookOpen, ArrowRight } from 'lucide-react';

export function GrammarPage() {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const grammar = getGrammar();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return grammar.filter(
      (g) =>
        g.title_sk.toLowerCase().includes(q) ||
        g.title_en.toLowerCase().includes(q) ||
        g.description_sk.toLowerCase().includes(q) ||
        g.description_en.toLowerCase().includes(q)
    );
  }, [grammar, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {language === 'sk' ? 'Gramatika' : 'Grammar'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'sk' ? 'Prehliadajte gramatické pravidlá s príkladmi viet.' : 'Browse grammar rules with example sentences.'}
          </p>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder={language === 'sk' ? 'Hľadaj...' : 'Search...'} />
      </div>

      {selectedId ? (
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowRight className="w-4 h-4" rotate={180} /> {language === 'sk' ? 'Späť' : 'Back'}
          </button>
        </div>
      ) : null}

      <div className="space-y-2">
        {filtered.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedId(g.id)}
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
          >
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {language === 'sk' ? g.title_sk : g.title_en}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {language === 'sk' ? g.description_sk.slice(0, 90) : g.description_en.slice(0, 90)}{g.description_sk.length > 90 || g.description_en.length > 90 ? '…' : ''}
              </div>
            </div>
            <BookOpen className="w-4 h-4 text-gray-400" />
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            {language === 'sk' ? 'Žiadne gramatické pravidlá sa nenašli.' : 'No grammar rules found.'}
          </div>
        )}
      </div>

      {selectedId && (
        <GrammarDetailModal grammarId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

function GrammarDetailModal({ grammarId, onClose }: { grammarId: string; onClose: () => void }) {
  const { language } = useLanguage();
  const grammar = getGrammar().find((g) => g.id === grammarId);
  const sentences = grammar ? getGrammarSentences().filter((s) => s.grammarId === grammarId) : [];

  if (!grammar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {language === 'sk' ? grammar.title_sk : grammar.title_en}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white"
            aria-label="Close"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          {language === 'sk' ? grammar.description_sk : grammar.description_en}
        </p>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {language === 'sk' ? 'Príkladové vety' : 'Example sentences'}
          </h3>
          <div className="space-y-2">
            {sentences.length > 0 ? (
              sentences.map((s) => (
                <div key={s.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-left">
                  <div className="text-lg font-medium text-gray-900 dark:text-white">{s.japSentence}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {language === 'sk' ? s.svkSentence : s.engSentence}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                {language === 'sk' ? 'Žiadne príklady.' : 'No examples.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
