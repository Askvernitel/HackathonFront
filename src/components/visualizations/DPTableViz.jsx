import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COINS = [1, 3, 4];
const TARGET = 6;

function buildDPSteps() {
  const dp = new Array(TARGET + 1).fill(Infinity);
  dp[0] = 0;
  const steps = [{ dp: [...dp], active: 0, coin: null, from: null, explanation: 'Base case: dp[0] = 0 — zero coins needed for amount 0.' }];

  for (let i = 1; i <= TARGET; i++) {
    let bestCoin = null;
    let bestFrom = null;
    for (const c of COINS) {
      if (i >= c && dp[i - c] + 1 < dp[i]) {
        dp[i] = dp[i - c] + 1;
        bestCoin = c;
        bestFrom = i - c;
      }
    }
    const exp = dp[i] === Infinity
      ? `dp[${i}]: no coin reaches this amount.`
      : `dp[${i}] = dp[${bestFrom}] + 1 = ${dp[bestFrom]} + 1 = ${dp[i]}   (use coin ${bestCoin})`;
    steps.push({ dp: [...dp], active: i, coin: bestCoin, from: bestFrom, explanation: exp });
  }
  return steps;
}

const STEPS = buildDPSteps();

export default function DPTableViz() {
  const [step, setStep] = useState(0);
  const { dp, active, from, explanation } = STEPS[step];

  return (
    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}>
      <div style={{ marginBottom: 10, color: 'var(--fg-2)' }}>
        <strong style={{ color: 'var(--ink)' }}>Coin Change DP</strong>
        &nbsp;— coins: [{COINS.join(', ')}] &nbsp;target: {TARGET}
      </div>

      {/* Table */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
        {dp.map((val, i) => {
          const isActive = i === active;
          const isFrom = i === from;
          const bg = isActive ? 'var(--indigo-500)' : isFrom ? 'var(--saffron-400)' : i < active ? 'var(--moss-100)' : 'var(--bg-raised)';
          const color = isActive ? '#fff' : 'var(--ink)';
          return (
            <motion.div
              key={i}
              layout
              animate={{ scale: isActive ? 1.15 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                width: 44, height: 52, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: 8, background: bg, color,
                border: `1px solid ${isActive ? 'var(--indigo-600)' : isFrom ? 'var(--saffron-600)' : 'var(--border-hairline)'}`,
                transition: 'background 0.3s',
              }}
            >
              <span style={{ fontSize: 10, opacity: 0.65 }}>i={i}</span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>
                {val === Infinity ? '∞' : val}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, fontSize: 11, marginBottom: 10, color: 'var(--fg-3)' }}>
        <span><span style={{ background: 'var(--indigo-500)', color: '#fff', padding: '1px 6px', borderRadius: 4 }}>■</span> active</span>
        <span><span style={{ background: 'var(--saffron-400)', padding: '1px 6px', borderRadius: 4 }}>■</span> source (dp[i−c])</span>
        <span><span style={{ background: 'var(--moss-100)', padding: '1px 6px', borderRadius: 4 }}>■</span> computed</span>
      </div>

      {/* Explanation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          style={{
            background: 'var(--bg-raised)', border: '1px solid var(--border-hairline)',
            borderRadius: 8, padding: '10px 14px', fontSize: 13,
            color: 'var(--ink)', fontFamily: 'var(--font-mono)', lineHeight: 1.5,
            marginBottom: 12, minHeight: 40,
          }}
        >
          {explanation}
        </motion.div>
      </AnimatePresence>

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
