import { useState, useMemo, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  RefreshCw,
  Star,
  Tag,
  SlidersHorizontal,
  Search,
} from 'lucide-react';
import { PHASES, TOPICS_BY_PHASE } from '../data/topics';
import { getTodayString } from '../utils/helpers';

const STATUS_OPTS = ['Not Started', 'In Progress', 'Done', 'To Revisit'];
const DIFF_OPTS = ['Beginner', 'Intermediate', 'Advanced'];
const CAT_OPTS = ['concept', 'hands-on', 'interview-fav', 'tool'];

const STATUS_COLORS = {
  'Not Started': 'text-gray-500',
  'In Progress': 'text-yellow-400',
  Done: 'text-green-400',
  'To Revisit': 'text-red-400',
};

const STATUS_BG = {
  'Not Started': 'bg-gray-800 border-gray-700',
  'In Progress': 'bg-yellow-900/20 border-yellow-800/40',
  Done: 'bg-green-900/20 border-green-800/40',
  'To Revisit': 'bg-red-900/20 border-red-800/40',
};

const DIFF_COLORS = {
  Beginner: 'bg-green-900/40 text-green-300',
  Intermediate: 'bg-blue-900/40 text-blue-300',
  Advanced: 'bg-red-900/40 text-red-300',
};

const CAT_COLORS = {
  concept: 'bg-purple-900/40 text-purple-300',
  'hands-on': 'bg-orange-900/40 text-orange-300',
  'interview-fav': 'bg-yellow-900/40 text-yellow-300',
  tool: 'bg-teal-900/40 text-teal-300',
};

const STATUS_ICONS = {
  'Not Started': <Circle className="w-4 h-4" />,
  'In Progress': <Clock className="w-4 h-4" />,
  Done: <CheckCircle2 className="w-4 h-4" />,
  'To Revisit': <RefreshCw className="w-4 h-4" />,
};

