import { useState } from 'react';
import { Code2, Chrome, CheckCircle2, Map, MessageSquare, BookOpen, CalendarDays } from 'lucide-react';

const FEATURES = [
  { icon: Map, text: '327 topics across 9 phases — Core Java to System Design' },
  { icon: MessageSquare, text: '28 curated interview Q&As with detailed answers' },
  { icon: BookOpen, text: 'Per-topic notes with Markdown preview' },
  { icon: CalendarDays, text: 'Daily log, streak tracker, and study heatmap' },
  { icon: CheckCircle2, text: 'Your data synced to the cloud — access anywhere' },
];

export default function Login({ onSignIn }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await onSignIn();
    } catch (err) {
      // popup_closed_by_user is not a real error
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError('Sign-in failed. Please try again.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-0 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">

        {/* Left — branding */}
        <div className="p-8 lg:p-10 bg-gradient-to-br from-blue-900/40 via-gray-900 to-purple-900/30 border-r border-gray-800 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-white">SDET Learning Tracker</div>
              <div className="text-xs text-gray-500">Your complete interview prep system</div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
            Go from SDET to<br />
            <span className="text-blue-400">Senior SDET</span>
          </h1>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            A structured 9-month roadmap covering everything interviewers
            ask — Java, Selenium, API Testing, Appium, Framework Design,
            SQL, and more.
          </p>

          <ul className="space-y-3 flex-1">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-gray-300 text-sm">{text}</span>
              </li>
            ))}
          </ul>

          {/* Phase color strip */}
          <div className="flex gap-1 mt-8">
            {['#22c55e','#3b82f6','#a855f7','#f59e0b','#10b981','#f97316','#ec4899','#6b7280','#14b8a6'].map((c) => (
              <div key={c} className="flex-1 h-1.5 rounded-full opacity-70" style={{ backgroundColor: c }} />
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-1.5">9 phases · Core Java → System Design</p>
        </div>

        {/* Right — sign in */}
        <div className="p-8 lg:p-10 flex flex-col justify-center">
          <h2 className="text-xl font-bold text-white mb-2">Sign in to continue</h2>
          <p className="text-gray-400 text-sm mb-8">
            Your progress is saved to your account and syncs across all your devices.
          </p>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-smooth disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {error && (
            <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
          )}

          <div className="mt-8 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-600 text-center leading-relaxed">
              By signing in you agree to store your study progress in Firebase.
              No email or data is shared with third parties.
            </p>
          </div>

          {/* Stats tease */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[['327', 'Topics'], ['28', 'Interview Qs'], ['9', 'Phases']].map(([n, l]) => (
              <div key={l} className="text-center p-3 bg-gray-800 rounded-xl">
                <div className="text-lg font-bold text-white">{n}</div>
                <div className="text-xs text-gray-500">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
    </svg>
  );
}
