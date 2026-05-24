import { useEffect } from 'react';
import { useProgress } from '../context/ProgressContext';

export function useProgressForCourse(courseId) {
  const { progressCache, fetchProgress } = useProgress();

  useEffect(() => {
    if (courseId && !progressCache[courseId]) {
      fetchProgress(courseId);
    }
  }, [courseId, progressCache, fetchProgress]);

  return progressCache[courseId] || null;
}
