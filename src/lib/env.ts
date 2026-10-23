export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  frankfurterBaseUrl: process.env.FRANKFURTER_BASE_URL ?? "https://api.frankfurter.app",
  exchangeRateApiKey: process.env.EXCHANGE_RATE_API_KEY ?? "",
} as const;

export function isConfigured(value: string) {
  return value.trim().length > 0;
}