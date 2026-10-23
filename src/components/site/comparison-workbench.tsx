"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, ArrowRight, Bookmark, Building2, Check, CircleDot, CreditCard, GraduationCap, Heart, Landmark, Plane, Shield, Sparkles, X } from "lucide-react";
import { buildComparisonResult } from "@/utils/finance";
import { formatNumber, formatRate } from "@/utils/format";
import { ComparisonFormValues, Persona } from "@/types/fintech";

const currencyOptions = [
  { code: "USD", symbol: "$", label: "USD — $" },
  { code: "INR", symbol: "₹", label: "INR — ₹" },
  { code: "EUR", symbol: "€", label: "EUR — €" },
  { code: "GBP", symbol: "£", label: "GBP — £" },
  { code: "CAD", symbol: "C$", label: "CAD — C$" },
  { code: "AUD", symbol: "A$", label: "AUD — A$" },
  { code: "SGD", symbol: "S$", label: "SGD — S$" },
  { code: "JPY", symbol: "¥", label: "JPY — ¥" },
] as const;

const currencySymbols: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  CAD: "C$",
  AUD: "A$",
  SGD: "S$",
  JPY: "¥",
};

const purposeOptions = [
  { value: "education", label: "Education / Tuition", persona: "student" as Persona },
  { value: "freelancing", label: "Freelancing / Invoices", persona: "freelancer" as Persona },
  { value: "travel", label: "Travel / Vacation", persona: "traveler" as Persona },
  { value: "business", label: "Business / Settlement", persona: "business" as Persona },
  { value: "shopping", label: "Shopping / Personal", persona: "traveler" as Persona },
] as const;

function getProviderIcon(id: string) {
  switch (id) {
    case "niyo-global":
      return {
        bg: "bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/60",
        icon: <Plane className="w-5 h-5" />,
      };
    case "flywire":
      return {
        bg: "bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60",
        icon: <GraduationCap className="w-5 h-5" />,
      };
    case "wise":
      return {
        bg: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60",
        icon: <Heart className="w-5 h-5 fill-emerald-600 dark:fill-emerald-400" />,
      };
    case "revolut":
      return {
        bg: "bg-stone-800 text-white border border-stone-700",
        icon: <div className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px]">R</div>,
      };
    case "bookmyforex":
      return {
        bg: "bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60",
        icon: <ArrowLeftRight className="w-5 h-5" />,
      };
    case "payoneer":
      return {
        bg: "bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200/60",
        icon: <CircleDot className="w-5 h-5" />,
      };
    case "airwallex-style":
      return {
        bg: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60",
        icon: <Building2 className="w-5 h-5" />,
      };
    case "western-union":
      return {
        bg: "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60",
        icon: <Landmark className="w-5 h-5" />,
      };
    default:
      return {
        bg: "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200",
        icon: <CreditCard className="w-5 h-5" />,
      };
  }
}

