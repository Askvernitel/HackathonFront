import { createContext, useContext, useState, useCallback } from 'react';
import client from '../api/client';

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [progressCache, setProgressCache] = useState({});

  const fetchProgress = useCallback(async (courseId) => {
    const { data } = await client.get(`/progress/${courseId}`);
    setProgressCache(prev => ({ ...prev, [courseId]: data }));
    return data;
  }, []);

  const advanceStage = useCallback(async (courseId, chapterId, stage, payload = {}) => {
    const { data } = await client.post('/progress/advance', { courseId, chapterId, stage, payload });
    setProgressCache(prev => ({ ...prev, [courseId]: data }));
    return data;
  }, []);

  const failReverseTutor = useCallback(async (courseId, chapterId) => {
    const { data } = await client.post('/progress/fail-reverse-tutor', { courseId, chapterId });
    setProgressCache(prev => ({ ...prev, [courseId]: data }));
    return data;
  }, []);

  return (
    <ProgressContext.Provider value={{ progressCache, fetchProgress, advanceStage, failReverseTutor }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  return useContext(ProgressContext);
}
