import { useLanguage } from '../../context';
import { Home, BookOpen, GraduationCap, Book, Landmark, Compass, BarChart3, Plus } from 'lucide-react';

type NavItem = {
  id: string;
  labelSk: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV: NavItem[] = [
  { id: 'home', labelSk: 'Domov', labelEn: 'Home', icon: Home },
  { id: 'vocabulary', labelSk: 'Slovíčka', labelEn: 'Vocabulary', icon: BookOpen },
  { id: 'flashcards', labelSk: 'Kartičky', labelEn: 'Flashcards', icon: Book },
  { id: 'grammar', labelSk: 'Gramatika', labelEn: 'Grammar', icon: GraduationCap },
  { id: 'alphabet', labelSk: 'Abeceda', labelEn: 'Alphabet', icon: Landmark },
  { id: 'kanji', labelSk: 'Kanji', labelEn: 'Kanji', icon: Compass },
  { id: 'exam', labelSk: 'Test', labelEn: 'Exam', icon: BookOpen },
  { id: 'study', labelSk: 'Štúdium', labelEn: 'Study', icon: GraduationCap },
  { id: 'progress', labelSk: 'Pokrok', labelEn: 'Progress', icon: BarChart3 },
  { id: 'add-data', labelSk: 'Pridať', labelEn: 'Add Data', icon: Plus },
];

interface NavigationProps {
  active: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function Navigation({ active, onSelect, className = '' }: NavigationProps) {
  const { language } = useLanguage();

  return (
    <nav className={`flex flex-col gap-1 p-3 ${className}`}>
      {NAV.map((item) => {
        const activeItem = active === item.id;
        const label = language === 'sk' ? item.labelSk : item.labelEn;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
              activeItem
                ? 'bg-sakura-100 dark:bg-sakura-900/40 text-sakura-700 dark:text-sakura-400 font-semibold shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function BottomNav({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  const { language } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md md:hidden">
      <div className="flex items-center overflow-x-auto px-2 py-1.5 gap-1 scrollbar-none">
        {NAV.map((item) => {
          const activeItem = active === item.id;
          const label = language === 'sk' ? item.labelSk : item.labelEn;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`flex flex-col items-center justify-center shrink-0 min-w-[4.25rem] py-1 px-2 rounded-xl text-[11px] font-medium transition-colors ${
                activeItem
                  ? 'bg-sakura-100 dark:bg-sakura-900/40 text-sakura-700 dark:text-sakura-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <item.icon className={`w-4 h-4 mb-0.5 ${activeItem ? '' : 'opacity-75'}`} />
              <span className="truncate max-w-full">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

