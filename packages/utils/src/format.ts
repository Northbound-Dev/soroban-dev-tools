/**
 * Truncates a Stellar account or contract address for display purposes.
 *
 * @param address - The full Stellar address (e.g. `GABCD...XYZ`).
 * @param prefixLength - Characters to keep at the start. Default: 6.
 * @param suffixLength - Characters to keep at the end. Default: 6.
 * @returns The truncated string, e.g. `GABCD…XYZ`.
 *
 * @example
 * ```ts
 * truncateAddress('GABCDE...FGHIJ'); // 'GABCDE…FGHIJ'
 * ```
 */
export function truncateAddress(
  address: string,
  prefixLength = 6,
  suffixLength = 6,
): string {
  if (address.length <= prefixLength + suffixLength + 1) {
    return address;
  }
  return `${address.slice(0, prefixLength)}…${address.slice(-suffixLength)}`;
}

/**
 * Formats a stroops amount into a human-readable XLM string.
 *
 * @param stroops - Amount in stroops (1 XLM = 10_000_000 stroops).
 * @returns Formatted string, e.g. `"1.5000000 XLM"`.
 *
 * @example
 * ```ts
 * formatXlm(15_000_000); // '1.5000000 XLM'
 * ```
 */
export function formatXlm(stroops: bigint | number): string {
  const n = BigInt(stroops);
  const whole = n / 10_000_000n;
  const fraction = n % 10_000_000n;
  return `${whole}.${fraction.toString().padStart(7, '0')} XLM`;
}

/**
 * Converts an XLM amount (as a decimal string) to stroops.
 *
 * @param xlm - XLM amount, e.g. `"1.5"`.
 * @returns Stroops as a bigint.
 *
 * @example
 * ```ts
 * xlmToStroops('1.5'); // 15_000_000n
 * ```
 */
export function xlmToStroops(xlm: string): bigint {
  const [whole = '0', fraction = ''] = xlm.split('.');
  const paddedFraction = fraction.slice(0, 7).padEnd(7, '0');
  return BigInt(whole) * 10_000_000n + BigInt(paddedFraction);
}
