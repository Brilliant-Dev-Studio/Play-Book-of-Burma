/**
 * Marketing "per day" price for a plan — rounded down to the nearest 100 MMK
 * so it reads as a round number (e.g. 300,000 MMK / 6 months ≈ 1,666.67/day
 * → "1,600"), not an awkward decimal. Months are treated as 30 days each.
 */
export function getDailyPriceMmk(priceMmk: number, months: number): number {
  if (months <= 0) return 0;
  const daily = priceMmk / (months * 30);
  return Math.floor(daily / 100) * 100;
}

export function formatDailyPriceMmk(priceMmk: number, months: number): string {
  const daily = getDailyPriceMmk(priceMmk, months);
  return `Only ${daily.toLocaleString("en-US")} MMK per day`;
}
