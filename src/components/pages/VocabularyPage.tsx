import { useState, useCallback, useMemo } from 'react';
import { useLanguage } from '../../context';
import { deleteWord, getWords, getNounTypes } from '../../storage';
import type { Word } from '../../types';
import { SearchBar } from '../ui/SearchBar';
import { SortableTable } from '../ui/SortableTable';
import { Modal } from '../ui/Modal';
import { WordForm } from '../ui/WordForm';
import { FlipCard } from '../ui/FlipCard';
import { Pagination } from '../ui/Pagination';
import { FlipHorizontal, Pencil, Trash2, Columns, LayoutGrid, Plus as PlusIcon } from 'lucide-react';

function getJapFontClass(text: string) {
  if (text.length > 25) return 'text-xs sm:text-sm font-medium';
  if (text.length > 15) return 'text-sm sm:text-base font-semibold';
  if (text.length > 8) return 'text-base sm:text-lg font-bold';
  return 'text-xl sm:text-2xl font-bold';
}

export function VocabularyPage() {
  const { language } = useLanguage();
  const [words, setWords] = useState<Word[]>(getWords());
  const [nounTypes] = useState(getNounTypes());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<string>('japWord');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [splitLanguages, setSplitLanguages] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Word | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Pagination state: default 100 items per page
  const [pageSize, setPageSize] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleSort = useCallback((key: string) => {
    setSortDir((prev) => (key === sortKey && prev === 'asc' ? 'desc' : 'asc'));
    setSortKey(key);
    setCurrentPage(1);
  }, [sortKey]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (val: string) => {
    setTypeFilter(val);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (val: string) => {
    setCategoryFilter(val);
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return words.filter((w) => {
      if (typeFilter !== 'all' && w.wordType !== typeFilter) return false;
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'uncategorized') {
          if (w.subtypeIds.length > 0) return false;
        } else {
          if (!w.subtypeIds.includes(categoryFilter)) return false;
        }
      }
      return (
        w.japWord.toLowerCase().includes(q) ||
        w.svkWord.toLowerCase().includes(q) ||
        w.engWord.toLowerCase().includes(q) ||
        (w.kanji ?? '').toLowerCase().includes(q)
      );
    });
  }, [words, search, typeFilter, categoryFilter]);

  // Sort full filtered dataset first so pagination preserves overall ordering
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      const av = String(aVal ?? '');
      const bv = String(bVal ?? '');
      const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' });
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  // Slice for current page (used in both Table and Cards view)
  const paginatedWords = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, validPage, pageSize]);

  const handleAdd = () => { setEditing(null); setOpen(true); };
  const handleEdit = (w: Word) => { setEditing(w); setOpen(true); };
  const handleSave = () => { setWords(getWords()); setOpen(false); setEditing(null); };
  const handleDelete = (id: string) => { setDeleteId(id); };
  const handleConfirmDelete = () => {
    if (deleteId) { deleteWord(deleteId); setWords(getWords()); setDeleteId(null); }
  };

  const typeLabel = (t: Word['wordType']) => {
    const labels: Record<Word['wordType'], string> =
      language === 'sk'
        ? { noun: 'Podst. meno', adjective: 'Príd. meno', verb: 'Sloveso', sentence: 'Veta' }
        : { noun: 'Noun', adjective: 'Adjective', verb: 'Verb', sentence: 'Sentence' };
    return labels[t];
  };

  const primaryTransKey = language === 'sk' ? 'svkWord' : 'engWord';

  const tableColumns = useMemo(() => {
    if (splitLanguages) {
      return [
        { key: 'japWord', label: language === 'sk' ? 'Japonsky' : 'Japanese', className: 'font-medium' },
        { key: 'svkWord', label: language === 'sk' ? 'Slovensky' : 'Slovak' },
        { key: 'engWord', label: language === 'sk' ? 'Anglicky' : 'English' },
        { key: 'wordType', label: language === 'sk' ? 'Typ' : 'Type', className: 'whitespace-nowrap' },
        { key: 'kanji', label: 'Kanji', className: 'whitespace-nowrap' },
        { key: 'dayOfAddition', label: language === 'sk' ? 'Pridané' : 'Added', className: 'whitespace-nowrap hidden sm:table-cell' },
        { key: 'actions', label: language === 'sk' ? 'Akcie' : 'Actions', className: 'whitespace-nowrap w-16 text-right', headerClassName: 'text-right' },
      ];
    }
    return [
      { key: 'japWord', label: language === 'sk' ? 'Japonsky' : 'Japanese', className: 'font-medium max-w-[200px]' },
      { key: primaryTransKey, label: language === 'sk' ? 'Preklad' : 'Translation', className: 'max-w-[260px]' },
      { key: 'wordType', label: language === 'sk' ? 'Typ' : 'Type', className: 'whitespace-nowrap w-24' },
      { key: 'dayOfAddition', label: language === 'sk' ? 'Pridané' : 'Added', className: 'whitespace-nowrap hidden sm:table-cell w-28 text-xs text-gray-500 dark:text-gray-400' },
      { key: 'actions', label: language === 'sk' ? 'Akcie' : 'Actions', className: 'whitespace-nowrap w-16 text-right', headerClassName: 'text-right' },
    ];
  }, [splitLanguages, language, primaryTransKey]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {language === 'sk' ? 'Slovíčka' : 'Vocabulary'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'sk' ? 'Prehľad, triedenie, vyhľadávanie a úprava slovíčok.' : 'Browse, sort, search and edit words.'}
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          {view === 'table' && (
            <button
              onClick={() => setSplitLanguages((prev) => !prev)}
              className="flex items-center rounded-lg px-2.5 py-2 text-xs font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              title={splitLanguages ? 'Prepnúť na kompaktné zobrazenie' : 'Zobraziť samostatné stĺpce pre SVK a ENG'}
            >
              <Columns className="w-3.5 h-3.5 mr-1.5" />
              {splitLanguages
                ? (language === 'sk' ? 'Kompaktné' : 'Compact')
                : (language === 'sk' ? 'Všetky stĺpce' : 'All columns')}
            </button>
          )}
          <button
            onClick={() => setView(view === 'table' ? 'cards' : 'table')}
            className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              view === 'cards' ? 'bg-sakura-100 dark:bg-sakura-900/30 text-sakura-700 dark:text-sakura-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {view === 'table' ? <LayoutGrid className="w-4 h-4 mr-1.5" /> : <FlipHorizontal className="w-4 h-4 mr-1.5" />}
            {view === 'table' ? (language === 'sk' ? 'Kartičky' : 'Cards') : (language === 'sk' ? 'Tabuľka' : 'Table')}
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-sakura-600 hover:bg-sakura-700 focus:outline-none focus:ring-2 focus:ring-sakura-500 focus:ring-offset-2 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-1.5" /> {language === 'sk' ? 'Pridať' : 'Add'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div className="sm:col-span-6 lg:col-span-6">
          <SearchBar value={search} onChange={handleSearchChange} placeholder={language === 'sk' ? 'Hľadaj slovo...' : 'Search words...'} />
        </div>
        <div className="sm:col-span-3 lg:col-span-3">
          <select
            value={typeFilter}
            onChange={(e) => handleTypeFilterChange(e.target.value)}
            className="w-full h-full min-h-[42px] px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-sakura-500"
          >
            <option value="all">{language === 'sk' ? 'Všetky typy slov' : 'All word types'}</option>
            <option value="noun">{language === 'sk' ? 'Podstatné mená' : 'Nouns'}</option>
            <option value="adjective">{language === 'sk' ? 'Prídavné mená' : 'Adjectives'}</option>
            <option value="verb">{language === 'sk' ? 'Slovesá' : 'Verbs'}</option>
            <option value="sentence">{language === 'sk' ? 'Vety' : 'Sentences'}</option>
          </select>
        </div>
        <div className="sm:col-span-3 lg:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryFilterChange(e.target.value)}
            className="w-full h-full min-h-[42px] px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-sakura-500"
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
      </div>

      {view === 'table' ? (
        <SortableTable<Word>
          columns={tableColumns}
          data={paginatedWords}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          renderCell={(item, col) => {
            if (col === 'japWord') {
              return (
                <div className="py-0.5">
                  <div className="font-semibold text-gray-900 dark:text-white break-words">{item.japWord}</div>
                  {!splitLanguages && item.kanji && (
                    <span className="inline-block mt-0.5 text-[11px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/70 px-1.5 py-0.5 rounded">
                      {item.kanji}
                    </span>
                  )}
                </div>
              );
            }
            if (col === primaryTransKey && !splitLanguages) {
              const primary = language === 'sk' ? item.svkWord : item.engWord;
              const secondary = language === 'sk' ? item.engWord : item.svkWord;
              return (
                <div className="py-0.5">
                  <div className="font-medium text-gray-900 dark:text-white break-words">{primary}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 break-words">{secondary}</div>
                </div>
              );
            }
            if (col === 'wordType') {
              return (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300">
                  {typeLabel(item.wordType)}
                </span>
              );
            }
            if (col === 'kanji') {
              return <span className="font-mono text-gray-500 dark:text-gray-400">{item.kanji ?? '—'}</span>;
            }
            if (col === 'dayOfAddition') {
              return <span className="text-gray-500 dark:text-gray-400 text-xs">{item.dayOfAddition}</span>;
            }
            if (col === 'actions') {
              return (
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                    className="p-1 rounded text-gray-500 hover:text-sakura-600 dark:hover:text-sakura-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={language === 'sk' ? 'Upraviť' : 'Edit'}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="p-1 rounded text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={language === 'sk' ? 'Vymazať' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }
            return <span className="font-medium break-words">{String(item[col as keyof Word] ?? '')}</span>;
          }}
          emptyMessage={language === 'sk' ? 'Žiadne slovíčka sa nenašli.' : 'No words found.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedWords.map((w) => {
            const chosenTrans = language === 'sk' ? w.svkWord : w.engWord;
            return (
              <div key={w.id} className="relative group">
                <FlipCard
                  showHint={false}
                  className="w-full h-44 sm:h-48"
                  front={
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                      <div className={`text-gray-900 dark:text-white leading-snug break-all [overflow-wrap:anywhere] ${getJapFontClass(w.japWord)}`}>
                        {w.japWord}
                      </div>
                      {w.kanji && (
                        <div className="mt-2 text-xs font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300">
                          {w.kanji}
                        </div>
                      )}
                    </div>
                  }
                  back={
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center space-y-2">
                      <div className={`text-gray-900 dark:text-white font-semibold leading-snug break-words [overflow-wrap:anywhere] ${getJapFontClass(chosenTrans)}`}>
                        {chosenTrans}
                      </div>
                      <div className="pt-1">
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-sakura-600 dark:text-sakura-300 border border-gray-200 dark:border-gray-600">
                          {typeLabel(w.wordType)}
                        </span>
                      </div>
                    </div>
                  }
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 dark:bg-gray-800/90 rounded-lg p-1 shadow z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(w); }}
                    className="p-1 text-gray-500 hover:text-sakura-600 transition-colors"
                    title={language === 'sk' ? 'Upraviť' : 'Edit'}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(w.id); }}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                    title={language === 'sk' ? 'Vymazať' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {paginatedWords.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              {language === 'sk' ? 'Žiadne slovíčka na zobrazenie.' : 'No words to display.'}
            </div>
          )}
        </div>
      )}

      {/* Pagination at the bottom for both table and cards views */}
      <Pagination
        currentPage={validPage}
        totalItems={sorted.length}
        pageSize={pageSize}
        pageSizeOptions={[25, 100, 200, 500, 1000]}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      <Modal open={open} onClose={handleSave} title={editing ? 'Upraviť slovo / Edit word' : 'Pridať slovo / Add word'}>
        <WordForm initialWord={editing ?? undefined} onComplete={handleSave} />
      </Modal>
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Vymazať slovo / Delete word">
        <div className="text-center">
          <p className="mb-4">{language === 'sk' ? 'Naozaj chcete vymazať toto slovo?' : 'Are you sure you want to delete this word?'}</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
              {language === 'sk' ? 'Zrušiť' : 'Cancel'}
            </button>
            <button onClick={handleConfirmDelete} className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700">
              {language === 'sk' ? 'Vymazať' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
