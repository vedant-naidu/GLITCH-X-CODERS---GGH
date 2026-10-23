import { z } from "zod";

/**
 * Official list of currencies supported by the European Central Bank (Frankfurter API).
 * Currencies outside this list (e.g. AED, NGN, PKR) are not directly provided by Frankfurter.
 */
export const SUPPORTED_CURRENCIES = [
  "EUR",
  "USD",
  "JPY",
  "BGN",
  "CZK",
  "DKK",
  "GBP",
  "HUF",
  "PLN",
  "RON",
  "SEK",
  "CHF",
  "ISK",
  "NOK",
  "TRY",
  "AUD",
  "BRL",
  "CAD",
  "CNY",
  "HKD",
  "IDR",
  "ILS",
  "INR",
  "KRW",
  "MXN",
  "MYR",
  "NZD",
  "PHP",
  "SGD",
  "THB",
  "ZAR",
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const MAX_AMOUNT_INR = 100_000_000; // ₹10 crore limit for retail remittances
export const MIN_AMOUNT = 1;

export function isSupportedCurrency(currency: string): currency is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(currency.toUpperCase() as SupportedCurrency);
}

export const comparisonInputSchema = z
  .object({
    amount: z
      .number({
        message: "Amount must be a valid number",
      })
      .finite("Amount must be a finite number")
      .positive("Amount must be greater than zero")
      .min(MIN_AMOUNT, `Amount must be at least ${MIN_AMOUNT}`)
      .max(MAX_AMOUNT_INR, `Amount cannot exceed ${MAX_AMOUNT_INR.toLocaleString()} (₹10 crore limit)`),
    sourceCurrency: z
      .string()
      .trim()
      .refine((val) => isSupportedCurrency(val), {
        message: "Currency is not supported by the ECB reference source (Frankfurter)",
      })
      .transform((val) => val.toUpperCase()),
    destinationCurrency: z
      .string()
      .trim()
      .refine((val) => isSupportedCurrency(val), {
        message: "Currency is not supported by the ECB reference source (Frankfurter)",
      })
      .transform((val) => val.toUpperCase()),
    sourceCountry: z.string().optional().default("United States"),
    destinationCountry: z.string().optional().default("India"),
    purpose: z.enum(["education", "freelancing", "travel", "business", "shopping"]).default("education"),
    persona: z.enum(["student", "freelancer", "traveler", "business"]).default("student"),
  })
  .refine((data) => data.sourceCurrency !== data.destinationCurrency, {
    message: "Source currency and destination currency must be different",
    path: ["destinationCurrency"],
  });

export type ValidatedComparisonInput = z.infer<typeof comparisonInputSchema>;
