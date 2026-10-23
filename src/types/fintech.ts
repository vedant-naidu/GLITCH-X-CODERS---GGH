export type Persona = "student" | "freelancer" | "traveler" | "business";

export type Purpose = "education" | "freelancing" | "travel" | "business" | "shopping";

export type ProviderId =
  | "wise"
  | "paypal"
  | "payoneer"
  | "visa"
  | "mastercard"
  | "hdfc"
  | "icici"
  | "niyo-global"
  | "bookmyforex"
  | "flywire"
  | "western-union"
  | "revolut"
  | "airwallex-style";

export type TransparencyBand = "excellent" | "good" | "average" | "poor";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "SGD" | "AED" | "INR";

export type ProviderPricing = {
  exchangeMarkup: number;
  hiddenForexSpread: number;
  fixedFee: number;
  percentageFee: number;
  gstRate: number;
  processingFee: number;
  deliveryTimeDays: [number, number];
  feeClarity: number;
  speedScore: number;
  personaFit: Record<Persona, number>;
};

export type ProviderDefinition = {
  id: ProviderId;
  name: string;
  tagline: string;
  pricing: ProviderPricing;
  rails: string[];
};

export type ComparisonFormValues = {
  amount: number;
  sourceCurrency: CurrencyCode;
  destinationCurrency: CurrencyCode;
  sourceCountry: string;
  destinationCountry: string;
  purpose: Purpose;
  persona: Persona;
};

export type ProviderQuote = {
  provider: ProviderDefinition;
  liveRate: number;
  advertisedRate: number;
  effectiveRate: number;
  hiddenExchangeMarkup: number;
  hiddenForexSpread: number;
  totalHiddenLoss: number;
  fixedFees: number;
  percentageFees: number;
  gst: number;
  processingCharges: number;
  totalCost: number;
  finalAmountReceived: number;
  transparencyScore: number;
  transparencyBand: TransparencyBand;
  savingsVsMedian: number;
};

export type ComparisonResult = {
  input: ComparisonFormValues;
  quotes: ProviderQuote[];
  bestProvider: ProviderQuote;
  cheapestProvider: ProviderQuote;
  fastestProvider: ProviderQuote;
  mostTransparentProvider: ProviderQuote;
  estimatedSavings: number;
  medianAmountReceived: number;
  liveRateLabel: string;
  updatedAt: string;
};

export type HistoricalPoint = {
  period: string;
  savings: number;
  charges: number;
  amountReceived: number;
};