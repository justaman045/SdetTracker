import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Flame,
  Calendar,
  TrendingUp,
  Star,
  ArrowRight,
  Trophy,
} from 'lucide-react';
import { PHASES, TOPICS_BY_PHASE, ALL_TOPICS } from '../data/topics';
import {
  formatDate,
  getDaysBetween,
  getTodayString,
  calcStreak,
  getMotivationalMessage,
} from '../utils/helpers';

export default function Dashboard({ topicData, dailyLogs, settings }) {
  const stats = useMemo(() => {
    const total = ALL_TOPICS.length;
    const completed = ALL_TOPICS.filter(
      (t) => topicData[t.id]?.status === 'Done'
    ).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const streak = calcStreak(dailyLogs);
    const daysSinceStart = settings?.startDate
      ? getDaysBetween(settings.startDate, getTodayString())
      : 0;
    return { total, completed, pct, streak, daysSinceStart };
  }, [topicData, dailyLogs, settings]);

  const phaseStats = useMemo(() =>
    PHASES.map((phase) => {
      const topics = TOPICS_BY_PHASE[phase.id] || [];
      const done = topics.filter((t) => topicData[t.id]?.status === 'Done').length;
      return { ...phase, total: topics.length, done };
    }),
  [topicData]);

  const todayTopic = useMemo(() => {
    for (const phase of PHASES) {
      const topics = TOPICS_BY_PHASE[phase.id] || [];
      const next = topics.find(
        (t) => !topicData[t.id]?.status || topicData[t.id]?.status === 'Not Started'
      );
      if (next) return { topic: next, phase };
    }
    return null;
  }, [topicData]);

  const recentActivity = useMemo(() => {
    const entries = [];
    for (const [id, data] of Object.entries(topicData)) {
      if (data.status === 'Done' && data.lastUpdated) {
        const topic = ALL_TOPICS.find((t) => t.id === id);
        if (topic) entries.push({ topic, date: data.lastUpdated });
      }
    }
    return entries
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [topicData]);

  const completedPhases = phaseStats.filter((p) => p.done === p.total && p.total > 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          {settings?.startDate
            ? `Started ${formatDate(settings.startDate)}`
            : 'Welcome to your SDET prep tracker'}
          {settings?.targetDate &&
            ` · Target: ${formatDate(settings.targetDate)}`}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-blue-400" />}
          label="Total Topics"
          value={stats.total}
          bg="bg-blue-900/30"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
          label="Completed"
          value={stats.completed}
          bg="bg-green-900/30"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
          label="Progress"
          value={`${stats.pct}%`}
          bg="bg-purple-900/30"
        />
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-400" />}
          label="Streak"
          value={`${stats.streak}d`}
          bg="bg-orange-900/30"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5 text-teal-400" />}
          label="Days In"
          value={stats.daysSinceStart}
          bg="bg-teal-900/30"
        />
      </div>

      {/* Motivation */}
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-800/50 rounded-xl p-4">
        <p className="text-blue-200 text-sm font-medium">
          {getMotivationalMessage(stats.pct)}
        </p>
      </div>

      {/* Phase completions */}
      {completedPhases.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {completedPhases.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: p.color + '33', color: p.color }}
            >
              <Trophy className="w-3.5 h-3.5" />
              Phase {p.id} Complete!
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Phase progress */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Phase Progress
          </h2>
          <div className="space-y-3">
            {phaseStats.map((phase) => {
              const pct = phase.total > 0 ? Math.round((phase.done / phase.total) * 100) : 0;
              return (
                <div key={phase.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 font-medium truncate pr-2">
                      P{phase.id}: {phase.name}
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {phase.done}/{phase.total}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: phase.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {/* Today's suggestion */}
          {todayTopic && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                Study Next
              </h2>
              <div
                className="rounded-lg p-3 mb-3"
                style={{ backgroundColor: todayTopic.phase.color + '20' }}
              >
                <div
                  className="text-xs font-medium mb-1"
                  style={{ color: todayTopic.phase.color }}
                >
                  Phase {todayTopic.phase.id} · {todayTopic.phase.month}
                </div>
                <div className="text-white text-sm font-medium">
                  {todayTopic.topic.name}
                </div>
              </div>
              <Link
                to="/roadmap"
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-smooth"
              >
                Go to Roadmap <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Recent activity */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Recent Activity
            </h2>
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-sm">No completed topics yet. Start studying!</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map(({ topic, date }) => (
                  <div
                    key={topic.id}
                    className="flex items-start gap-2 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-300 truncate">{topic.name}</div>
                      <div className="text-gray-600 text-xs">{formatDate(date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overall progress ring area */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-6">
        <ProgressRing pct={stats.pct} size={100} />
        <div>
          <div className="text-white font-semibold text-lg">{stats.pct}% Complete</div>
          <div className="text-gray-400 text-sm">
            {stats.completed} of {stats.total} topics mastered
          </div>
          {settings?.targetDate && (
            <div className="text-gray-500 text-xs mt-1">
              {getDaysBetween(getTodayString(), settings.targetDate)} days until target
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg }) {
  return (
    <div className={`${bg} border border-gray-800 rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-gray-500 text-xs mt-0.5">{label}</div>
    </div>
  );
}

function ProgressRing({ pct, size = 100 }) {
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="flex-shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#1f2937"
        strokeWidth="8"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}
