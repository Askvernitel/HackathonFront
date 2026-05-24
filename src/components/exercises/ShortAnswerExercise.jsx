import { useState } from 'react';
import Md from '../Md';

export default function ShortAnswerExercise({ exercise, index, onAnswer, disabled }) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  function handleSubmit() {
    if (!value.trim() || submitted) return;
    setSubmitted(true);
    onAnswer(index, value, res => {
      setResult(res);
      window.dispatchEvent(new CustomEvent('mascot', { detail: { clip: res.score >= 60 ? 'happy' : 'sad' } }));
    });
  }

  const passed = result?.score >= 60;

  return (
    <div className="ex-card">
      <div className="ex-num">Question {index + 1} · Short answer</div>
      <div className="q"><Md>{exercise.question}</Md></div>
      <textarea
        className="textarea"
        rows={3}
        placeholder="Type your answer here…"
        value={value}
        onChange={e => setValue(e.target.value)}
        disabled={submitted || disabled}
        style={{ marginBottom: 12 }}
      />
      {!submitted && (
        <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={!value.trim()}>
          Submit answer
        </button>
      )}
      {submitted && !result && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--fg-3)', fontSize: 13 }}>
          <span className="skeleton" style={{ width: 16, height: 16, borderRadius: '50%', display: 'inline-block' }} />
          Grading…
        </div>
      )}
      {result && (
        <div className={`ex-explanation ${passed ? 'correct' : 'wrong'}`}>
          <strong>Score: {result.score}/100</strong> — <Md>{result.feedback}</Md>
        </div>
      )}
    </div>
  );
}
