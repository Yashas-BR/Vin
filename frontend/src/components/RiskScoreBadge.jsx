import React from 'react';

export default function RiskScoreBadge({ score }) {
  if (!score && score !== 0) return null;

  const scoreNum = parseFloat(score);
  let label = '';
  
  if (scoreNum < 4) label = 'Safe';
  else if (scoreNum < 7) label = 'Warning';
  else label = 'High Risk';

  return (
    <div
      className={`risk-score-badge risk-score-${Math.ceil(scoreNum)}`}
      title={`Runoff risk: ${label} (${scoreNum.toFixed(1)}/10)`}
    >
      {scoreNum.toFixed(1)}
    </div>
  );
}
