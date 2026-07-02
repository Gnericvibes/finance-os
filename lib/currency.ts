/**
 * Currency symbol map for supported currencies.
 * Covers all currencies in the onboarding schema.
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
  CAD: "CA$",
  AUD: "A$",
  AED: "د.إ",
  ZAR: "R",
  KES: "KSh",
  GHS: "GH₵",
};

/**
 * Returns the currency symbol for a given currency code.
 * Falls back to the code itself if not found.
 */
export function getCurrencySymbol(currency: string | null | undefined): string {
  if (!currency) return "₦";
  return CURRENCY_SYMBOLS[currency] ?? currency;
}