export default function Roadmap({ topicData, updateTopic, addToast }) {
  const [openPhases, setOpenPhases] = useState({ 1: true });
  const [filterDiff, setFilterDiff] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const togglePhase = useCallback((id) => {
    setOpenPhases((p) => ({ ...p, [id]: !p[id] }));
  }, []);

  const setStatus = useCallback(
    (topicId, status) => {
      updateTopic(topicId, { status, lastUpdated: getTodayString() });
      addToast({ message: `Marked as ${status}`, type: 'success' });
    },
    [updateTopic, addToast]
  );

  const toggleInterviewReviewed = useCallback(
    (topicId, current) => {
      updateTopic(topicId, { interviewReviewed: !current });
      addToast({
        message: !current ? 'Marked as interview reviewed' : 'Unmarked',
        type: 'info',
      });
    },
    [updateTopic, addToast]
  );

  const updateNote = useCallback(
    (topicId, notes) => {
      updateTopic(topicId, { notes });
    },
    [updateTopic]
  );

  const filteredPhases = useMemo(() => {
    return PHASES.map((phase) => {
      const topics = (TOPICS_BY_PHASE[phase.id] || []).filter((t) => {
        const d = topicData[t.id] || {};
        if (filterDiff && t.difficulty !== filterDiff) return false;
        if (filterCat && t.category !== filterCat) return false;
        if (filterStatus && (d.status || 'Not Started') !== filterStatus) return false;
        if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      });
      const all = TOPICS_BY_PHASE[phase.id] || [];
      const done = all.filter((t) => topicData[t.id]?.status === 'Done').length;
      return { ...phase, topics, total: all.length, done };
    });
  }, [topicData, filterDiff, filterCat, filterStatus, search]);

  const hasFilter = filterDiff || filterCat || filterStatus || search;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Roadmap</h1>
          <p className="text-gray-400 text-sm mt-1">9 phases · Track every topic</p>
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-smooth ${
            hasFilter
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters {hasFilter && '•'}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterGroup
              label="Difficulty"
              options={DIFF_OPTS}
              selected={filterDiff}
              onSelect={(v) => setFilterDiff((c) => (c === v ? '' : v))}
            />
            <FilterGroup
              label="Category"
              options={CAT_OPTS}
              selected={filterCat}
              onSelect={(v) => setFilterCat((c) => (c === v ? '' : v))}
            />
            <FilterGroup
              label="Status"
              options={STATUS_OPTS}
              selected={filterStatus}
              onSelect={(v) => setFilterStatus((c) => (c === v ? '' : v))}
            />
          </div>
          {hasFilter && (
            <button
              onClick={() => { setFilterDiff(''); setFilterCat(''); setFilterStatus(''); setSearch(''); }}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Phases */}
      {filteredPhases.map((phase) => (
        <PhaseSection
          key={phase.id}
          phase={phase}
          open={!!openPhases[phase.id]}
          onToggle={() => togglePhase(phase.id)}
          topicData={topicData}
          onSetStatus={setStatus}
          onToggleReviewed={toggleInterviewReviewed}
          onUpdateNote={updateNote}
        />
      ))}
    </div>
  );
}

function FilterGroup({ options, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-smooth ${
            selected === opt
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function PhaseSection({ phase, open, onToggle, topicData, onSetStatus, onToggleReviewed, onUpdateNote }) {
  const pct = phase.total > 0 ? Math.round((phase.done / phase.total) * 100) : 0;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Phase header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-smooth text-left"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: phase.color }}
        >
          {phase.id}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-semibold text-sm">{phase.name}</span>
            <span className="text-gray-500 text-xs">{phase.month}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: phase.color }}
              />
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {phase.done}/{phase.total}
            </span>
          </div>
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
        )}
      </button>

      {/* Topics */}
      {open && (
        <div className="border-t border-gray-800 divide-y divide-gray-800/50">
          {phase.topics.length === 0 ? (
            <div className="p-4 text-center text-gray-600 text-sm">
              No topics match current filters.
            </div>
          ) : (
            phase.topics.map((topic) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                data={topicData[topic.id] || {}}
                onSetStatus={onSetStatus}
                onToggleReviewed={onToggleReviewed}
                onUpdateNote={onUpdateNote}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TopicRow({ topic, data, onSetStatus, onToggleReviewed, onUpdateNote }) {
  const [expanded, setExpanded] = useState(false);
  const status = data.status || 'Not Started';

  return (
    <div className={`border-l-2 transition-smooth ${STATUS_BG[status]}`}
      style={{ borderLeftColor: status === 'Done' ? '#22c55e' : status === 'In Progress' ? '#eab308' : status === 'To Revisit' ? '#ef4444' : '#374151' }}
    >
      <div
        className="flex items-start gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Status icon */}
        <div className={`mt-0.5 flex-shrink-0 ${STATUS_COLORS[status]}`}>
          {STATUS_ICONS[status]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-200 leading-snug">{topic.name}</div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${DIFF_COLORS[topic.difficulty]}`}>
              {topic.difficulty}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CAT_COLORS[topic.category]}`}>
              <Tag className="w-2.5 h-2.5 inline mr-0.5" />
              {topic.category}
            </span>
            {data.interviewReviewed && (
              <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-yellow-900/40 text-yellow-300">
                <Star className="w-2.5 h-2.5 inline mr-0.5" />
                Interview ✓
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3" onClick={(e) => e.stopPropagation()}>
          {/* Status selector */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Status</label>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTS.map((s) => (
                <button
                  key={s}
                  onClick={() => onSetStatus(topic.id, s)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-smooth ${
                    status === s
                      ? s === 'Done'
                        ? 'bg-green-700 border-green-600 text-white'
                        : s === 'In Progress'
                        ? 'bg-yellow-700 border-yellow-600 text-white'
                        : s === 'To Revisit'
                        ? 'bg-red-700 border-red-600 text-white'
                        : 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {STATUS_ICONS[s]}
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Interview reviewed */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!data.interviewReviewed}
              onChange={() => onToggleReviewed(topic.id, data.interviewReviewed)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500"
            />
            <span className="text-xs text-gray-400">Mark as Interview Reviewed</span>
            <Star className="w-3.5 h-3.5 text-yellow-500" />
          </label>

          {/* Notes */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Notes</label>
            <textarea
              value={data.notes || ''}
              onChange={(e) => onUpdateNote(topic.id, e.target.value)}
              placeholder="Add notes for this topic..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
