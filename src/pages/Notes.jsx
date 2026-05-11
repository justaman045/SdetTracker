import { useState, useMemo, useCallback, useRef } from 'react';
import {
  Search,
  Eye,
  Edit3,
  Pin,
  Download,
  ChevronDown,
  StickyNote,
  BookOpen,
} from 'lucide-react';
import { PHASES, TOPICS_BY_PHASE, ALL_TOPICS } from '../data/topics';
import { parseMarkdown, formatDate } from '../utils/helpers';

export default function Notes({ topicData, updateTopic, notesData, updateNotes }) {
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [preview, setPreview] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [scratchpad, setScratchpad] = useState(notesData?.scratchpad || '');
  const [scratchSaved, setScratchSaved] = useState(true);
  const scratchTimer = useRef(null);

  const selectedTopic = useMemo(
    () => ALL_TOPICS.find((t) => t.id === selectedTopicId),
    [selectedTopicId]
  );

  const note = topicData[selectedTopicId]?.notes || '';
  const lastUpdated = topicData[selectedTopicId]?.lastUpdated;

  const handleNoteChange = useCallback(
    (val) => {
      updateTopic(selectedTopicId, { notes: val, lastUpdated: new Date().toISOString().split('T')[0] });
    },
    [selectedTopicId, updateTopic]
  );

  const handleScratchChange = useCallback(
    (val) => {
      setScratchpad(val);
      setScratchSaved(false);
      clearTimeout(scratchTimer.current);
      scratchTimer.current = setTimeout(() => {
        updateNotes({ scratchpad: val });
        setScratchSaved(true);
      }, 800);
    },
    [updateNotes]
  );

  const searchResults = useMemo(() => {
    if (!globalSearch.trim()) return [];
    const q = globalSearch.toLowerCase();
    return ALL_TOPICS.filter((t) => {
      const n = topicData[t.id]?.notes || '';
      return n.toLowerCase().includes(q) || t.name.toLowerCase().includes(q);
    }).slice(0, 10);
  }, [globalSearch, topicData]);

  const exportNotes = useCallback(() => {
    const parts = ['# SDET Learning Notes\n\n'];
    for (const phase of PHASES) {
      parts.push(`## Phase ${phase.id}: ${phase.name}\n\n`);
      for (const topic of TOPICS_BY_PHASE[phase.id] || []) {
        const n = topicData[topic.id]?.notes;
        if (n) {
          parts.push(`### ${topic.name}\n\n${n}\n\n---\n\n`);
        }
      }
    }
    if (scratchpad) parts.push(`## Scratchpad\n\n${scratchpad}\n`);
    const blob = new Blob([parts.join('')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sdet-notes.txt';
    a.click();
  }, [topicData, scratchpad]);

  const topicsWithNotes = ALL_TOPICS.filter((t) => topicData[t.id]?.notes?.trim()).length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notes</h1>
          <p className="text-gray-400 text-sm mt-1">
            {topicsWithNotes} topics with notes
          </p>
        </div>
        <button
          onClick={exportNotes}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-smooth"
        >
          <Download className="w-4 h-4" />
          Export All
        </button>
      </div>

      {/* Global search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search all notes..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-10 overflow-hidden">
            {searchResults.map((t) => (
              <button
                key={t.id}
                onClick={() => { setSelectedTopicId(t.id); setGlobalSearch(''); }}
                className="w-full flex items-start gap-2 px-4 py-2.5 hover:bg-gray-800 text-left text-sm transition-smooth"
              >
                <BookOpen className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 truncate">{t.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Topic selector + scratchpad */}
        <div className="space-y-4">
          {/* Topic selector */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wider">
              Select Topic
            </label>
            <div className="relative">
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none pr-8"
              >
                <option value="">-- Choose a topic --</option>
                {PHASES.map((phase) => (
                  <optgroup key={phase.id} label={`Phase ${phase.id}: ${phase.name}`}>
                    {(TOPICS_BY_PHASE[phase.id] || []).map((t) => (
                      <option key={t.id} value={t.id}>
                        {topicData[t.id]?.notes ? '📝 ' : ''}{t.name.slice(0, 60)}
                        {t.name.length > 60 ? '...' : ''}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            {selectedTopic && lastUpdated && (
              <p className="text-xs text-gray-600 mt-2">
                Last edited: {formatDate(lastUpdated)}
              </p>
            )}
          </div>

          {/* Topics with notes list */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">
              Notes Written ({topicsWithNotes})
            </h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {ALL_TOPICS.filter((t) => topicData[t.id]?.notes?.trim()).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTopicId(t.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-smooth ${
                    selectedTopicId === t.id
                      ? 'bg-blue-900/40 text-blue-300'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
              {topicsWithNotes === 0 && (
                <p className="text-gray-600 text-xs">No notes yet. Select a topic and start writing!</p>
              )}
            </div>
          </div>

          {/* Scratchpad */}
          <div className="bg-gray-900 border border-yellow-900/40 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5" />
                Quick Scratchpad
              </h3>
              <span className="text-xs text-gray-600">
                {scratchSaved ? 'Saved' : 'Saving...'}
              </span>
            </div>
            <textarea
              value={scratchpad}
              onChange={(e) => handleScratchChange(e.target.value)}
              placeholder="Quick notes, commands, snippets..."
              rows={8}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-yellow-600 resize-none font-mono"
            />
          </div>
        </div>

        {/* Right: Note editor */}
        <div className="lg:col-span-2">
          {selectedTopic ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden h-full flex flex-col">
              {/* Editor toolbar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <div className="flex-1 min-w-0 mr-3">
                  <h2 className="text-sm font-medium text-white truncate">
                    {selectedTopic.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-600">Phase {selectedTopic.phaseId}</span>
                    <span className="text-xs text-gray-600">·</span>
                    <span className="text-xs text-gray-600">{selectedTopic.difficulty}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreview(false)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-smooth ${
                      !preview
                        ? 'bg-blue-700 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setPreview(true)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-smooth ${
                      preview
                        ? 'bg-blue-700 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                </div>
              </div>

              {/* Editor or preview */}
              <div className="flex-1 p-4">
                {preview ? (
                  note ? (
                    <div
                      className="markdown-preview prose prose-invert max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(note) }}
                    />
                  ) : (
                    <div className="text-center py-16 text-gray-600">
                      <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>No notes yet. Switch to Edit mode to start writing.</p>
                    </div>
                  )
                ) : (
                  <textarea
                    value={note}
                    onChange={(e) => handleNoteChange(e.target.value)}
                    placeholder={`Notes for: ${selectedTopic.name}\n\nSupports Markdown:\n# Heading\n**bold** *italic* \`code\`\n\`\`\`java\n// code block\n\`\`\``}
                    className="w-full h-full min-h-[400px] bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none font-mono leading-relaxed"
                  />
                )}
              </div>

              {!preview && (
                <div className="px-4 py-2 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-xs text-gray-600">Markdown supported</span>
                  <span className="text-xs text-gray-600">{note.length} chars</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center h-96">
              <div className="text-center text-gray-600">
                <StickyNote className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a topic to view or write notes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
