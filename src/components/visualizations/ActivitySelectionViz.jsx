import { useState } from 'react';
import { motion } from 'framer-motion';

const ACTIVITIES = [
  { id: 'A', start: 1, end: 4 },
  { id: 'B', start: 3, end: 7 },
  { id: 'C', start: 5, end: 8 },
  { id: 'D', start: 7, end: 10 },
];
const TOTAL = 11;

function greedySteps(acts) {
  const sorted = [...acts].sort((a, b) => a.end - b.end);
  const steps = [];
  const selected = [];
  let lastEnd = -Infinity;

  steps.push({ evaluating: null, selected: [], rejected: [], explanation: 'Sort activities by finish time: A(ends 4), B(ends 7), C(ends 8), D(ends 10). Greedy picks earliest-finishing first.' });

  for (const act of sorted) {
    const conflicts = act.start < lastEnd;
    const newSelected = conflicts ? [...selected] : [...selected, act.id];
    const newRejected = steps[steps.length - 1].rejected.slice();
    if (conflicts) newRejected.push(act.id);
    if (!conflicts) lastEnd = act.end;
    steps.push({
      evaluating: act.id,
      selected: newSelected,
      rejected: newRejected,
      explanation: conflicts
        ? `${act.id} starts at ${act.start}, but last selected ends at ${lastEnd}. Overlap → skip.`
        : `${act.id} starts at ${act.start} ≥ ${lastEnd} (no overlap) → select. Last end = ${act.end}.`,
    });
  }
  return steps;
}

const STEPS = greedySteps(ACTIVITIES);

export default function ActivitySelectionViz() {
  const [step, setStep] = useState(0);
  const { evaluating, selected, rejected, explanation } = STEPS[step];

  function barColor(id) {
    if (selected.includes(id)) return 'var(--moss-500)';
    if (rejected.includes(id)) return 'var(--cinnabar-400)';
    if (id === evaluating) return 'var(--indigo-400)';
    return 'var(--fg-3)';
  }

  function barLabel(id) {
    if (selected.includes(id)) return '✓';
    if (rejected.includes(id)) return '✗';
    return '';
  }

  const scale = 100 / TOTAL;

  return (
    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}>
      <div style={{ marginBottom: 12, color: 'var(--fg-2)' }}>
        <strong style={{ color: 'var(--ink)' }}>Activity Selection</strong>
        &nbsp;— greedy: pick earliest-finishing non-overlapping activity
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        {/* Time axis */}
        <div style={{ display: 'flex', marginBottom: 4 }}>
          {Array.from({ length: TOTAL }, (_, i) => (
            <div key={i} style={{ width: `${scale}%`, textAlign: 'center', fontSize: 10, color: 'var(--fg-3)' }}>{i}</div>
          ))}
        </div>
        {/* Activity bars */}
        {ACTIVITIES.map((act) => (
          <div key={act.id} style={{ position: 'relative', height: 32, marginBottom: 6 }}>
            <span style={{ position: 'absolute', left: 0, fontSize: 11, color: 'var(--fg-2)', lineHeight: '32px', width: 14 }}>{act.id}</span>
            <motion.div
              animate={{ background: barColor(act.id) }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                left: `calc(14px + ${act.start * scale}%)`,
                width: `${(act.end - act.start) * scale}%`,
                height: 28,
                borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 12,
                border: act.id === evaluating ? '2px solid var(--indigo-700)' : '2px solid transparent',
              }}
            >
              {act.start}–{act.end} {barLabel(act.id)}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, fontSize: 11, marginBottom: 10, color: 'var(--fg-3)' }}>
        <span><span style={{ background: 'var(--indigo-400)', padding: '1px 6px', borderRadius: 4, color: '#fff' }}>■</span> evaluating</span>
        <span><span style={{ background: 'var(--moss-500)', padding: '1px 6px', borderRadius: 4, color: '#fff' }}>■</span> selected</span>
        <span><span style={{ background: 'var(--cinnabar-400)', padding: '1px 6px', borderRadius: 4, color: '#fff' }}>■</span> rejected</span>
      </div>

      {/* Explanation */}
      <div style={{
        background: 'var(--bg-raised)', border: '1px solid var(--border-hairline)',
        borderRadius: 8, padding: '10px 14px', fontSize: 13,
        color: 'var(--ink)', lineHeight: 1.5, marginBottom: 12, minHeight: 44,
      }}>
        {explanation}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setStep(0)} disabled={step === 0}>Reset</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← Prev</button>
        <button className="btn btn-primary btn-sm" onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}>Next →</button>
        <span style={{ fontSize: 11, color: 'var(--fg-3)', alignSelf: 'center', marginLeft: 4 }}>
          step {step} / {STEPS.length - 1}
        </span>
      </div>
    </div>
  );
}
