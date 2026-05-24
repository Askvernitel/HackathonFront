import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paper, Typography, Box, Button, ButtonGroup } from '@mui/material';
import { PlayArrow, SkipNext, Replay } from '@mui/icons-material';

const INITIAL = [64, 34, 25, 12, 22, 11, 90];

function bubbleSortSteps(arr) {
  const steps = [arr.slice()];
  const a = arr.slice();
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; steps.push(a.slice()); }
    }
  }
  return steps;
}

const STEPS = bubbleSortSteps(INITIAL);
const MAX_VAL = Math.max(...INITIAL);

export default function SortingViz() {
  const [step, setStep] = useState(0);

  const arr = STEPS[step];

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Bubble Sort Animation — Step {step}/{STEPS.length - 1}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 120, mb: 2 }}>
        {arr.map((val, i) => (
          <motion.div
            key={i}
            layout
            style={{
              width: `${100 / arr.length}%`,
              height: `${(val / MAX_VAL) * 100}%`,
              background: `hsl(${(val / MAX_VAL) * 120}, 70%, 55%)`,
              borderRadius: 2,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}
          >
            <Typography variant="caption" color="white" sx={{ pb: 0.3, fontSize: 10 }}>{val}</Typography>
          </motion.div>
        ))}
      </Box>
      <ButtonGroup size="small" variant="outlined">
        <Button onClick={() => setStep(0)} startIcon={<Replay />}>Reset</Button>
        <Button onClick={() => setStep(s => Math.min(s + 1, STEPS.length - 1))} endIcon={<SkipNext />} disabled={step === STEPS.length - 1}>
          Next
        </Button>
      </ButtonGroup>
    </Paper>
  );
}
