import { useState } from 'react';
import { Code2, Target, Calendar, Clock } from 'lucide-react';
import { getTodayString } from '../utils/helpers';

export default function OnboardingModal({ onComplete }) {
  const [form, setForm] = useState({
    startDate: getTodayString(),
    targetDate: '',
    dailyGoalHours: '1.5',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(form);
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome, Aman!</h1>
          <p className="text-gray-400 text-sm">
            Your SDET preparation journey starts here. Let's set it up.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              When are you starting?
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={set('startDate')}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Target className="w-4 h-4 text-green-400" />
              Target job-switch date?
            </label>
            <input
              type="date"
              value={form.targetDate}
              onChange={set('targetDate')}
              min={form.startDate}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Daily study goal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['1', '1.5', '2'].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, dailyGoalHours: h }))}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-smooth ${
                    form.dailyGoalHours === h
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {h} hr{h !== '1' ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-smooth"
          >
            Start My Journey →
          </button>
        </form>
      </div>
    </div>
  );
}
