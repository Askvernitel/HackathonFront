import { useState } from 'react';
import { motion } from 'framer-motion';

// Graph from plan illustration: A→B(4), A→C(2), C→D(1), D→B(1)
const NODES_POS = { A: { x: 60, y: 100 }, B: { x: 220, y: 40 }, C: { x: 220, y: 160 }, D: { x: 340, y: 100 } };
const DIRECTED_EDGES = [
  { from: 'A', to: 'B', w: 4 },
  { from: 'A', to: 'C', w: 2 },
  { from: 'C', to: 'D', w: 1 },
  { from: 'D', to: 'B', w: 1 },
];

function dijkstraSteps() {
  const INF = Infinity;
  const nodes = Object.keys(NODES_POS);
  const dist = { A: 0, B: INF, C: INF, D: INF };
  const visited = new Set();
  const steps = [];

  steps.push({
    dist: { ...dist }, visited: new Set(), active: null, relaxed: null,
    explanation: 'Init: dist[A]=0, all others=∞. Visit the unvisited node with smallest distance first.',
  });

  while (visited.size < nodes.length) {
    const unvisited = nodes.filter(n => !visited.has(n));
    const current = unvisited.reduce((best, n) => (dist[n] < dist[best] ? n : best));
    if (dist[current] === INF) break;
    visited.add(current);

    const edges = DIRECTED_EDGES.filter(e => e.from === current);
    const improved = [];
    for (const e of edges) {
      if (!visited.has(e.to) && dist[current] + e.w < dist[e.to]) {
        dist[e.to] = dist[current] + e.w;
        improved.push(e);
      }
    }

    const relaxDesc = improved.length
      ? improved.map(e => `dist[${e.to}] = dist[${e.from}] + ${e.w} = ${dist[e.from]} + ${e.w} = ${dist[e.to]}`).join('; ')
      : 'No improvements from ' + current + '.';

    steps.push({
      dist: { ...dist }, visited: new Set(visited), active: current,
      relaxed: improved.map(e => e.to),
      explanation: `Visit ${current} (dist=${dist[current]}). Relax outgoing edges: ${relaxDesc}`,
    });
  }

  steps.push({
    dist: { ...dist }, visited: new Set(visited), active: null, relaxed: null,
    explanation: `Done. Shortest paths from A: ${nodes.map(n => `A→${n}=${dist[n] === INF ? '∞' : dist[n]}`).join(', ')}.`,
  });

  return steps;
}

const STEPS = dijkstraSteps();

function nodeColor(id, step) {
  if (!step) return 'var(--bg-raised)';
  if (step.active === id) return 'var(--indigo-500)';
  if (step.relaxed?.includes(id)) return 'var(--saffron-400)';
  if (step.visited?.has(id)) return 'var(--moss-400)';
  return 'var(--bg-raised)';
}

function nodeTextColor(id, step) {
  if (!step) return 'var(--ink)';
  if (step.active === id || step.visited?.has(id)) return '#fff';
  return 'var(--ink)';
}

export default function DijkstraViz() {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];

  return (
    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}>
      <div style={{ marginBottom: 10, color: 'var(--fg-2)' }}>
        <strong style={{ color: 'var(--ink)' }}>Dijkstra's Algorithm</strong>
        &nbsp;— greedy shortest paths from A
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* SVG graph */}
        <svg width={400} height={210} style={{ flexShrink: 0 }}>
          {DIRECTED_EDGES.map(e => {
            const from = NODES_POS[e.from];
            const to = NODES_POS[e.to];
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            const isRelaxed = step.relaxed?.includes(e.to) && step.active === e.from;
            return (
              <g key={`${e.from}-${e.to}`}>
                <defs>
                  <marker id={`arrow-${e.from}-${e.to}`} viewBox="0 0 10 10" refX="8" refY="5"
                    markerWidth={6} markerHeight={6} orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={isRelaxed ? 'var(--saffron-600)' : 'var(--fg-3)'} />
                  </marker>
                </defs>
                <line
                  x1={from.x + 22} y1={from.y}
                  x2={to.x - 22} y2={to.y}
                  stroke={isRelaxed ? 'var(--saffron-600)' : 'var(--border-hairline)'}
                  strokeWidth={isRelaxed ? 2.5 : 1.5}
                  markerEnd={`url(#arrow-${e.from}-${e.to})`}
                />
                <text x={mx} y={my - 6} textAnchor="middle" fontSize={12} fill="var(--fg-2)" fontWeight={600}>{e.w}</text>
              </g>
            );
          })}
          {Object.entries(NODES_POS).map(([id, pos]) => (
            <g key={id}>
              <motion.circle
                cx={pos.x} cy={pos.y} r={22}
                animate={{ fill: nodeColor(id, step) }}
                transition={{ duration: 0.3 }}
                stroke="var(--border-hairline)" strokeWidth={1.5}
              />
              <text x={pos.x} y={pos.y - 4} textAnchor="middle" fontSize={13} fontWeight={700}
                fill={nodeTextColor(id, step)}>{id}</text>
              <text x={pos.x} y={pos.y + 10} textAnchor="middle" fontSize={11}
                fill={nodeTextColor(id, step)}>
                {step.dist[id] === Infinity ? '∞' : step.dist[id]}
              </text>
            </g>
          ))}
        </svg>

        {/* Distance table */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Distance table</div>
          <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ padding: '4px 12px', textAlign: 'center', color: 'var(--fg-3)', fontWeight: 500, borderBottom: '1px solid var(--border-hairline)' }}>Node</th>
                <th style={{ padding: '4px 12px', textAlign: 'center', color: 'var(--fg-3)', fontWeight: 500, borderBottom: '1px solid var(--border-hairline)' }}>dist</th>
                <th style={{ padding: '4px 12px', textAlign: 'center', color: 'var(--fg-3)', fontWeight: 500, borderBottom: '1px solid var(--border-hairline)' }}>visited</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(NODES_POS).map(n => (
                <motion.tr key={n} animate={{ background: step.active === n ? 'var(--indigo-50)' : 'transparent' }}>
                  <td style={{ padding: '4px 12px', textAlign: 'center', fontWeight: 700 }}>{n}</td>
                  <td style={{ padding: '4px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    {step.dist[n] === Infinity ? '∞' : step.dist[n]}
                  </td>
                  <td style={{ padding: '4px 12px', textAlign: 'center' }}>
                    {step.visited?.has(n) ? '✓' : ''}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
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
        <button className="btn btn-primary btn-sm" onClick={() => setStepIdx(s => Math.min(STEPS.length - 1, s + 1))} disabled={stepIdx >= STEPS.length - 1}>Next →</button>
        <span style={{ fontSize: 11, color: 'var(--fg-3)', alignSelf: 'center', marginLeft: 4 }}>
          step {stepIdx} / {STEPS.length - 1}
        </span>
      </div>
    </div>
  );
}
