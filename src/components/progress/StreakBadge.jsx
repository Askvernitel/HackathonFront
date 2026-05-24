import { Chip, Tooltip } from '@mui/material';
import { LocalFireDepartment } from '@mui/icons-material';

export default function StreakBadge({ streak = 0 }) {
  return (
    <Tooltip title={`${streak} day streak! Keep it up.`}>
      <Chip
        icon={<LocalFireDepartment sx={{ color: streak > 0 ? '#ff6d00 !important' : undefined }} />}
        label={`${streak} day${streak !== 1 ? 's' : ''}`}
        size="small"
        sx={{ fontWeight: 600, bgcolor: streak > 0 ? 'orange.50' : undefined }}
      />
    </Tooltip>
  );
}
