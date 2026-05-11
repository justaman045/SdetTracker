import { useState, useMemo, useCallback } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  Shuffle,
  Eye,
  EyeOff,
  MessageSquare,
} from 'lucide-react';
import { INTERVIEW_QUESTIONS } from '../data/questions';

const CATEGORIES = [...new Set(INTERVIEW_QUESTIONS.map((q) => q.category))];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const DIFF_COLORS = {
  Easy: 'bg-green-900/40 text-green-300 border-green-800/50',
  Medium: 'bg-yellow-900/40 text-yellow-300 border-yellow-800/50',
  Hard: 'bg-red-900/40 text-red-300 border-red-800/50',
};

export default function InterviewPrep({ questionData, updateQuestion, addToast }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const [practiceMode, setPracticeMode] = useState(false);
  const [randomQ, setRandomQ] = useState(null);

  const filtered = useMemo(() => {
    return INTERVIEW_QUESTIONS.filter((q) => {
      if (catFilter && q.category !== catFilter) return false;
      if (diffFilter && q.difficulty !== diffFilter) return false;
      if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, catFilter, diffFilter]);

  const practisedCount = INTERVIEW_QUESTIONS.filter(
    (q) => questionData[q.id]?.practiced
  ).length;

  const handleRandom = useCallback(() => {
    const unpracticed = INTERVIEW_QUESTIONS.filter((q) => !questionData[q.id]?.practiced);
    const pool = unpracticed.length > 0 ? unpracticed : INTERVIEW_QUESTIONS;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setRandomQ(pick);
  }, [questionData]);

  const togglePracticed = useCallback(
    (id) => {
      const current = questionData[id]?.practiced ?? false;
      updateQuestion(id, { practiced: !current });
      addToast({ message: !current ? 'Marked as practiced' : 'Unmarked', type: 'success' });
    },
    [questionData, updateQuestion, addToast]
  );

  const updateNotes = useCallback(
    (id, myNotes) => {
      updateQuestion(id, { myNotes });
    },
    [updateQuestion]
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Interview Prep</h1>
        <p className="text-gray-400 text-sm mt-1">
          {practisedCount}/{INTERVIEW_QUESTIONS.length} questions practiced
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleRandom}
          className="flex items-center gap-2 px-3 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-smooth"
        >
          <Shuffle className="w-4 h-4" />
          Random Q
        </button>
        <button
          onClick={() => setPracticeMode((v) => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-smooth ${
            practiceMode
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {practiceMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {practiceMode ? 'Hide Answers' : 'Practice Mode'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-500 self-center">Category:</span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCatFilter((c) => (c === cat ? '' : cat))}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-smooth ${
              catFilter === cat
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="text-xs text-gray-500 self-center ml-2">Difficulty:</span>
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => setDiffFilter((c) => (c === d ? '' : d))}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-smooth ${
              diffFilter === d
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {d}
          </button>
        ))}
        {(catFilter || diffFilter) && (
          <button
            onClick={() => { setCatFilter(''); setDiffFilter(''); }}
            className="text-xs text-blue-400 hover:text-blue-300 self-center"
          >
            Clear
          </button>
        )}
      </div>

      {/* Random question modal */}
      {randomQ && (
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" onClick={() => setRandomQ(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium border ${DIFF_COLORS[randomQ.difficulty]}`}>
                  {randomQ.difficulty}
                </span>
                <button onClick={() => setRandomQ(null)} className="text-gray-500 hover:text-white text-sm">✕ Close</button>
              </div>
              <h3 className="text-white font-semibold mb-4">{randomQ.question}</h3>
              <QuestionAnswer answer={randomQ.answer} forceReveal />
              <button
                onClick={() => { togglePracticed(randomQ.id); setRandomQ(null); }}
                className="mt-4 w-full py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-smooth"
              >
                Mark as Practiced
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Practice Progress</span>
          <span className="text-sm text-gray-400">{practisedCount}/{INTERVIEW_QUESTIONS.length}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${(practisedCount / INTERVIEW_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions grouped by category */}
      {CATEGORIES.filter((cat) => !catFilter || cat === catFilter).map((cat) => {
        const qs = filtered.filter((q) => q.category === cat);
        if (qs.length === 0) return null;
        return (
          <div key={cat}>
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              {cat}
              <span className="text-gray-500 text-sm font-normal">({qs.length})</span>
            </h2>
            <div className="space-y-3">
              {qs.map((q) => (
                <QuestionCard
                  key={q.id}
                  q={q}
                  data={questionData[q.id] || {}}
                  practiceMode={practiceMode}
                  onTogglePracticed={togglePracticed}
                  onUpdateNotes={updateNotes}
                />
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-600">No questions match your filters.</div>
      )}
    </div>
  );
}

function QuestionCard({ q, data, practiceMode, onTogglePracticed, onUpdateNotes }) {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className={`bg-gray-900 border rounded-xl overflow-hidden transition-smooth ${
        data.practiced ? 'border-green-800/50' : 'border-gray-800'
      }`}
    >
      {/* Question header */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-800/40 transition-smooth"
        onClick={() => { setOpen((v) => !v); setRevealed(false); }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePracticed(q.id); }}
          className="mt-0.5 flex-shrink-0"
        >
          {data.practiced ? (
            <CheckSquare className="w-4 h-4 text-green-400" />
          ) : (
            <Square className="w-4 h-4 text-gray-600" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-gray-200 text-sm leading-snug">{q.question}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${DIFF_COLORS[q.difficulty]}`}>
              {q.difficulty}
            </span>
            <span className="text-xs text-gray-600">{q.category}</span>
            {data.practiced && (
              <span className="text-xs text-green-600">✓ Practiced</span>
            )}
          </div>
        </div>

        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
        )}
      </div>

      {open && (
        <div className="border-t border-gray-800 p-4 space-y-4">
          {/* Answer area */}
          {practiceMode && !revealed ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm mb-3">Think about your answer first...</p>
              <button
                onClick={() => setRevealed(true)}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-sm transition-smooth"
              >
                Reveal Answer
              </button>
            </div>
          ) : (
            <QuestionAnswer answer={q.answer} />
          )}

          {/* Personal notes */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">My Notes / Personal Answer</label>
            <textarea
              value={data.myNotes || ''}
              onChange={(e) => onUpdateNotes(q.id, e.target.value)}
              placeholder="Write your own version of the answer, personal experiences, additions..."
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <button
            onClick={() => onTogglePracticed(q.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
              data.practiced
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-green-700 hover:bg-green-600 text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            {data.practiced ? 'Unmark Practiced' : 'Mark as Practiced'}
          </button>
        </div>
      )}
    </div>
  );
}

function QuestionAnswer({ answer, forceReveal }) {
  // Render simple markdown subset
  const lines = answer.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      const langMatch = line.match(/^```(\w*)/);
      const lang = langMatch ? langMatch[1] : '';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} className="bg-gray-800 rounded-lg p-3 overflow-x-auto text-xs text-green-300 font-mono whitespace-pre my-2">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <p key={i} className="font-bold text-white text-sm my-1">
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={i} className="text-gray-300 text-sm ml-4 list-disc">{renderInline(line.slice(2))}</li>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-gray-300 text-sm leading-relaxed">{renderInline(line)}</p>
      );
    }
    i++;
  }

  return <div className="space-y-0.5 markdown-answer">{elements}</div>;
}

function renderInline(text) {
  // Split on **bold** and `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-gray-700 text-emerald-300 px-1 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}
