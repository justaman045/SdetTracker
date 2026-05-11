import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import OnboardingModal from './components/OnboardingModal';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import InterviewPrep from './pages/InterviewPrep';
import Notes from './pages/Notes';
import DailyLog from './pages/DailyLog';
import Login from './pages/Login';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useFirestoreData } from './hooks/useFirestoreData';
import { AuthProvider, useAuth } from './context/AuthContext';

let toastId = 0;

// ── Inner app — only rendered when user is signed in ─────────────────────────
function AppInner({ user, onSignOut }) {
  const [darkMode, setDarkMode] = useLocalStorage('sdet_dark', true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const {
    loading,
    error,
    settings,
    setSettings,
    topicData,
    updateTopic,
    questionData,
    updateQuestion,
    dailyLogs,
    addLog,
    notesData,
    updateNotesData,
  } = useFirestoreData(user.uid);

  const addToast = useCallback((toast) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleAddLog = useCallback(
    (log) => {
      addLog(log);
      addToast({ message: "Today's log saved!", type: 'success' });
    },
    [addLog, addToast]
  );

  if (loading) return <LoadingScreen message="Loading your data…" />;
  if (error) return <FirestoreError error={error} onSignOut={onSignOut} />;

  const sharedProps = { topicData, updateTopic, dailyLogs, settings, addToast };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-950 text-gray-100 flex">
        {/* Onboarding — shown when no settings yet */}
        {!settings && (
          <OnboardingModal onComplete={setSettings} />
        )}

        <Sidebar
          darkMode={darkMode}
          toggleDark={() => setDarkMode((d) => !d)}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          onSignOut={onSignOut}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile header */}
          <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-semibold text-white text-sm">SDET Tracker</span>
            {user.photoURL && (
              <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full ml-auto" />
            )}
          </header>

          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard {...sharedProps} />} />
              <Route
                path="/roadmap"
                element={<Roadmap topicData={topicData} updateTopic={updateTopic} addToast={addToast} />}
              />
              <Route
                path="/interview"
                element={<InterviewPrep questionData={questionData} updateQuestion={updateQuestion} addToast={addToast} />}
              />
              <Route
                path="/notes"
                element={<Notes topicData={topicData} updateTopic={updateTopic} notesData={notesData} updateNotes={updateNotesData} />}
              />
              <Route
                path="/daily-log"
                element={<DailyLog dailyLogs={dailyLogs} addLog={handleAddLog} topicData={topicData} />}
              />
            </Routes>
          </main>
        </div>

        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </div>
  );
}

// ── Firestore error screen ────────────────────────────────────────────────────
function FirestoreError({ error, onSignOut }) {
  const isRules = error === 'firestore-rules';
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-gray-900 border border-red-900/50 rounded-2xl p-8">
        <div className="w-12 h-12 bg-red-900/40 rounded-xl flex items-center justify-center mb-5">
          <span className="text-red-400 text-2xl">⚠</span>
        </div>
        <h1 className="text-white font-bold text-xl mb-2">
          {isRules ? 'Firestore rules not configured' : 'Failed to load data'}
        </h1>
        {isRules ? (
          <>
            <p className="text-gray-400 text-sm mb-5 leading-relaxed">
              The Firebase project <code className="text-blue-400 bg-gray-800 px-1 rounded">north-job-tracker</code> doesn't
              have Firestore rules for this app's data path yet. Add the rule below in the Firebase console — it won't
              affect your other project's data.
            </p>
            <div className="bg-gray-950 border border-gray-700 rounded-xl p-4 mb-5 font-mono text-xs text-green-300 leading-relaxed overflow-x-auto">
              <div className="text-gray-500 mb-2">{'// Firebase Console → Firestore → Rules'}</div>
              <div className="text-gray-500 mb-2">{'// ADD this block inside your existing rules:'}</div>
              {`match /users/{userId}/data/{document} {
  allow read, write: if request.auth != null
    && request.auth.uid == userId;
}`}
            </div>
            <ol className="text-sm text-gray-400 space-y-1.5 mb-6 list-decimal list-inside">
              <li>Go to <span className="text-blue-400">console.firebase.google.com</span></li>
              <li>Open project <span className="text-white font-medium">north-job-tracker</span></li>
              <li>Firestore Database → <span className="text-white font-medium">Rules</span> tab</li>
              <li>Paste the block above inside the existing <code className="bg-gray-800 px-1 rounded">service cloud.firestore</code> block</li>
              <li>Click <span className="text-white font-medium">Publish</span>, then refresh this page</li>
            </ol>
          </>
        ) : (
          <p className="text-gray-400 text-sm mb-6">
            Could not load your data from Firestore. Check your internet connection and refresh.
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all"
          >
            Refresh page
          </button>
          <button
            onClick={onSignOut}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-all"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Auth gate — decides what to render ───────────────────────────────────────
function AuthGate() {
  const { user, signInWithGoogle, signOut } = useAuth();

  // Still resolving Firebase auth state
  if (user === undefined) return <LoadingScreen message="Checking sign-in status…" />;

  // Not signed in
  if (user === null) return <Login onSignIn={signInWithGoogle} />;

  // Signed in
  return <AppInner user={user} onSignOut={signOut} />;
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </BrowserRouter>
  );
}
