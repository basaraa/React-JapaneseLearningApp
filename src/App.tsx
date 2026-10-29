import { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { Navigation, BottomNav } from './components/layout/Navigation';
import { HomePage } from './components/pages/HomePage';
import { VocabularyPage } from './components/pages/VocabularyPage';
import { FlashCardsPage } from './components/pages/FlashCardsPage';
import { CategoriesPage } from './components/pages/CategoriesPage';
import { GrammarPage } from './components/pages/GrammarPage';
import { AlphabetPage } from './components/pages/AlphabetPage';
import { KanjiPage } from './components/pages/KanjiPage';
import { ExamPage } from './components/pages/ExamPage';
import { StudyModePage } from './components/pages/StudyModePage';
import { VerbFormsPage } from './components/pages/VerbFormsPage';
import { ProgressPage } from './components/pages/ProgressPage';
import { AddDataPage } from './components/pages/AddDataPage';
import './App.css';

type AppView =
  | 'home'
  | 'vocabulary'
  | 'flashcards'
  | 'categories'
  | 'grammar'
  | 'alphabet'
  | 'kanji'
  | 'exam'
  | 'verb-forms'
  | 'study'
  | 'progress'
  | 'add-data';

function App() {
  const [view, setView] = useState<AppView>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const handleStartExam = (catId?: string) => {
    setSelectedCategory(catId);
    setView('exam');
  };

  const handleStartFlashcards = (catId?: string) => {
    setSelectedCategory(catId);
    setView('flashcards');
  };

  const renderPage = () => {
    switch (view) {
      case 'home': return <HomePage onNavigate={(id) => { setSelectedCategory(undefined); setView(id as AppView); }} />;
      case 'vocabulary': return <VocabularyPage />;
      case 'flashcards': return <FlashCardsPage initialCategory={selectedCategory} />;
      case 'categories': return <CategoriesPage onStartExam={handleStartExam} onStartFlashcards={handleStartFlashcards} />;
      case 'grammar': return <GrammarPage />;
      case 'alphabet': return <AlphabetPage />;
      case 'kanji': return <KanjiPage />;
      case 'exam': return <ExamPage initialCategory={selectedCategory} onResetCategory={() => setSelectedCategory(undefined)} />;
      case 'verb-forms': return <VerbFormsPage />;
      case 'study': return <StudyModePage />;
      case 'progress': return <ProgressPage />;
      case 'add-data': return <AddDataPage />;
      default: return <HomePage onNavigate={(id) => { setSelectedCategory(undefined); setView(id as AppView); }} />;
    }
  };

  return (
    <LanguageProvider>
      <ThemeProvider>
        <div className="min-h-svh bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
          <Header activeView={view} onSelectView={(id) => setView(id as AppView)} />

          <div className="flex max-w-7xl mx-auto">
            <aside className="w-56 shrink-0 hidden md:block border-r border-gray-100 dark:border-gray-800 min-h-[calc(100vh-57px)]">
              <div className="sticky top-[57px]">
                <Navigation active={view} onSelect={(id) => setView(id as AppView)} />
              </div>
            </aside>

            <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 pb-24 md:pb-8">
              {renderPage()}
            </main>
          </div>

          <BottomNav active={view} onSelect={(id) => setView(id as AppView)} />
        </div>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;


