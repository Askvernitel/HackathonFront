import { Paper, Typography, Box } from '@mui/material';

const nodes = [
  { id: 'start', label: 'Start', x: 130, y: 10, shape: 'ellipse', color: '#4caf50' },
  { id: 'cond', label: 'condition?', x: 100, y: 80, shape: 'diamond', color: '#ff9800' },
  { id: 'true', label: 'True branch', x: 20, y: 160, shape: 'rect', color: '#2196f3' },
  { id: 'false', label: 'False branch', x: 180, y: 160, shape: 'rect', color: '#f44336' },
  { id: 'merge', label: 'Continue', x: 100, y: 240, shape: 'rect', color: '#9c27b0' },
  { id: 'end', label: 'End', x: 130, y: 310, shape: 'ellipse', color: '#607d8b' },
];

const edges = [
  { from: 'start', to: 'cond' }, { from: 'cond', to: 'true', label: 'Yes' }, { from: 'cond', to: 'false', label: 'No' },
  { from: 'true', to: 'merge' }, { from: 'false', to: 'merge' }, { from: 'merge', to: 'end' },
];

function getCenter(id) {
  const n = nodes.find(n => n.id === id);
  return { x: n.x + 40, y: n.y + 18 };
}

export default function ControlFlowViz() {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>Control Flow Diagram</Typography>
      <svg width="100%" height={360} viewBox="0 0 280 360">
        {edges.map((e, i) => {
          const from = getCenter(e.from);
          const to = getCenter(e.to);
          const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
          return (
            <g key={i}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#888" strokeWidth={1.5} markerEnd="url(#arrow)" />
              {e.label && <text x={mx + 5} y={my} fontSize={10} fill="#555">{e.label}</text>}
            </g>
          );
        })}
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#888" />
          </marker>
        </defs>
        {nodes.map(n => (
          <g key={n.id}>
            {n.shape === 'ellipse'
              ? <ellipse cx={n.x + 40} cy={n.y + 14} rx={38} ry={14} fill={n.color} />
              : n.shape === 'diamond'
              ? <polygon points={`${n.x + 40},${n.y} ${n.x + 80},${n.y + 18} ${n.x + 40},${n.y + 36} ${n.x},${n.y + 18}`} fill={n.color} />
              : <rect x={n.x} y={n.y} width={80} height={30} rx={4} fill={n.color} />}
            <text x={n.x + 40} y={n.y + 20} textAnchor="middle" fill="white" fontSize={10} fontWeight="bold">{n.label}</text>
          </g>
        ))}
      </svg>
    </Paper>
  );
}
