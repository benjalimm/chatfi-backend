export default function formatCurrencyNumber(n: number): string {
  const isNegative = n < 0;
  if (isNegative) n = -1 * n;
  let output = '';
  if (n < 1e3) return `${n}`;
  if (n >= 1e3 && n < 1e6) output = +(n / 1e3).toFixed(1) + 'K';
  if (n >= 1e6 && n < 1e9) output = +(n / 1e6).toFixed(1) + 'M';
  if (n >= 1e9 && n < 1e12) output = +(n / 1e9).toFixed(1) + 'B';
  if (n >= 1e12) output = +(n / 1e12).toFixed(1) + 'T';
  output = isNegative ? `-$${output}` : `$${output}`;
  return output;
}