export function ComparisonWorkbench({
  copy,
}: {
  copy?: { title: string; subtitle: string; highlights: readonly string[] };
} = {}) {
  void copy;
  const [amount, setAmount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("amount");
      if (p && !Number.isNaN(Number(p))) return Number(p);
    }
    return 100000;
  });

  const [sourceCurrency, setSourceCurrency] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("sourceCurrency") ||
        new URLSearchParams(window.location.search).get("from");
      if (p) return p;
    }
    return "USD";
  });

  const [destinationCurrency, setDestinationCurrency] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("destinationCurrency") ||
        new URLSearchParams(window.location.search).get("to");
      if (p) return p;
    }
    return "INR";
  });

  const [purpose, setPurpose] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("purpose");
      if (p) return p;
    }
    return "education";
  });

  const [liveRate, setLiveRate] = useState<number | null>(null);
  const [rateDate, setRateDate] = useState<string | null>(null);

  // AI Advisor State
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [advisorQuestion, setAdvisorQuestion] = useState(
    "Should I choose Wise or PayPal? What is the cheapest way to pay?",
  );
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Save Comparison State
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync URL query params on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("amount", String(amount));
    params.set("sourceCurrency", sourceCurrency);
    params.set("destinationCurrency", destinationCurrency);
    params.set("purpose", purpose);
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [amount, sourceCurrency, destinationCurrency, purpose]);

  // Fetch live exchange rate
  useEffect(() => {
    let isCancelled = false;
    async function fetchRate() {
      try {
        const res = await fetch(`/api/exchange?from=${sourceCurrency}&to=${destinationCurrency}`);
        if (!res.ok) throw new Error("Rate fetch error");
        const data = await res.json();
        if (!isCancelled) {
          setLiveRate(data.rate);
          setRateDate(data.date ?? data.asOf ?? null);
        }
      } catch {
        if (!isCancelled) {
          setLiveRate(null);
        }
      }
    }
    fetchRate();
    return () => {
      isCancelled = true;
    };
  }, [sourceCurrency, destinationCurrency]);

  const selectedPurposeOption = useMemo(
    () => purposeOptions.find((p) => p.value === purpose) ?? purposeOptions[0],
    [purpose],
  );

  const currentFormValues = useMemo<ComparisonFormValues>(
    () => ({
      amount,
      sourceCurrency: sourceCurrency as ComparisonFormValues["sourceCurrency"],
      destinationCurrency: destinationCurrency as ComparisonFormValues["destinationCurrency"],
      sourceCountry: "United States",
      destinationCountry: "India",
      purpose: purpose as ComparisonFormValues["purpose"],
      persona: selectedPurposeOption.persona,
    }),
    [amount, sourceCurrency, destinationCurrency, purpose, selectedPurposeOption.persona],
  );

  const result = useMemo(
    () => buildComparisonResult(currentFormValues, liveRate ?? undefined),
    [currentFormValues, liveRate],
  );

  // Swap currencies handler
  function handleSwapCurrencies() {
    const temp = sourceCurrency;
    setSourceCurrency(destinationCurrency);
    setDestinationCurrency(temp);
  }

  // Handle Ask AI
  async function handleAskAi(customPrompt?: string) {
    const q = customPrompt || advisorQuestion;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          comparison: result,
        }),
      });
      if (!res.ok) throw new Error("Failed to get advice");
      const data = await res.json();
      setAiAnswer(data.answer);
    } catch {
      setAiError("Could not retrieve AI response. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }

  // Handle Save comparison
  function handleSaveComparison() {
    try {
      const saved = {
        amount,
        sourceCurrency,
        destinationCurrency,
        purpose,
        bestProvider: result.bestProvider.provider.name,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("fxwise_saved_comparison", JSON.stringify(saved));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      // fallback
    }
  }

  // Computed metrics
  const activeMidMarket = liveRate ?? result.bestProvider.liveRate;
  const targetSymbol = currencySymbols[destinationCurrency] ?? destinationCurrency;
  const sourceSymbol = currencySymbols[sourceCurrency] ?? sourceCurrency;

  const sortedByAmount = useMemo(
    () => [...result.quotes].sort((a, b) => b.finalAmountReceived - a.finalAmountReceived),
    [result.quotes],
  );
  const worstProvider = sortedByAmount[sortedByAmount.length - 1] ?? result.quotes[0];
  const savingsVsWorst = Math.max(0, result.bestProvider.finalAmountReceived - worstProvider.finalAmountReceived);

  const payPalQuote = result.quotes.find((q) => q.provider.id === "paypal") ?? worstProvider;
  const payPalCostDiff = Math.max(0, payPalQuote.totalCost - result.bestProvider.totalCost);

  // Purpose banner config
  const purposeBanner = useMemo(() => {
    switch (purpose) {
      case "education":
        return {
          badge: "RECOMMENDED FOR STUDENTS",
          text: (
            <>
              Based on your purpose, we suggest <em>Flywire</em> — University-partnered, Tuition optimized.
            </>
          ),
        };
      case "freelancing":
        return {
          badge: "RECOMMENDED FOR FREELANCERS",
          text: (
            <>
              Based on your purpose, we suggest <em>Wise</em> — Transparent low spread, Direct international invoicing.
            </>
          ),
        };
      case "travel":
        return {
          badge: "RECOMMENDED FOR TRAVELERS",
          text: (
            <>
              Based on your purpose, we suggest <em>Niyo Global</em> — Zero forex markup card, Instant ATM access.
            </>
          ),
        };
      case "business":
        return {
          badge: "RECOMMENDED FOR BUSINESSES",
          text: (
            <>
              Based on your purpose, we suggest <em>Airwallex</em> — Enterprise multi-currency virtual accounts and commercial wholesale FX.
            </>
          ),
        };
      default:
        return {
          badge: "RECOMMENDED FOR SHOPPING",
          text: (
            <>
              Based on your purpose, we suggest <em>Revolut</em> — Real-time weekend interbank rates and virtual disposable cards.
            </>
          ),
        };
    }
  }, [purpose]);

  return (
    <div className="space-y-6 pb-16">
      {/* 1. TOP COMPARISON CONTROL BAR (SCREENSHOT 1) */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <form
          className="flex flex-col gap-4 lg:flex-row lg:items-end"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          {/* AMOUNT */}
          <div className="flex-1 min-w-[140px]">
            <label htmlFor="amount" className="block text-[11px] font-semibold tracking-wider text-stone-400 uppercase mb-2">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-2.5 text-base font-mono font-medium text-stone-900 focus:border-[#C4841D] focus:outline-none focus:ring-1 focus:ring-[#C4841D] dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-100"
            />
          </div>

          {/* FROM */}
          <div className="w-full sm:w-44">
            <label htmlFor="from" className="block text-[11px] font-semibold tracking-wider text-stone-400 uppercase mb-2">
              From
            </label>
            <div className="relative">
              <select
                id="from"
                value={sourceCurrency}
                onChange={(e) => setSourceCurrency(e.target.value)}
                className="w-full appearance-none rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-2.5 pr-8 text-sm font-medium text-stone-900 focus:border-[#C4841D] focus:outline-none focus:ring-1 focus:ring-[#C4841D] dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-100 cursor-pointer"
              >
                {currencyOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
                ▾
              </div>
            </div>
          </div>

          {/* SWAP CURRENCIES BUTTON */}
          <div className="flex items-center justify-center pb-1">
            <button
              type="button"
              onClick={handleSwapCurrencies}
              title="Swap Currencies"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-stone-100/80 text-stone-600 transition hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 cursor-pointer"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>

          {/* TO */}
          <div className="w-full sm:w-44">
            <label htmlFor="to" className="block text-[11px] font-semibold tracking-wider text-stone-400 uppercase mb-2">
              To
            </label>
            <div className="relative">
              <select
                id="to"
                value={destinationCurrency}
                onChange={(e) => setDestinationCurrency(e.target.value)}
                className="w-full appearance-none rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-2.5 pr-8 text-sm font-medium text-stone-900 focus:border-[#C4841D] focus:outline-none focus:ring-1 focus:ring-[#C4841D] dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-100 cursor-pointer"
              >
                {currencyOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
                ▾
              </div>
            </div>
          </div>

          {/* PURPOSE */}
          <div className="w-full sm:w-56">
            <label htmlFor="purpose" className="block text-[11px] font-semibold tracking-wider text-stone-400 uppercase mb-2">
              Purpose
            </label>
            <div className="relative">
              <select
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full appearance-none rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-2.5 pr-8 text-sm font-medium text-stone-900 focus:border-[#C4841D] focus:outline-none focus:ring-1 focus:ring-[#C4841D] dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-100 cursor-pointer"
              >
                {purposeOptions.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
                ▾
              </div>
            </div>
          </div>

          {/* COMPARE NOW ACTION BUTTON */}
          <div>
            <button
              type="submit"
              className="flex h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-[#C4841D] px-6 text-sm font-medium text-white shadow-xs transition hover:bg-[#b07316] cursor-pointer whitespace-nowrap"
            >
              <span>Compare Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* 2. RATE & BEST RECEIVED METRIC CARDS (SCREENSHOT 1) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* LIVE MID-MARKET RATE */}
        <div className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900 min-h-[170px]">
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-stone-400 uppercase">
              Live Mid-Market Rate
            </p>
            <h2 className="my-3 font-mono text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl dark:text-stone-100">
              1 {sourceCurrency} = {targetSymbol}
              {formatRate(activeMidMarket)}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium">
            <span>⟳</span>
            <span>Updated 0s ago {rateDate ? `(${rateDate})` : ""}</span>
          </div>
        </div>

        {/* BEST AMOUNT RECEIVED */}
        <div className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900 min-h-[170px]">
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-stone-400 uppercase">
              Best Amount Received
            </p>
            <h2 className="my-1 font-mono text-4xl font-bold tracking-tight text-[#C4841D] sm:text-5xl">
              {targetSymbol}
              {result.bestProvider.finalAmountReceived.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </h2>
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
              via {result.bestProvider.provider.name}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800/80">
            <span className="text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
              Savings vs Worst
            </span>
            <span className="font-mono text-base font-bold text-stone-900 dark:text-stone-100">
              +{targetSymbol}
              {savingsVsWorst.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* 3. TRANSPARENCY COMPARISON CARD (SCREENSHOT 1) */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <p className="text-[11px] font-semibold tracking-widest text-[#A63A24] uppercase mb-3">
          Transparency Comparison
        </p>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 dark:text-stone-100 leading-snug">
              Choosing <em>PayPal</em> would cost you ${formatNumber(payPalCostDiff, 0)} more.
            </h3>
          </div>

          <div className="flex items-center gap-10 shrink-0">
            {/* PAYPAL SCORE */}
            <div className="text-right">
              <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-1">
                PayPal
              </p>
              <div className="font-mono text-3xl font-bold text-stone-900 dark:text-stone-100">
                {payPalQuote.transparencyScore}
                <span className="text-sm font-normal text-stone-400"> /100</span>
              </div>
              <div className="mt-2 h-1.5 w-24 rounded-full bg-[#A63A24]" />
            </div>

            {/* BEST PROVIDER SCORE */}
            <div className="text-right">
              <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-1">
                {result.bestProvider.provider.name}
              </p>
              <div className="font-mono text-3xl font-bold text-stone-900 dark:text-stone-100">
                {result.bestProvider.transparencyScore}
                <span className="text-sm font-normal text-stone-400"> /100</span>
              </div>
              <div className="mt-2 h-1.5 w-24 rounded-full bg-[#2A7E4C]" />
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS (SCREENSHOT 1) */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleSaveComparison}
          className="flex items-center gap-1.5 rounded-full border border-stone-200/90 bg-white px-4 py-2 text-xs font-medium text-stone-700 shadow-xs transition hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 cursor-pointer"
        >
          {savedSuccess ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-semibold">Saved!</span>
            </>
          ) : (
            <>
              <Bookmark className="h-3.5 w-3.5 text-stone-500" />
              <span>Save comparison</span>
            </>
          )}
        </button>

        <button
          type="button"
          id="advisor"
          onClick={() => setIsAdvisorOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-[#C4841D] px-5 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-[#b07316] cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Ask advisor</span>
        </button>
      </div>

      {/* 4. RECOMMENDATION BANNER (SCREENSHOT 3) */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <p className="text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-2">
          {purposeBanner.badge}
        </p>
        <p className="font-serif text-lg text-stone-900 dark:text-stone-100">
          {purposeBanner.text}
        </p>
      </div>

      {/* 5. ALL PROVIDERS RANKED HEADER (SCREENSHOT 3) */}
      <div className="pt-2">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-100">
          All providers, ranked
        </h2>
      </div>

      {/* 6. PROVIDER CARDS 3-COLUMN GRID (SCREENSHOTS 2 & 3) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {result.quotes.map((quote, index) => {
          const providerIcon = getProviderIcon(quote.provider.id);
          const isTopPick = index === 0;

          // Transparency bar color
          const scoreColor =
            quote.transparencyScore >= 80
              ? "bg-[#2A7E4C]"
              : quote.transparencyScore >= 60
                ? "bg-[#C4841D]"
                : "bg-[#A63A24]";

          return (
            <div
              key={quote.provider.id}
              className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs transition hover:shadow-md dark:border-stone-800 dark:bg-stone-900 relative"
            >
              <div>
                {/* RECOMMENDED BADGE */}
                {isTopPick && (
                  <span className="mb-3 inline-block rounded bg-stone-900 px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase dark:bg-stone-100 dark:text-stone-900">
                    Recommended
                  </span>
                )}

                {/* CARD HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${providerIcon.bg}`}
                    >
                      {providerIcon.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                        {quote.provider.name}
                      </h3>
                      <p className="text-xs font-medium text-stone-400 capitalize">
                        {quote.provider.category.replace("_", " ")} · {quote.provider.pricing.deliveryTimeDays[0] === 0 ? "Instant" : `${quote.provider.pricing.deliveryTimeDays[0]}-${quote.provider.pricing.deliveryTimeDays[1]} Days`}
                      </p>
                    </div>
                  </div>

                  {/* TRANSPARENCY SCORE */}
                  <div className="text-right shrink-0">
                    <div className="font-mono text-2xl font-bold text-stone-900 dark:text-stone-100">
                      {quote.transparencyScore}
                      <span className="text-xs font-normal text-stone-400"> /100</span>
                    </div>
                    <div className={`mt-1.5 h-1 w-20 rounded-full ${scoreColor} ml-auto`} />
                    <p className="mt-1 text-[8px] font-bold tracking-widest text-stone-400 uppercase">
                      Transparency
                    </p>
                  </div>
                </div>

                {/* FEATURE TAGS */}
                <div className="my-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase text-stone-500">
                  {isTopPick && (
                    <>
                      <span>⚖ Best Overall</span>
                      <span>⚖ Cheapest</span>
                    </>
                  )}
                  {quote.provider.id === "wise" && <span>Most Transparent</span>}
                  {quote.provider.id === "flywire" && <span>Tuition Optimized</span>}
                </div>

                {/* BIG METRICS ROW */}
                <div className="my-4 grid grid-cols-2 gap-4 border-t border-b border-stone-100 py-3 dark:border-stone-800">
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                      You Receive
                    </p>
                    <p
                      className={`font-mono text-xl sm:text-2xl font-bold tracking-tight ${
                        isTopPick ? "text-[#C4841D]" : "text-stone-900 dark:text-stone-100"
                      }`}
                    >
                      {targetSymbol}
                      {quote.finalAmountReceived.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                      Total Cost
                    </p>
                    <p className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                      {sourceSymbol}
                      {formatNumber(quote.totalCost, 0)}
                    </p>
                  </div>
                </div>

                {/* CALLOUT BOX (SCREENSHOT 3) */}
                <div className="rounded-xl border border-[#EBE4D8] bg-[#FAF6F0] p-3.5 dark:border-stone-800 dark:bg-stone-800/50">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-stone-600 uppercase mb-2 dark:text-stone-300">
                    <Shield className="h-3.5 w-3.5 text-stone-500" />
                    <span>Transparent</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-[9px] font-medium text-stone-400">Advertised</p>
                      <p className="font-mono font-semibold text-stone-700 dark:text-stone-300">
                        1 {sourceCurrency} = {targetSymbol}
                        {formatRate(quote.advertisedRate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-medium text-stone-400">You actually get</p>
                      <p className="font-mono font-semibold text-stone-900 dark:text-stone-100">
                        1 {sourceCurrency} = {targetSymbol}
                        {formatRate(quote.effectiveRate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-medium text-stone-400">Hidden loss</p>
                      <p className="font-mono font-semibold text-[#A63A24]">
                        {sourceSymbol}
                        {formatNumber(quote.totalCost, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLLAPSIBLE COST BREAKDOWN */}
              <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/80">
                <details className="group text-xs text-stone-600 dark:text-stone-400">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 font-medium select-none hover:text-stone-900 dark:hover:text-stone-200">
                    <span className="text-[10px] transition-transform group-open:rotate-90">▶</span>
                    <span>Cost breakdown</span>
                  </summary>
                  <div className="mt-2.5 space-y-1.5 border-l-2 border-stone-200 pl-3 font-mono text-[11px] dark:border-stone-800">
                    <div className="flex justify-between">
                      <span className="text-stone-400">FX markup</span>
                      <span>{(quote.provider.pricing.exchangeMarkup * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Fixed fee</span>
                      <span>{sourceSymbol}{quote.fixedFees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">% fee</span>
                      <span>{(quote.provider.pricing.percentageFee * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Processing fee</span>
                      <span>{sourceSymbol}{quote.processingCharges}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">GST on fees</span>
                      <span>{(quote.provider.pricing.gstRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between border-t border-stone-200 pt-1 font-bold text-stone-800 dark:border-stone-800 dark:text-stone-200">
                      <span>Total fees</span>
                      <span>{sourceSymbol}{quote.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 font-sans text-[10px] text-stone-400">
                      <span>Verified: {quote.provider.lastVerifiedAt}</span>
                      <a
                        href={quote.provider.sourceUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-[#C4841D] underline hover:text-[#b07316]"
                      >
                        Pricing Source ↗
                      </a>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          );
        })}
      </div>

      {/* 7. INTERACTIVE AI ADVISOR MODAL / SLIDE-OVER */}
      {isAdvisorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C4841D]/15 text-[#C4841D]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                    FXWise AI Financial Advisor
                  </h3>
                  <p className="text-xs text-stone-400">Powered by Google Gemini 2.5</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdvisorOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* CONTEXT CHIP */}
            <div className="my-3 flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-2 text-xs font-mono text-stone-600 dark:bg-stone-800 dark:text-stone-300">
              <span className="font-bold text-[#C4841D]">Context:</span>
              <span>
                {amount.toLocaleString()} {sourceCurrency} → {destinationCurrency} ({purpose})
              </span>
            </div>

            {/* PRESET CHIPS */}
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setAdvisorQuestion("Should I choose Wise or PayPal for this transfer?");
                  handleAskAi("Should I choose Wise or PayPal for this transfer?");
                }}
                className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
              >
                Wise vs PayPal breakdown
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdvisorQuestion(`Why is ${result.bestProvider.provider.name} the cheapest option?`);
                  handleAskAi(`Why is ${result.bestProvider.provider.name} the cheapest option?`);
                }}
                className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
              >
                Why is {result.bestProvider.provider.name} cheapest?
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdvisorQuestion("Explain the hidden markup fee vs upfront fixed fee");
                  handleAskAi("Explain the hidden markup fee vs upfront fixed fee");
                }}
                className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
              >
                Hidden markup explained
              </button>
            </div>

            {/* CHAT RESPONSE AREA */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-stone-200 bg-[#FAF6F0] p-4 text-sm leading-relaxed text-stone-800 dark:border-stone-800 dark:bg-stone-800/50 dark:text-stone-200 my-2 min-h-[140px]">
              {aiLoading ? (
                <div className="flex items-center gap-2 text-stone-500 py-6">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#C4841D]" />
                  <span>Consulting Gemini AI Financial Advisor...</span>
                </div>
              ) : aiAnswer ? (
                <div className="whitespace-pre-line">{aiAnswer}</div>
              ) : (
                <div className="text-stone-500">
                  {result.bestProvider.provider.name} is currently the strongest recommendation for this
                  comparison ({amount.toLocaleString()} {sourceCurrency} to {destinationCurrency}). It delivers
                  the highest net payout with minimal spread markup and clear fee disclosures. Ask a question below to analyze specific providers.
                </div>
              )}
              {aiError && <p className="mt-2 text-xs text-rose-500">{aiError}</p>}
            </div>

            {/* INPUT & SUBMIT */}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={advisorQuestion}
                onChange={(e) => setAdvisorQuestion(e.target.value)}
                placeholder="Ask about transfer costs, spreads, or providers..."
                className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 focus:border-[#C4841D] focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAskAi();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => handleAskAi()}
                disabled={aiLoading}
                className="rounded-xl bg-[#C4841D] px-5 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-[#b07316] disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {aiLoading ? "Thinking..." : "Ask FXWise"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}