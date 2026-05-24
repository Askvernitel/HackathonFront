import { Stepper, Step, StepLabel, StepConnector, stepConnectorClasses } from '@mui/material';
import { styled } from '@mui/material/styles';
import { STAGE_LABELS, STAGE_SEQUENCE } from '../../utils/stageFlow';

const stages = STAGE_SEQUENCE.filter(s => s !== 'completed');

export default function ChapterStepper({ currentStage }) {
  const activeIdx = stages.indexOf(currentStage);

  return (
    <Stepper activeStep={activeIdx} alternativeLabel sx={{ mb: 2 }}>
      {stages.map(stage => (
        <Step key={stage} completed={stages.indexOf(stage) < activeIdx}>
          <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: 11 } }}>
            {STAGE_LABELS[stage]}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
