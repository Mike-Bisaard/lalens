/** Prices are stored in the DB as satang (integer). These helpers centralise all conversions. */

export type Satang = number

/** Satang → display string, e.g. 10000 → "฿100" */
export function displayPrice(satang: Satang): string {
  return `฿${(satang / 100).toLocaleString('th-TH')}`
}

/** Satang → initial value for a price input, e.g. 10000 → "100" */
export function satangToInput(satang: Satang): string {
  return Math.round(satang / 100).toLocaleString('en-US')
}

/** Raw keyboard input → satang, e.g. "1,000" → 100000 */
export function inputToSatang(input: string): Satang {
  return parseInt(input.replace(/,/g, '') || '0', 10) * 100
}

/** Format raw keyboard input with comma separators (stays in baht), e.g. "1000" → "1,000" */
export function formatBahtInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '')
  return digits ? parseInt(digits, 10).toLocaleString('en-US') : ''
}
