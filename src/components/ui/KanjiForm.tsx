import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';
import { saveKanji, createKanji, getKanji } from '../../storage';
import type { Kanji } from '../../types';

interface KanjiFormProps {
  onComplete?: () => void;
  initialKanji?: Kanji;
}

export function KanjiForm({ onComplete, initialKanji }: KanjiFormProps = {}) {
  const [kanji, setKanji] = useState<Kanji>(initialKanji ?? createKanji());
  const [message, setMessage] = useState({ text: '', type: 'success' as 'success' | 'error' });

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setKanji((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const k: Kanji = {
        ...kanji,
        kanjiChar: kanji.kanjiChar.trim(),
        kunyomi: kanji.kunyomi.trim(),
        onyomi: kanji.onyomi.trim(),
        meaning_sk: kanji.meaning_sk.trim(),
        meaning_en: kanji.meaning_en.trim(),
      };
      if (!k.kanjiChar) {
        setMessage({ text: 'Zadajte kanji znak. / Please enter a kanji character.', type: 'error' });
        return;
      }
      const existing = getKanji();
      if (!initialKanji && existing.some((x) => x.kanjiChar === k.kanjiChar && x.id !== k.id)) {
        setMessage({ text: 'Tento kanji už existuje. / This kanji already exists.', type: 'error' });
        return;
      }
      saveKanji(k);
      setMessage({ text: 'Uložené úspešne! / Saved successfully!', type: 'success' });
      onComplete?.();
    },
    [kanji, initialKanji, onComplete]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kanji znak / Character
          </label>
          <input
            name="kanjiChar"
            value={kanji.kanjiChar}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none text-2xl font-mono"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kun'yomi
          </label>
          <input
            name="kunyomi"
            value={kanji.kunyomi}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            On'yomi
          </label>
          <input
            name="onyomi"
            value={kanji.onyomi}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Význam (SK) / Meaning (SK)
          </label>
          <input
            name="meaning_sk"
            value={kanji.meaning_sk}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Význam (EN) / Meaning (EN)
          </label>
          <input
            name="meaning_en"
            value={kanji.meaning_en}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sakura-500 outline-none"
          />
        </div>
      </div>
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          {initialKanji ? 'Aktualizovať / Update' : 'Pridať / Add'}
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
