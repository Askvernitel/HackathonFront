import { useState } from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';

export default function BinaryRepViz() {
  const [bits, setBits] = useState(Array(8).fill(0));

  const decimal = bits.reduce((acc, b, i) => acc + b * Math.pow(2, 7 - i), 0);

  function toggleBit(i) {
    setBits(prev => { const next = [...prev]; next[i] = 1 - next[i]; return next; });
  }

  const positions = [128, 64, 32, 16, 8, 4, 2, 1];

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Binary Representation — Click bits to toggle
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
        {bits.map((bit, i) => (
          <Box
            key={i}
            onClick={() => toggleBit(i)}
            sx={{
              width: 40, height: 48, borderRadius: 1, cursor: 'pointer',
              bgcolor: bit ? 'primary.main' : 'grey.200',
              color: bit ? 'white' : 'text.primary',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: 2, borderColor: bit ? 'primary.dark' : 'grey.400',
              transition: 'all 0.15s',
              userSelect: 'none',
            }}
          >
            <Typography variant="body2" fontWeight={700}>{bit}</Typography>
            <Typography variant="caption" sx={{ fontSize: 9 }}>{positions[i]}</Typography>
          </Box>
        ))}
      </Box>
      <Typography variant="h5" fontWeight={700} color="primary">
        = {decimal} (decimal)
      </Typography>
      {decimal < 128 && (
        <Typography variant="caption" color="text.secondary">
          ASCII: {decimal >= 32 && decimal < 127 ? `"${String.fromCharCode(decimal)}"` : '(control char)'}
        </Typography>
      )}
    </Paper>
  );
}
