import { useState } from 'react';
import { useLanguage } from '../../context';
import { WordForm } from '../ui/WordForm';
import { GrammarForm } from '../ui/GrammarForm';
import { KanjiForm } from '../ui/KanjiForm';
import {
  createGrammarSentence,
  saveGrammarSentence,
  getGrammar,
  saveWord,
  saveGrammar,
  saveKanji,
  parseCSVWords,
  parseCSVGrammar,
  parseCSVGrammarSentences,
  parseCSVKanji,
} from '../../storage';

type Tab = 'word' | 'grammar' | 'sentence' | 'kanji' | 'csv';

const TABS: Record<Tab, { label: string }> = {
  word: { label: 'Word / Slovo' },
  grammar: { label: 'Grammar / Gramatika' },
  sentence: { label: 'Sentence / Veta' },
  kanji: { label: 'Kanji' },
  csv: { label: 'CSV Import' },
};

export function AddDataPage() {
  const { language } = useLanguage();
  const [tab, setTab] = useState<Tab>('word');

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {language === 'sk' ? 'Pridať dáta' : 'Add Data'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'sk' ? 'Manuálne zadanie slovíčok, gramatiky, vet a kanji.' : 'Manually enter words, grammar, sentences and kanji.'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(TABS).map(([id, t]) => (
          <button
            key={id}
            onClick={() => setTab(id as Tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-sakura-100 dark:bg-sakura-900/30 text-sakura-700 dark:text-sakura-400 border border-sakura-200 dark:border-sakura-800'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'word' && <WordForm />}
      {tab === 'grammar' && <GrammarForm />}
      {tab === 'kanji' && <KanjiForm />}

      {tab === 'sentence' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {language === 'sk' ? 'Pridať vetu' : 'Add Sentence'}
          </h2>
          <SentenceForm />
        </div>
      )}

      {tab === 'csv' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {language === 'sk' ? 'Import z CSV' : 'Import from CSV'}
          </h2>
          <CsvImport />
        </div>
      )}
    </div>
  );
}

function SentenceForm() {
  const { language } = useLanguage();
  const [grammarId, setGrammarId] = useState('');
  const [jap, setJap] = useState('');
  const [svk, setSvk] = useState('');
  const [eng, setEng] = useState('');
  const [message, setMessage] = useState({ text: '', type: 'success' as 'success' | 'error' });

  const grammars = getGrammar();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grammarId || !jap) {
      setMessage({ text: 'Vyberte gramatiku a zadajte vetu. / Select grammar and enter sentence.', type: 'error' });
      return;
    }
    saveGrammarSentence(createGrammarSentence(grammarId));
    setMessage({ text: 'Veta uložená. / Sentence saved.', type: 'success' });
    setJap(''); setSvk(''); setEng('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {language === 'sk' ? 'Gramatika' : 'Grammar'}
        </label>
        <select
          value={grammarId}
          onChange={(e) => setGrammarId(e.target.value)}
          className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none"
        >
          <option value="">{language === 'sk' ? 'Vyberte gramatiku...' : 'Select grammar...'}</option>
          {grammars.map((g) => (
            <option key={g.id} value={g.id}>
              {language === 'sk' ? g.title_sk : g.title_en}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {language === 'sk' ? 'Japonská veta' : 'Japanese sentence'}
        </label>
        <input
          value={jap}
          onChange={(e) => setJap(e.target.value)}
          className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {language === 'sk' ? 'Preklad (SK)' : 'Translation (SK)'}
        </label>
        <input value={svk} onChange={(e) => setSvk(e.target.value)} className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {language === 'sk' ? 'Preklad (EN)' : 'Translation (EN)'}
        </label>
        <input value={eng} onChange={(e) => setEng(e.target.value)} className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none" />
      </div>
      <button
        type="submit"
        className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
      >
        {language === 'sk' ? 'Pridať vetu' : 'Add Sentence'}
      </button>
      {message.text && (
        <div className={`mt-2 px-3 py-2 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}
    </form>
  );
}

function CsvImport() {
  const { language } = useLanguage();
  const [type, setType] = useState<'word' | 'grammar' | 'sentence' | 'kanji'>('word');
  const [message, setMessage] = useState({ text: '', type: 'success' as 'success' | 'error' });

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      try {
        if (type === 'word') {
          const words = parseCSVWords(csv);
          words.forEach(saveWord);
          setMessage({ text: `${words.length} slovíčok importovaných. / ${words.length} words imported.`, type: 'success' });
        } else if (type === 'grammar') {
          const list = parseCSVGrammar(csv);
          list.forEach(saveGrammar);
          setMessage({ text: `${list.length} gramatík importovaných. / ${list.length} grammars imported.`, type: 'success' });
        } else if (type === 'sentence') {
          const list = parseCSVGrammarSentences(csv);
          list.forEach(saveGrammarSentence);
          setMessage({ text: `${list.length} viet importovaných. / ${list.length} sentences imported.`, type: 'success' });
        } else {
          const list = parseCSVKanji(csv);
          list.forEach(saveKanji);
          setMessage({ text: `${list.length} kanji importovaných. / ${list.length} kanji imported.`, type: 'success' });
        }
      } catch (err) {
        setMessage({ text: 'Chyba pri importe. / Import error.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {language === 'sk' ? 'Typ dát' : 'Data type'}
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none"
        >
          <option value="word">{language === 'sk' ? 'Slovíčka' : 'Words'}</option>
          <option value="grammar">{language === 'sk' ? 'Gramatika' : 'Grammar'}</option>
          <option value="sentence">{language === 'sk' ? 'Vety' : 'Sentences'}</option>
          <option value="kanji">{language === 'sk' ? 'Kanji' : 'Kanji'}</option>
        </select>
      </div>
      <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6 text-center hover:border-sakura-300 dark:hover:border-sakura-700 transition-colors">
        <input
          type="file"
          accept=".csv"
          className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sakura-50 dark:file:bg-sakura-900/20 file:text-sakura-700 dark:file:text-sakura-300 hover:file:bg-sakura-100 dark:hover:file:bg-sakura-800/30 cursor-pointer"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {language === 'sk' ? 'Vyberte .csv súbor na import.' : 'Select a .csv file to import.'}
        </p>
      </div>
      {message.text && (
        <div className={`mt-2 px-3 py-2 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
