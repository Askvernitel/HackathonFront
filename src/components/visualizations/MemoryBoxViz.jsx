import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paper, Typography, Box, TextField, Button } from '@mui/material';

const INITIAL_VARS = [
  { name: 'age', value: 25 },
  { name: 'score', value: 100 },
  { name: 'name', value: '"Alice"' },
];

export default function MemoryBoxViz() {
  const [vars, setVars] = useState(INITIAL_VARS);
  const [newName, setNewName] = useState('');
  const [newVal, setNewVal] = useState('');

  function handleAdd() {
    if (!newName.trim()) return;
    setVars(prev => {
      const existing = prev.findIndex(v => v.name === newName);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], value: newVal };
        return updated;
      }
      return [...prev, { name: newName, value: newVal }];
    });
    setNewName(''); setNewVal('');
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>Memory Boxes</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2, minHeight: 80 }}>
        <AnimatePresence>
          {vars.map(v => (
            <motion.div
              key={v.name}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Box sx={{ border: 2, borderColor: 'primary.main', borderRadius: 1, px: 2, py: 1, minWidth: 90, textAlign: 'center', bgcolor: 'primary.50' }}>
                <Typography variant="caption" color="primary" fontWeight={600}>{v.name}</Typography>
                <Typography variant="body1" fontWeight={700}>{String(v.value)}</Typography>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <TextField size="small" placeholder="variable name" value={newName} onChange={e => setNewName(e.target.value)} sx={{ width: 130 }} />
        <TextField size="small" placeholder="value" value={newVal} onChange={e => setNewVal(e.target.value)} sx={{ width: 100 }} />
        <Button variant="outlined" size="small" onClick={handleAdd}>Assign</Button>
        <Button variant="outlined" size="small" color="error" onClick={() => setVars(INITIAL_VARS)}>Reset</Button>
      </Box>
    </Paper>
  );
}
