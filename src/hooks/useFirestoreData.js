import { useEffect, useRef, useCallback, useReducer } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DEBOUNCE_MS = 800;

function dataReducer(state, action) {
  switch (action.type) {
    case 'LOADED':
      return { ...state, ...action.payload, loading: false, error: null };
    case 'ERROR':
      return { ...state, loading: false, error: action.message };
    case 'SET':
      return { ...state, [action.key]: action.value };
    default:
      return state;
  }
}

const INITIAL = {
  loading: true,
  error: null,
  settings: null,
  topicData: {},
  questionData: {},
  dailyLogs: [],
  notesData: {},
};

export function useFirestoreData(uid) {
  const [state, dispatch] = useReducer(dataReducer, INITIAL);
  const timers = useRef({});

  useEffect(() => {
    if (!uid) return;

    const load = async () => {
      try {
        const ref = (name) => doc(db, 'users', uid, 'data', name);
        const [settingsSnap, topicsSnap, questionsSnap, logsSnap, notesSnap] =
          await Promise.all([
            getDoc(ref('settings')),
            getDoc(ref('topics')),
            getDoc(ref('questions')),
            getDoc(ref('logs')),
            getDoc(ref('notes')),
          ]);

        dispatch({
          type: 'LOADED',
          payload: {
            settings: settingsSnap.exists() ? settingsSnap.data() : null,
            topicData: topicsSnap.exists() ? topicsSnap.data() : {},
            questionData: questionsSnap.exists() ? questionsSnap.data() : {},
            dailyLogs: logsSnap.exists() ? (logsSnap.data().entries ?? []) : [],
            notesData: notesSnap.exists() ? notesSnap.data() : {},
          },
        });
      } catch (err) {
        console.error('Firestore load error:', err);
        // permission-denied means Firestore rules haven't been updated yet
        const message =
          err.code === 'permission-denied'
            ? 'firestore-rules'
            : 'load-failed';
        dispatch({ type: 'ERROR', message });
      }
    };

    load();
  }, [uid]);

  const debouncedWrite = useCallback(
    (docKey, data) => {
      clearTimeout(timers.current[docKey]);
      timers.current[docKey] = setTimeout(() => {
        setDoc(doc(db, 'users', uid, 'data', docKey), data, { merge: true });
      }, DEBOUNCE_MS);
    },
    [uid]
  );

  const setSettings = useCallback(
    (value) => {
      const next = value instanceof Function ? value(state.settings) : value;
      dispatch({ type: 'SET', key: 'settings', value: next });
      debouncedWrite('settings', next);
    },
    [state.settings, debouncedWrite]
  );

  const updateTopic = useCallback(
    (topicId, updates) => {
      const next = {
        ...state.topicData,
        [topicId]: { ...(state.topicData[topicId] ?? {}), ...updates },
      };
      dispatch({ type: 'SET', key: 'topicData', value: next });
      debouncedWrite('topics', next);
    },
    [state.topicData, debouncedWrite]
  );

  const updateQuestion = useCallback(
    (qId, updates) => {
      const next = {
        ...state.questionData,
        [qId]: { ...(state.questionData[qId] ?? {}), ...updates },
      };
      dispatch({ type: 'SET', key: 'questionData', value: next });
      debouncedWrite('questions', next);
    },
    [state.questionData, debouncedWrite]
  );

  const addLog = useCallback(
    (log) => {
      const filtered = state.dailyLogs.filter((l) => l.date !== log.date);
      const next = [...filtered, log].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      dispatch({ type: 'SET', key: 'dailyLogs', value: next });
      debouncedWrite('logs', { entries: next });
    },
    [state.dailyLogs, debouncedWrite]
  );

  const updateNotesData = useCallback(
    (updates) => {
      const next =
        updates instanceof Function
          ? updates(state.notesData)
          : { ...state.notesData, ...updates };
      dispatch({ type: 'SET', key: 'notesData', value: next });
      debouncedWrite('notes', next);
    },
    [state.notesData, debouncedWrite]
  );

  return {
    loading: state.loading,
    error: state.error,
    settings: state.settings,
    setSettings,
    topicData: state.topicData,
    updateTopic,
    questionData: state.questionData,
    updateQuestion,
    dailyLogs: state.dailyLogs,
    addLog,
    notesData: state.notesData,
    updateNotesData,
  };
}
