import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { saveWord, createWord, getWords, getNounTypes } from '../../storage';
import type { Word, NounType } from '../../types';

interface WordFormProps {
  onComplete?: () => void;
  initialWord?: Word;
}

export function WordForm({ onComplete, initialWord }: WordFormProps = {}) {
  const [word, setWord] = useState<Word>(initialWord ?? createWord());
  const [subtypes] = useState<NounType[]>(getNounTypes);
  const [message, setMessage] = useState({ text: '', type: 'success' as 'success' | 'error' });

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setWord((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubtypeToggle = useCallback((id: string) => {
    setWord((prev) => {
      const idx = prev.subtypeIds.indexOf(id);
      return {
        ...prev,
        subtypeIds: idx >= 0 ? prev.subtypeIds.filter((x) => x !== id) : [...prev.subtypeIds, id],
      };
    });
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const w: Word = {
        ...word,
        dayOfAddition: word.dayOfAddition || new Date().toISOString().split('T')[0],
        timesCorrect: word.timesCorrect ?? 0,
        timesWrong: word.timesWrong ?? 0,
      };
      const existing = getWords();
      if (!initialWord && existing.some((x) => x.japWord === w.japWord && x.id !== w.id)) {
        setMessage({ text: 'Toto slovo už existuje. / This word already exists.', type: 'error' });
        return;
      }
      saveWord(w);
      setMessage({ text: 'Uložené úspešne! / Saved successfully!', type: 'success' });
      onComplete?.();
    },
    [word, initialWord, onComplete]
  );

  const input = (name: string, label: string, required?: boolean) => (
    <div key={name} className="col-span-1 md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        name={name}
        value={word[name as keyof Word] ?? ''}
        onChange={handleChange}
        className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none"
        required={!!required}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {input('japWord', 'Japonsky / Japanese', true)}
          {input('svkWord', 'Slovensky / Slovak')}
          {input('engWord', 'Anglicky / English')}
          {input('kanji', 'Kanji')}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Typ slova / Word type
            </label>
            <select
              name="wordType"
              value={word.wordType}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none"
            >
              <option value="noun">Podstatné meno / Noun</option>
              <option value="adjective">Prídavné meno / Adjective</option>
              <option value="verb">Sloveso / Verb</option>
              <option value="sentence">Veta / Sentence</option>
            </select>
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kategórie / Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {subtypes.map((t) => (
                <label key={t.id} className="cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={word.subtypeIds.includes(t.id)}
                    onChange={() => handleSubtypeToggle(t.id)}
                    className="rounded text-sakura-600 focus:ring-sakura-500"
                  />
                  <span className="ml-1.5 text-sm text-gray-700 dark:text-gray-300">{t.name_sk}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setWord(createWord())}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-sakura-600 rounded-lg hover:bg-sakura-700 focus:outline-none focus:ring-2 focus:ring-sakura-500 focus:ring-offset-2 transition-colors"
          >
            {initialWord ? 'Aktualizovať / Update' : 'Pridať / Add'}
          </button>
        </div>
      </form>
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
    </div>
  );
}
