# 🌸 Japanese Learning App

A modern, fast, and responsive web application designed for self-study and practicing Japanese. Built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**, featuring full bilingual support (Slovak & English), dark/light themes, and seamless optimization for both desktop and mobile devices.

---

## 📖 About the Project

This application was created as an upgraded, modern re-implementation of a legacy PHP/MySQL study project. It focuses on practical conversational Japanese acquisition — all vocabulary entries include romaji (Latin reading), optional kanji notation, and translations in both **Slovak** and **English**.

### 🌟 Key Features:
* **2,000+ Words & Phrases**: Categorized by part of speech (nouns, adjectives, verbs, common phrases, and full sentences).
* **29 Thematic Categories**: At the restaurant, food, travel, animals, clothing, family, technology, human body, and more.
* **Interactive Exam**: Custom test generator with filtering by category, word type, and translation direction.
* **Flip Flashcards**: Study mode with 3D card flips for memory training by category.
* **Spaced Repetition System (SRS)**: Automatic review scheduling based on user mastery and retention intervals.
* **Verb Conjugation Generator**: Comprehensive verb forms (te-form, past, negative, `-eba` / `-tara` conditionals, potential, passive, causative, etc.).
* **Grammar Guide & Example Sentences**: Key grammar structures with explanations, formulas, and real-world examples.
* **Kana Alphabet**: Complete Hiragana and Katakana charts with Hepburn romaji pronunciation guides.
* **Kanji Database**: Curated kanji reference with Onyomi, Kunyomi readings, stroke counts, and meanings.
* **Statistics & Progress Tracking**: Historical test score tracking, success rates, and mastered vocabulary counters.
* **Bilingual Interface**: Quick one-click toggle between English and Slovak.
* **Theme Support**: Seamless light and dark mode switching with system preference detection.

---

## 🚀 Running on Desktop

### Prerequisites:
* [Node.js](https://nodejs.org/) (version 18 or later)
* `npm` package manager

### Getting Started:
1. Navigate to the project directory:
   ```bash
   cd React-JapaneseLearningApp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at:
   ```
   http://localhost:5173
   ```

### Production Build:
To build and preview the optimized production bundle:
```bash
npm run build
npm run preview
```

---

## 📱 Running on Mobile

The application is mobile-first, supporting responsive layouts, touch gestures, and a bottom navigation bar.

### Option 1: Over Local Wi-Fi
1. Ensure your computer and phone are connected to the **same Wi-Fi network**.
2. Start the dev server with the `--host` flag:
   ```bash
   npm run dev -- --host
   ```
3. Locate the local network address printed in your terminal (e.g., `http://192.168.1.50:5173/`).
4. Open that URL in your mobile browser (Chrome, Safari, Firefox).

### Option 2: Add to Home Screen (PWA Style)
You can run the application full-screen without browser address bars:
* **Android (Google Chrome):**
  1. Open the app URL in Chrome.
  2. Tap the menu icon (three dots in the upper right).
  3. Select **Add to Home screen** or **Install app**.
* **iOS (Apple Safari):**
  1. Open the app URL in Safari.
  2. Tap the **Share** button (box with an upward arrow).
  3. Select **Add to Home Screen**.

---

### In-Browser Data Synchronization:
The storage manager (`src/storage.ts`) includes a data versioning check (`DATA_VERSION`). When the application is opened, any new seed data is synced into `localStorage` while preserving your user progress, exam results, and custom entries.

---

## 📂 Project Structure

```
React-JapaneseLearningApp/
├── data/
│   └── seed.ts                  # Core dataset (vocabulary, grammar, kanji, kana, categories)
├── public/
│   └── favicon.svg
├── scripts/
│   ├── import_sql_to_seed.py    # Python migration script (MySQL dump -> seed.ts)
│   └── translations_cache.json  # Local translation cache for batch imports
├── src/
│   ├── components/
│   │   ├── layout/              # Header, navigation drawer, bottom nav
│   │   ├── pages/               # Views (Exam, Flashcards, Categories, Vocabulary, etc.)
│   │   └── ui/                  # FlipCard, SortableTable, SearchBar, Modal, WordForm
│   ├── context/                 # LanguageContext (SK/EN) and ThemeContext (Dark/Light)
│   ├── storage.ts               # LocalStorage CRUD and schema migration logic
│   ├── types.ts                 # TypeScript type definitions
│   ├── i18n.ts                  # Localization dictionary (English & Slovak)
│   ├── App.tsx                  # Root application router and layout
│   └── main.tsx                 # Application entry point
├── package.json
└── vite.config.ts
```

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 18, Vite
* **Language:** TypeScript
* **Styling:** Tailwind CSS, 3D CSS Card Flip Animations
* **Icons:** Lucide React
* **Data Migration:** Python 3 (batch parser & translation pipeline)
