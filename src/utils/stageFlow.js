export const STAGE_SEQUENCE = ['tutor', 'practice', 'reverse', 'quiz', 'summary', 'completed'];

export const STAGE_LABELS = {
  tutor:    'AI Tutor',
  practice: 'Practice',
  reverse:  'Reverse AI',
  quiz:     'Quiz',
  summary:  'Summary',
  completed: 'Complete',
};

export function nextStage(current) {
  const idx = STAGE_SEQUENCE.indexOf(current);
  return STAGE_SEQUENCE[idx + 1] || 'completed';
}

export function stageIndex(stage) {
  return STAGE_SEQUENCE.indexOf(stage);
}
