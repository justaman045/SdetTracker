import { useState, useMemo, useCallback } from 'react';
import {
  Flame,
  Clock,
  Star,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Trophy,
} from 'lucide-react';
import { ALL_TOPICS, PHASES, TOPICS_BY_PHASE } from '../data/topics';
import { getTodayString, calcStreak, calcLongestStreak, formatDate } from '../utils/helpers';

const HOURS_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];

export default function DailyLog({ dailyLogs, addLog, topicData }) {
  const today = getTodayString();
  const todayLog = dailyLogs.find((l) => l.date === today);

  const [selectedTopics, setSelectedTopics] = useState(todayLog?.topics || []);
  const [hours, setHours] = useState(todayLog?.hours || 1);
  const [confidence, setConfidence] = useState(todayLog?.confidence || 3);
  const [blockers, setBlockers] = useState(todayLog?.blockers || '');
  const [submitted, setSubmitted] = useState(!!todayLog);

  const streak = useMemo(() => calcStreak(dailyLogs), [dailyLogs]);
  const longestStreak = useMemo(() => calcLongestStreak(dailyLogs), [dailyLogs]);
  const totalHours = useMemo(
    () => dailyLogs.reduce((acc, l) => acc + (l.hours || 0), 0),
    [dailyLogs]
  );

  const toggleTopic = useCallback((id) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      addLog({
        date: today,
        topics: selectedTopics,
        hours,
        confidence,
        blockers,
      });
      setSubmitted(true);
    },
    [today, selectedTopics, hours, confidence, blockers, addLog]
  );

  const calendarData = useMemo(() => {
    const map = {};
    for (const log of dailyLogs) map[log.date] = log;
    return map;
  }, [dailyLogs]);

  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const totals = Array(7).fill(0);
    for (const log of dailyLogs) {
      const d = new Date(log.date + 'T00:00:00');
      const dow = d.getDay();
      totals[dow] += log.hours || 0;
    }
    return days.map((d, i) => ({ day: d, hours: totals[i] }));
  }, [dailyLogs]);

  const last10 = useMemo(
    () => [...dailyLogs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10),
    [dailyLogs]
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Daily Log</h1>
        <p className="text-gray-400 text-sm mt-1">
          {formatDate(today)} · Track what you studied today
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Flame className="w-5 h-5 text-orange-400" />} label="Current Streak" value={`${streak} days`} />
        <StatCard icon={<Trophy className="w-5 h-5 text-yellow-400" />} label="Longest Streak" value={`${longestStreak} days`} />
        <StatCard icon={<Clock className="w-5 h-5 text-blue-400" />} label="Total Hours" value={`${totalHours.toFixed(1)}h`} />
        <StatCard icon={<CalendarDays className="w-5 h-5 text-green-400" />} label="Days Logged" value={dailyLogs.length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily log form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-400" />
            {submitted ? "Today's Log" : "Log Today's Study"}
          </h2>

          {submitted && (
            <div className="mb-4 flex items-center justify-between">
              <span className="text-green-400 text-sm">✓ Logged for today</span>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Edit
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Topics */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block">What did you study?</label>
              <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-700 rounded-lg p-2 bg-gray-800">
                {PHASES.map((phase) => (
                  <PhaseTopicGroup
                    key={phase.id}
                    phase={phase}
                    selectedTopics={selectedTopics}
                    onToggle={toggleTopic}
                    disabled={submitted}
                  />
                ))}
              </div>
              {selectedTopics.length > 0 && (
                <p className="text-xs text-blue-400 mt-1">{selectedTopics.length} topic(s) selected</p>
              )}
            </div>

            {/* Hours */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Hours studied</label>
              <div className="flex flex-wrap gap-2">
                {HOURS_OPTIONS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    disabled={submitted}
                    onClick={() => setHours(h)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-smooth ${
                      hours === h
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white disabled:opacity-50'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence */}
            <div>
              <label className="text-xs text-gray-500 mb-2 block">Confidence level</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={submitted}
                    onClick={() => setConfidence(s)}
                    className="focus:outline-none disabled:opacity-50"
                  >
                    <Star
                      className={`w-6 h-6 transition-smooth ${
                        s <= confidence ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs text-gray-500 self-center ml-1">{confidence}/5</span>
              </div>
            </div>

            {/* Blockers */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Any blockers?</label>
              <textarea
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                disabled={submitted}
                placeholder="Anything you got stuck on, or plan to revisit..."
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
              />
            </div>

            {!submitted && (
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm transition-smooth"
              >
                Save Today's Log
              </button>
            )}
          </form>
        </div>

        {/* Weekly chart + Heatmap */}
        <div className="space-y-4">
          {/* Weekly bar chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Hours by Day of Week
            </h2>
            <div className="flex items-end gap-2 h-24">
              {weeklyData.map(({ day, hours: h }) => {
                const maxH = Math.max(...weeklyData.map((d) => d.hours), 1);
                const heightPct = (h / maxH) * 100;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs text-gray-500">{h > 0 ? h.toFixed(0) : ''}</div>
                    <div className="w-full bg-gray-800 rounded-sm overflow-hidden" style={{ height: '64px' }}>
                      <div
                        className="w-full bg-blue-600 rounded-sm transition-all duration-500"
                        style={{ height: `${heightPct}%`, marginTop: `${100 - heightPct}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">{day}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar heatmap */}
          <CalendarHeatmap calendarData={calendarData} />
        </div>
      </div>

      {/* Last 10 entries */}
      {last10.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4">Recent Entries</h2>
          <div className="space-y-2">
            {last10.map((log) => (
              <LogEntry key={log.date} log={log} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-gray-500 text-xs mt-0.5">{label}</div>
    </div>
  );
}

function PhaseTopicGroup({ phase, selectedTopics, onToggle, disabled }) {
  const [open, setOpen] = useState(false);
  const topics = TOPICS_BY_PHASE[phase.id] || [];
  const selectedCount = topics.filter((t) => selectedTopics.includes(t.id)).length;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 py-1 px-1 text-xs text-gray-400 hover:text-white rounded"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <span style={{ color: phase.color }}>Phase {phase.id}</span>
        <span className="flex-1 text-left truncate">{phase.name}</span>
        {selectedCount > 0 && (
          <span className="text-blue-400 text-xs">{selectedCount}</span>
        )}
      </button>
      {open && (
        <div className="ml-4 space-y-0.5">
          {topics.map((t) => (
            <label
              key={t.id}
              className="flex items-center gap-2 py-0.5 px-1 rounded cursor-pointer hover:bg-gray-700/40"
            >
              <input
                type="checkbox"
                checked={selectedTopics.includes(t.id)}
                onChange={() => onToggle(t.id)}
                disabled={disabled}
                className="w-3.5 h-3.5 rounded border-gray-600 bg-gray-700 text-blue-500"
              />
              <span className="text-xs text-gray-400">{t.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function CalendarHeatmap({ calendarData }) {
  const today = new Date();
  const weeks = 14;
  const cells = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const weekCells = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (w * 7 + (today.getDay() - d + 7) % 7));
      const key = date.toISOString().split('T')[0];
      const log = calendarData[key];
      const h = log?.hours || 0;
      let intensity = 'bg-gray-800';
      if (h > 0 && h <= 0.5) intensity = 'bg-green-900';
      else if (h > 0.5 && h <= 1.5) intensity = 'bg-green-700';
      else if (h > 1.5 && h <= 2.5) intensity = 'bg-green-500';
      else if (h > 2.5) intensity = 'bg-green-400';
      weekCells.push(
        <div
          key={key}
          title={`${key}: ${h}h studied`}
          className={`w-3.5 h-3.5 rounded-sm ${intensity} transition-smooth`}
        />
      );
    }
    cells.push(
      <div key={w} className="flex flex-col gap-1">
        {weekCells}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="text-white font-semibold mb-4">Study Heatmap</h2>
      <div className="flex gap-1 overflow-x-auto">{cells}</div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-gray-600">Less</span>
        {['bg-gray-800', 'bg-green-900', 'bg-green-700', 'bg-green-500', 'bg-green-400'].map((c, i) => (
          <div key={i} className={`w-3.5 h-3.5 rounded-sm ${c}`} />
        ))}
        <span className="text-xs text-gray-600">More</span>
      </div>
    </div>
  );
}

function LogEntry({ log }) {
  const [open, setOpen] = useState(false);
  const topicNames = log.topics
    ? log.topics.map((id) => {
        const t = ALL_TOPICS.find((t) => t.id === id);
        return t ? t.name : id;
      })
    : [];

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800/50 transition-smooth text-left"
      >
        <span className="text-gray-400 text-sm">{formatDate(log.date)}</span>
        <span className="text-gray-600 text-sm">·</span>
        <span className="text-sm text-gray-300">{log.hours}h</span>
        <div className="flex gap-0.5 ml-1">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className={`w-3 h-3 ${s <= log.confidence ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
          ))}
        </div>
        <span className="text-xs text-gray-600 flex-1">{topicNames.length} topic(s)</span>
        {open ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
      </button>
      {open && (
        <div className="px-4 pb-3 border-t border-gray-800 space-y-2 pt-2">
          {topicNames.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Topics:</p>
              <div className="flex flex-wrap gap-1">
                {topicNames.map((n, i) => (
                  <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}
          {log.blockers && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Blockers:</p>
              <p className="text-xs text-gray-400">{log.blockers}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
