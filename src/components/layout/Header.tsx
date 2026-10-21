import { useState } from 'react';
import { Sun, Moon, Globe, Menu, X, Home, BookOpen, GraduationCap, Book, Landmark, Compass, BarChart3, Plus } from 'lucide-react';
import { useLanguage, useTheme } from '../../context';

interface HeaderProps {
  activeView?: string;
  onSelectView?: (view: string) => void;
}

const NAV_ITEMS = [
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

export function Header({ activeView, onSelectView }: HeaderProps = {}) {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const isDark = theme === 'dark';

  const handleNavClick = (id: string) => {
    onSelectView?.(id);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => handleNavClick('home')}
        >
          <div className="w-8 h-8 rounded-lg bg-sakura-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            日
          </div>
          <div>
            <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">
              日本語
            </span>
            <span className="text-xs text-sakura-600 dark:text-sakura-400 font-medium ml-1.5 hidden sm:inline">
              Japanese Learning
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'sk' ? 'en' : 'sk')}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
            aria-label="Switch language"
            title={language === 'sk' ? 'Prepni na angličtinu / Switch to English' : 'Prepni na slovenčinu / Switch to Slovak'}
          >
            <Globe className="w-4 h-4 text-sakura-600 dark:text-sakura-400" />
            <span>{language.toUpperCase()}</span>
          </button>
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
            aria-label={isDark ? 'Svetlý režim / Light mode' : 'Tmavý režim / Dark mode'}
            title={isDark ? 'Svetlý režim / Light mode' : 'Tmavý režim / Dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
          {onSelectView && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden border border-gray-200 dark:border-gray-700"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {menuOpen && onSelectView && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/98 dark:bg-gray-900/98 px-3 py-3 shadow-lg">
          <div className="grid grid-cols-2 gap-1.5">
            {NAV_ITEMS.map((item) => {
              const active = activeView === item.id;
              const label = language === 'sk' ? item.labelSk : item.labelEn;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                    active
                      ? 'bg-sakura-100 dark:bg-sakura-900/40 text-sakura-700 dark:text-sakura-400 font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

