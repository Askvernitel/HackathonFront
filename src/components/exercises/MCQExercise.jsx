import { useState } from 'react';
import Md from '../Md';

const KEYS = ['A', 'B', 'C', 'D'];

export default function MCQExercise({ exercise, index, onAnswer, disabled }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSelect(i) {
    if (submitted || disabled) return;
    setSelected(i);
  }

  function handleSubmit() {
    if (selected === null || submitted) return;
    setSubmitted(true);
    const correct = selected === exercise.correctIndex;
    window.dispatchEvent(new CustomEvent('mascot', { detail: { clip: correct ? 'happy' : 'sad' } }));
    onAnswer(index, selected);
  }

  const isCorrect = submitted && selected === exercise.correctIndex;

  return (
    <div className="ex-card">
      <div className="ex-num">Question {index + 1} · Multiple choice</div>
      <div className="q"><Md>{exercise.question}</Md></div>
      <div>
        {exercise.options.map((opt, i) => {
          let cls = 'option';
          if (submitted) {
            cls += ' disabled';
            if (i === exercise.correctIndex) cls += ' correct';
            else if (i === selected) cls += ' wrong';
          } else if (i === selected) {
            cls += ' selected';
          }
          return (
            <div key={i} className={cls} onClick={() => handleSelect(i)}>
              <span className="k">{KEYS[i]}</span>
              <Md>{opt}</Md>
            </div>
          );
        })}
      </div>
      {submitted && (
        <div className={`ex-explanation ${isCorrect ? 'correct' : 'wrong'}`}>
          {isCorrect ? '✓ Correct! ' : '✗ Incorrect. '}<Md>{exercise.explanation}</Md>
        </div>
      )}
      {!submitted && (
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={selected === null}>
            Submit answer
          </button>
        </div>
      )}
    </div>
  );
}
