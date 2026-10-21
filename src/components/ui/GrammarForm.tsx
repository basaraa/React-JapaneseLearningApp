import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { saveGrammar, createGrammar, getGrammar } from '../../storage';
import type { Grammar } from '../../types';

interface GrammarFormProps {
  onComplete?: () => void;
  initialGrammar?: Grammar;
}

export function GrammarForm({ onComplete, initialGrammar }: GrammarFormProps = {}) {
  const [grammar, setGrammar] = useState<Grammar>(initialGrammar ?? createGrammar());
  const [message, setMessage] = useState({ text: '', type: 'success' as 'success' | 'error' });

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setGrammar((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const g: Grammar = {
        ...grammar,
        title_sk: grammar.title_sk.trim(),
        title_en: grammar.title_en.trim(),
        description_sk: grammar.description_sk.trim(),
        description_en: grammar.description_en.trim(),
      };
      if (!g.title_sk) {
        setMessage({ text: 'Zadajte názov gramatiky. / Please enter a grammar name.', type: 'error' });
        return;
      }
      const existing = getGrammar();
      if (!initialGrammar && existing.some((x) => x.title_sk === g.title_sk && x.id !== g.id)) {
        setMessage({ text: 'Táto gramatika už existuje. / This grammar already exists.', type: 'error' });
        return;
      }
      saveGrammar(g);
      setMessage({ text: 'Uložené úspešne! / Saved successfully!', type: 'success' });
      onComplete?.();
    },
    [grammar, initialGrammar, onComplete]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Názov (SK) / Name (SK)
        </label>
        <input
          name="title_sk"
          value={grammar.title_sk}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Názov (EN) / Name (EN)
        </label>
        <input
          name="title_en"
          value={grammar.title_en}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Popis (SK) / Description (SK)
        </label>
        <textarea
          name="description_sk"
          value={grammar.description_sk}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Popis (EN) / Description (EN)
        </label>
        <textarea
          name="description_en"
          value={grammar.description_en}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none"
        />
      </div>
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          {initialGrammar ? 'Aktualizovať / Update' : 'Pridať / Add'}
        </button>
      </div>
      {message.text && (
        <div
          className={`mt-3 px-3 py-2 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
    </form>
  );
}
