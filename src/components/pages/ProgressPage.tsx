import { useLanguage } from '../../context';
import { getWords, getExamHistory } from '../../storage';
import { BarChart3, BookOpen, Check, Clock, Award } from 'lucide-react';

export function ProgressPage() {
  const { language } = useLanguage();
  const words = getWords();
  const history = getExamHistory();

  const totalWords = words.length;
  const learnedWords = words.filter((w) => w.timesCorrect > 0 && w.timesWrong === 0).length;
  const reviewingWords = words.filter(
    (w) => w.nextReview && new Date(w.nextReview) <= new Date()
  ).length;
  const totalCorrect = words.reduce((sum, w) => sum + w.timesCorrect, 0);
  const totalWrong = words.reduce((sum, w) => sum + w.timesWrong, 0);
  const totalExams = history.length;
  const avgScore = totalExams > 0 ? Math.round((history.reduce((s, r) => s + r.score, 0) / (totalExams * (history[0]?.total || 1))) * 100) : 0;

  const stats = [
    { label: language === 'sk' ? 'Celkom slovíčok' : 'Total words', value: totalWords, icon: BookOpen },
    { label: language === 'sk' ? 'Naučené' : 'Learned', value: learnedWords, icon: Check },
    { label: language === 'sk' ? 'Na opakovanie' : 'Due review', value: reviewingWords, icon: Clock },
    { label: language === 'sk' ? 'Testov absolvovaných' : 'Exams taken', value: totalExams, icon: BarChart3 },
    { label: language === 'sk' ? 'Priemerná úspešnosť' : 'Avg Score', value: `${avgScore}%`, icon: Award },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-sakura-600 dark:text-sakura-400" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {language === 'sk' ? 'Pokrok' : 'Progress'}
          </h1>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {language === 'sk' ? 'Vaše štatistiky učenia.' : 'Your learning statistics.'}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sakura-100 dark:bg-sakura-900/30 text-sakura-600 dark:text-sakura-400">
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{s.value}</span>
            </div>
            <div className="text-gray-900 dark:text-white text-sm font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
          {language === 'sk' ? 'Celkové skóre' : 'Overall score'}
        </h2>
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {language === 'sk' ? 'Správne' : 'Correct'}
          </div>
          <div className="text-xl font-mono font-bold text-gray-900 dark:text-white">{totalCorrect}</div>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-2" />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {language === 'sk' ? 'Nesprávne' : 'Wrong'}
          </div>
          <div className="text-xl font-mono font-bold text-gray-900 dark:text-white">{totalWrong}</div>
        </div>
        <div className="mt-4 h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-sakura-600"
            style={{ width: totalCorrect + totalWrong > 0 ? (totalCorrect / (totalCorrect + totalWrong)) * 100 : 0 }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
          {language === 'sk' ? 'História testov' : 'Exam history'}
        </h2>
        {history.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            {language === 'sk' ? 'Ešte žiadne testy.' : 'No exams yet.'}
          </p>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 10).map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                <div>
                  <div className="text-gray-900 dark:text-white">{r.date}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {r.wordType === 'all' ? (language === 'sk' ? 'Všetky' : 'All') : r.wordType}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-900 dark:text-white font-mono">
                    {r.score} / {r.total}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round((r.score / r.total) * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
