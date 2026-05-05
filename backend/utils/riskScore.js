function calculateRunoffRiskScore(farm, rainfallMm) {
  const slopeMap = { flat: 1, moderate: 5, steep: 9 };
  const manureMap = { covered: 1, open: 9 };

  let rainfallScore;
  if (rainfallMm < 5) rainfallScore = 1;
  else if (rainfallMm < 20) rainfallScore = 4;
  else if (rainfallMm < 50) rainfallScore = 7;
  else rainfallScore = 10;

  const slopeScore = slopeMap[farm.slope] || 5;
  const manureScore = manureMap[farm.manure_storage] || 5;
  const vegetationScore = 5;
  const waterProximityScore = 5;

  const score =
    (rainfallScore * 0.40) +
    (slopeScore * 0.20) +
    (vegetationScore * 0.15) +
    (manureScore * 0.15) +
    (waterProximityScore * 0.10);

  return Math.min(10, Math.max(1, parseFloat(score.toFixed(1))));
}

module.exports = { calculateRunoffRiskScore };
