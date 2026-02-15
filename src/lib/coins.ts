/**
 * Coefficient stratégique C(I) par palier de mise
 */
export function calculateCoefficientMise(I: number): number {
  if (I <= 50) return 1 + 0.004 * I;
  if (I <= 75) return 1.2 + 0.012 * (I - 50);
  if (I <= 100) return 1.5 + 0.02 * (I - 75);
  if (I <= 300) return 2 - 0.0045 * (I - 100);
  if (I <= 1000) return 1.1 - 0.000785 * (I - 300);
  return Math.max(0, 0.55 - 0.00055 * (I - 1000));
}

/**
 * Coins = I × C(I) × (0.3 + 0.6 × M^1.5) × (S / 3)^1.1
 */
export function calculateCoins(I: number, M: number, S: number): number {
  const cI = calculateCoefficientMise(I);
  const monthFactor = 0.3 + 0.6 * Math.pow(M, 1.5);
  const sessionFactor = Math.pow(S / 3, 1.1);
  return Math.round(I * cI * monthFactor * sessionFactor);
}
