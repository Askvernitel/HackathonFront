import { useState } from 'react';
import { Paper, Typography, Box, TextField, Button } from '@mui/material';

function BSTNode({ node, x, y, parentX, parentY, scale = 1 }) {
  if (!node) return null;
  const gap = 60 * scale;
  const lx = x - gap, rx = x + gap, ny = y + 60;
  return (
    <g>
      {parentX !== undefined && (
        <line x1={parentX} y1={parentY} x2={x} y2={y} stroke="#999" strokeWidth={1.5} />
      )}
      {node.left && <BSTNode node={node.left} x={lx} y={ny} parentX={x} parentY={y} scale={scale * 0.7} />}
      {node.right && <BSTNode node={node.right} x={rx} y={ny} parentX={x} parentY={y} scale={scale * 0.7} />}
      <circle cx={x} cy={y} r={16} fill="#1976d2" />
      <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize={12} fontWeight="bold">{node.val}</text>
    </g>
  );
}

function insert(root, val) {
  if (!root) return { val, left: null, right: null };
  if (val < root.val) return { ...root, left: insert(root.left, val) };
  if (val > root.val) return { ...root, right: insert(root.right, val) };
  return root;
}

const INITIAL_TREE = [50, 30, 70, 20, 40, 60, 80].reduce(insert, null);

export default function BSTViz() {
  const [tree, setTree] = useState(INITIAL_TREE);
  const [input, setInput] = useState('');

  function handleInsert() {
    const val = parseInt(input);
    if (!isNaN(val)) { setTree(t => insert(t, val)); setInput(''); }
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>Binary Search Tree</Typography>
      <svg width="100%" height={220} viewBox="0 0 300 220">
        <BSTNode node={tree} x={150} y={30} scale={1} />
      </svg>
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <TextField size="small" type="number" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Value" sx={{ width: 100 }}
          onKeyDown={e => e.key === 'Enter' && handleInsert()} />
        <Button variant="outlined" size="small" onClick={handleInsert}>Insert</Button>
        <Button variant="outlined" size="small" color="error" onClick={() => setTree(INITIAL_TREE)}>Reset</Button>
      </Box>
    </Paper>
  );
}
