// EUR/XOF rate fixed by treaty since 1999 — 1 EUR = 655.957 XOF
export const EXCHANGE_RATES: Record<string, number> = {
  EUR_XOF: 655.957,
  XOF_EUR: 1 / 655.957,
};

export function convertCurrency(
  amount: number,
  from: string,
  to: string
): number {
  if (from === to) return amount;
  const key = `${from}_${to}`;
  const rate = EXCHANGE_RATES[key];
  if (!rate) throw new Error(`Unknown currency pair: ${key}`);
  // XOF has no cents — round to integer
  return to === "XOF" ? Math.round(amount * rate) : amount * rate;
}
