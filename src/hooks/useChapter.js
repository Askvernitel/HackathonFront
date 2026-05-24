import { useState, useEffect } from 'react';
import client from '../api/client';

export function useChapter(chapterId) {
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chapterId) return;
    setLoading(true);
    client.get(`/chapters/${chapterId}`)
      .then(res => setChapter(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [chapterId]);

  return { chapter, loading, error };
}
