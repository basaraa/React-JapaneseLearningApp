import { useLanguage } from '../../context';
import { Rocket, BookOpen, GraduationCap, Landmark, Compass, BarChart3, Plus, Book } from 'lucide-react';

type Feature = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
};

interface HomePageProps {
  onNavigate?: (id: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps = {}) {
  const { language } = useLanguage();

  const features: Feature[] = [
    {
      id: 'vocabulary',
      icon: BookOpen,
      title: language === 'sk' ? 'Slovíčka' : 'Vocabulary',
      desc: language === 'sk' ? 'Prehliadajte slovíčka podľa kategórii, triedené a s vyhľadávaním.' : 'Browse words by category, sorted and with search.',
    },
    {
      id: 'flashcards',
      icon: Book,
      title: language === 'sk' ? 'Kartičky' : 'Flashcards',
      desc: language === 'sk' ? 'Precvičujte slovíčka pomocou interaktívnych otočných kartičiek.' : 'Practice words with interactive flip cards.',
    },
    {
      id: 'grammar',
      icon: GraduationCap,
      title: language === 'sk' ? 'Gramatika' : 'Grammar',
      desc: language === 'sk' ? 'Prehliadajte gramatické pravidlá s príkladmi viet.' : 'Browse grammar rules with example sentences.',
    },
    {
      id: 'alphabet',
      icon: Landmark,
      title: language === 'sk' ? 'Kana abeceda' : 'Kana Alphabet',
      desc: language === 'sk' ? 'Hiragana a Katakana tabuľky pre rýchle precvičovanie.' : 'Hiragana and Katakana tables for quick practice.',
    },
    {
      id: 'kanji',
      icon: Compass,
      title: language === 'sk' ? 'Kanji znaky' : 'Kanji Characters',
      desc: language === 'sk' ? 'Prehliadajte kanji znaky s kunyomi, onyomi a prekladom.' : 'Browse kanji with kunyomi, onyomi and translation.',
    },
    {
      id: 'exam',
      icon: BookOpen,
      title: language === 'sk' ? 'Test' : 'Exam',
      desc: language === 'sk' ? 'Otestujte sa zo slovíčok pomocou testu s výberom odpovede.' : 'Test yourself with a multiple-choice quiz.',
    },
    {
      id: 'study',
      icon: GraduationCap,
      title: language === 'sk' ? 'Inteligentné štúdium' : 'Smart Study',
      desc: language === 'sk' ? 'Systém opakovaného učenia — slabšie slovíčka sa opakujú častejšie.' : 'Spaced repetition — weaker words repeat more often.',
    },
    {
      id: 'progress',
      icon: BarChart3,
      title: language === 'sk' ? 'Pokrok' : 'Progress',
      desc: language === 'sk' ? 'Sledujte svoje štatistiky a históriu testov.' : 'Track your stats and exam history.',
    },
    {
      id: 'add-data',
      icon: Plus,
      title: language === 'sk' ? 'Pridať dáta' : 'Add Data',
      desc: language === 'sk' ? 'Pridajte vlastné slovíčka, gramatiku, kanji alebo importujte z CSV.' : 'Add your own words, grammar, kanji or import from CSV.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-16 h-16 rounded-2xl bg-sakura-100 dark:bg-sakura-900/30 flex items-center justify-center text-sakura-600 dark:text-sakura-400 text-2xl mb-2">
          <Rocket className="w-8 h-8" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {language === 'sk' ? 'Vitajte v Japončine' : 'Welcome to Japanese Learning'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          {language === 'sk'
            ? 'Aplikácia na učenie japončiny — slovíčka, gramatika, kana, kanji, testy a sledovanie pokroku. Všetko offline, lokálne vo vašom zariadení.'
            : 'Learn Japanese — words, grammar, kana, kanji, tests and progress tracking. Everything offline, stored locally on your device.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <button
            key={f.id}
            onClick={() => onNavigate?.(f.id)}
            className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-sakura-200 dark:hover:border-sakura-800 transition-all active:scale-95"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
              f.id === 'exam' || f.id === 'study' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-sakura-100 dark:bg-sakura-900/30 text-sakura-600 dark:text-sakura-400'
            }`}>
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-sakura-600 dark:group-hover:text-sakura-400 transition-colors">
              {f.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
              {f.desc}
            </p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {language === 'sk' ? 'Rýchle spustenie' : 'Quick start'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {language === 'sk'
            ? 'Vyberte si funkciu z ponuky vyššie alebo z dolnej navigačnej lišty. Vaše dáta sa ukladajú lokálne do localStorage prehliadača.'
            : 'Pick a feature above or from the bottom navigation bar. Your data is stored locally in browser localStorage.'}
        </p>
      </div>
    </div>
  );
}
