import { useState } from 'react';
import { motion } from 'framer-motion';

// Fixed graph matching the plan illustration
const NODES = {
  A: { x: 80,  y: 50  },
  B: { x: 200, y: 50  },
  C: { x: 80,  y: 160 },
  D: { x: 200, y: 160 },
};
const EDGES = [['A','B'], ['A','C'], ['B','D'], ['C','D']];
const ADJ = { A: ['B','C'], B: ['A','D'], C: ['A','D'], D: ['B','C'] };

function bfsSteps(start = 'A') {
  const steps = [];
  const visited = new Set();
  const queue = [start];
  visited.add(start);
  steps.push({ visited: new Set(visited), active: null, queue: [...queue], stack: null, order: [], explanation: `Init: enqueue start node ${start}.` });

  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    const newNeighbours = ADJ[node].filter(n => !visited.has(n));
    newNeighbours.forEach(n => { visited.add(n); queue.push(n); });
    steps.push({
      visited: new Set(visited), active: node, queue: [...queue], stack: null,
      order: [...order],
      explanation: `Dequeue ${node}. Enqueue unvisited neighbours: [${newNeighbours.join(', ') || 'none'}]. Visit order so far: ${order.join(' → ')}.`,
    });
  }
  return steps;
}

function dfsSteps(start = 'A') {
  const steps = [];
  const visited = new Set();
  const order = [];

  steps.push({ visited: new Set(), active: null, queue: null, stack: [start], order: [], explanation: `Init: push start node ${start} onto stack.` });

  function dfs(node) {
    if (visited.has(node)) return;
    visited.add(node);
    order.push(node);
    const unvisited = ADJ[node].filter(n => !visited.has(n));
    steps.push({
      visited: new Set(visited), active: node, queue: null, stack: null,
      order: [...order],
      explanation: `Visit ${node}. Unvisited neighbours: [${unvisited.join(', ') || 'none'}]. Visit order so far: ${order.join(' → ')}.`,
    });
    for (const n of ADJ[node]) dfs(n);
  }
  dfs(start);
  return steps;
}

const nodeColors = (id, step, mode) => {
  if (!step) return 'var(--bg-raised)';
  if (step.active === id) return 'var(--indigo-500)';
  if (step.visited?.has(id)) return 'var(--moss-400)';
  return 'var(--bg-raised)';
};

export default function GraphBFSDFSViz() {
  const [mode, setMode] = useState('bfs');
  const [stepIdx, setStepIdx] = useState(0);

  const steps = mode === 'bfs' ? bfsSteps() : dfsSteps();
  const step = steps[Math.min(stepIdx, steps.length - 1)];

  function switchMode(m) {
    setMode(m);
    setStepIdx(0);
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}>
      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['bfs', 'dfs'].map(m => (
          <button
            key={m}
            className={`btn btn-sm ${mode === m ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => switchMode(m)}
          >
            {m.toUpperCase()}
          </button>
        ))}
        <span style={{ fontSize: 11, color: 'var(--fg-3)', alignSelf: 'center' }}>
          {mode === 'bfs' ? '— uses a Queue (layer-by-layer)' : '— uses a Stack / recursion (depth-first)'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* SVG graph */}
        <svg width={280} height={220} style={{ flexShrink: 0 }}>
          {EDGES.map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={NODES[a].x} y1={NODES[a].y}
              x2={NODES[b].x} y2={NODES[b].y}
              stroke="var(--border-hairline)" strokeWidth={2}
            />
          ))}
          {Object.entries(NODES).map(([id, pos]) => (
            <g key={id}>
              <motion.circle
                cx={pos.x} cy={pos.y} r={22}
                animate={{ fill: nodeColors(id, step, mode) }}
                transition={{ duration: 0.3 }}
                stroke={step?.active === id ? 'var(--indigo-700)' : 'var(--border-hairline)'}
                strokeWidth={step?.active === id ? 3 : 1.5}
              />
              <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize={14} fontWeight={700}
                fill={step?.visited?.has(id) ? '#fff' : 'var(--ink)'}>
                {id}
              </text>
            </g>
          ))}
        </svg>

        {/* Queue / stack state */}
        <div style={{ flex: 1 }}>
          {mode === 'bfs' && step.queue !== null && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Queue (front → back)</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {step.queue.length === 0
                  ? <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>empty</span>
                  : step.queue.map((n, i) => (
                    <div key={i} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--indigo-50)', border: '1px solid var(--indigo-300)', borderRadius: 6, fontWeight: 700, fontSize: 13 }}>{n}</div>
                  ))}
              </div>
            </div>
          )}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Visit order</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)' }}>
              {step.order.length ? step.order.join(' → ') : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div style={{
        background: 'var(--bg-raised)', border: '1px solid var(--border-hairline)',
        borderRadius: 8, padding: '10px 14px', fontSize: 13,
        color: 'var(--ink)', lineHeight: 1.5, margin: '12px 0',
      }}>
        {step.explanation}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setStepIdx(0)} disabled={stepIdx === 0}>Reset</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setStepIdx(s => Math.max(0, s - 1))} disabled={stepIdx === 0}>← Prev</button>
        <button className="btn btn-primary btn-sm" onClick={() => setStepIdx(s => Math.min(steps.length - 1, s + 1))} disabled={stepIdx >= steps.length - 1}>Next →</button>
        <span style={{ fontSize: 11, color: 'var(--fg-3)', alignSelf: 'center', marginLeft: 4 }}>
          step {stepIdx} / {steps.length - 1}
        </span>
      </div>
    </div>
  );
}
