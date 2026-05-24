import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';

const N_POINTS = 20;
const data = Array.from({ length: N_POINTS }, (_, i) => {
  const n = i + 1;
  return {
    n,
    'O(1)': 1,
    'O(log n)': Math.log2(n).toFixed(2),
    'O(n)': n,
    'O(n log n)': (n * Math.log2(n)).toFixed(2),
    'O(n²)': n * n,
  };
});

const COLORS = { 'O(1)': '#2196f3', 'O(log n)': '#4caf50', 'O(n)': '#ff9800', 'O(n log n)': '#9c27b0', 'O(n²)': '#f44336' };

export default function BigOChart() {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>Big O Growth Curves</Typography>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="n" label={{ value: 'n (input size)', position: 'insideBottom', offset: -2 }} />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          {Object.keys(COLORS).map(key => (
            <Line key={key} type="monotone" dataKey={key} stroke={COLORS[key]} dot={false} strokeWidth={2} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
