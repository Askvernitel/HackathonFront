import { useState } from 'react';
import { motion } from 'framer-motion';

const INITIAL_HEAP = [9, 4, 7, 2, 3, 5, 1];

function heapifySteps(arr) {
  const steps = [];
  const h = [...arr];
  steps.push({ heap: [...h], swapping: [], explanation: 'Max-heap: parent ≥ children. Remove root (9), place last element (1) at root, then sift down.' });

  // Extract max: swap root with last, remove last
  [h[0], h[h.length - 1]] = [h[h.length - 1], h[0]];
  h.pop();
  steps.push({ heap: [...h], swapping: [0], explanation: 'Swap root with last element (1). Remove 9. New root = 1.' });

  // Sift down
  let i = 0;
  while (true) {
    const l = 2 * i + 1, r = 2 * i + 2;
    let largest = i;
    if (l < h.length && h[l] > h[largest]) largest = l;
    if (r < h.length && h[r] > h[largest]) largest = r;
    if (largest === i) break;
    steps.push({ heap: [...h], swapping: [i, largest], explanation: `1 at index ${i} < child ${h[largest]} at index ${largest}. Swap.` });
    [h[i], h[largest]] = [h[largest], h[i]];
    steps.push({ heap: [...h], swapping: [largest], explanation: `After swap: ${h[largest]} moved to index ${largest}. Continue sifting down.` });
    i = largest;
  }
  steps.push({ heap: [...h], swapping: [], explanation: `Heap property restored. New max-heap: [${h.join(', ')}]. Root = ${h[0]}.` });
  return steps;
}

const STEPS = heapifySteps(INITIAL_HEAP);

function treeLayout(size) {
  const positions = [];
  for (let i = 0; i < size; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const levelStart = Math.pow(2, level) - 1;
    const levelCount = Math.pow(2, level);
    const posInLevel = i - levelStart;
    const totalWidth = 280;
    const x = (totalWidth / (levelCount + 1)) * (posInLevel + 1);
    const y = 30 + level * 55;
    positions.push({ x, y });
  }
  return positions;
}

export default function HeapViz() {
  const [stepIdx, setStepIdx] = useState(0);
  const { heap, swapping, explanation } = STEPS[stepIdx];
  const positions = treeLayout(heap.length);

  return (
    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}>
      <div style={{ marginBottom: 10, color: 'var(--fg-2)' }}>
        <strong style={{ color: 'var(--ink)' }}>Heap Viz</strong>
        &nbsp;— max-heap tree + array representation
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Tree SVG */}
        <svg width={280} height={180} style={{ flexShrink: 0 }}>
          {heap.map((_, i) => {
            const l = 2 * i + 1, r = 2 * i + 2;
            return (
              <g key={`edges-${i}`}>
                {l < heap.length && <line x1={positions[i].x} y1={positions[i].y} x2={positions[l].x} y2={positions[l].y} stroke="var(--border-hairline)" strokeWidth={1.5} />}
                {r < heap.length && <line x1={positions[i].x} y1={positions[i].y} x2={positions[r].x} y2={positions[r].y} stroke="var(--border-hairline)" strokeWidth={1.5} />}
              </g>
            );
          })}
          {heap.map((val, i) => {
            const isSwap = swapping.includes(i);
            return (
              <g key={i}>
                <motion.circle
                  cx={positions[i].x} cy={positions[i].y} r={20}
                  animate={{ fill: isSwap ? 'var(--saffron-400)' : i === 0 ? 'var(--indigo-500)' : 'var(--moss-400)' }}
                  transition={{ duration: 0.3 }}
                  stroke={isSwap ? 'var(--saffron-600)' : 'transparent'}
                  strokeWidth={2}
                />
                <text x={positions[i].x} y={positions[i].y + 5} textAnchor="middle"
                  fontSize={13} fontWeight={700} fill="#fff">{val}</text>
                <text x={positions[i].x} y={positions[i].y + 32} textAnchor="middle"
                  fontSize={9} fill="var(--fg-3)">[{i}]</text>
              </g>
            );
          })}
        </svg>

        {/* Array view */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Array</div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {heap.map((val, i) => (
              <motion.div
                key={i}
                animate={{ background: swapping.includes(i) ? 'var(--saffron-400)' : i === 0 ? 'var(--indigo-500)' : 'var(--moss-100)' }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 36, height: 44, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, border: '1px solid var(--border-hairline)',
                }}
              >
                <span style={{ fontSize: 9, color: i === 0 ? 'rgba(255,255,255,0.7)' : 'var(--fg-3)' }}>[{i}]</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: (i === 0 || swapping.includes(i)) ? '#fff' : 'var(--ink)' }}>{val}</span>
              </motion.div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--fg-3)', lineHeight: 1.6 }}>
            <div>parent(i) = ⌊(i−1)/2⌋</div>
            <div>left = 2i+1 &nbsp; right = 2i+2</div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div style={{
        background: 'var(--bg-raised)', border: '1px solid var(--border-hairline)',
        borderRadius: 8, padding: '10px 14px', fontSize: 13,
        color: 'var(--ink)', lineHeight: 1.5, margin: '12px 0',
      }}>
        {explanation}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setStepIdx(0)} disabled={stepIdx === 0}>Reset</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setStepIdx(s => Math.max(0, s - 1))} disabled={stepIdx === 0}>← Prev</button>
        <button className="btn btn-primary btn-sm" onClick={() => setStepIdx(s => Math.min(STEPS.length - 1, s + 1))} disabled={stepIdx >= STEPS.length - 1}>Next →</button>
        <span style={{ fontSize: 11, color: 'var(--fg-3)', alignSelf: 'center', marginLeft: 4 }}>
          step {stepIdx} / {STEPS.length - 1}
        </span>
      </div>
    </div>
  );
}
