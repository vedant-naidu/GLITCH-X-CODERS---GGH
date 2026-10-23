"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { z } from "zod";
import { ArrowRight, BadgeIndianRupee, Clock3, ShieldAlert, TrendingDown, Users, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Meter } from "@/components/ui/meter";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { buildComparisonResult, buildHistoricalPoints } from "@/utils/finance";
import { formatCurrency, formatDate, formatRate } from "@/utils/format";
import { getRecommendationBadge, getPersonaNarrative } from "@/utils/recommendations";
import { ComparisonFormValues, Persona } from "@/types/fintech";

const comparisonSchema = z.object({
  amount: z.number().positive(),
  sourceCurrency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD", "SGD", "AED", "INR"]),
  destinationCurrency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD", "SGD", "AED", "INR"]),
  sourceCountry: z.string().min(2),
  destinationCountry: z.string().min(2),
  purpose: z.enum(["education", "freelancing", "travel", "business", "shopping"]),
  persona: z.enum(["student", "freelancer", "traveler", "business"]),
});

const currencies = ["USD", "EUR", "GBP", "CAD", "AUD", "SGD", "AED", "INR"] as const;
const personaOptions: Array<{ value: Persona; label: string }> = [
  { value: "student", label: "Student" },
  { value: "freelancer", label: "Freelancer" },
  { value: "traveler", label: "Traveler" },
  { value: "business", label: "Business" },
];

const purposeOptions = [
  { value: "education", label: "Education" },
  { value: "freelancing", label: "Freelancing" },
  { value: "travel", label: "Travel" },
  { value: "business", label: "Business" },
  { value: "shopping", label: "Shopping" },
] as const;

const chartColors = ["#c4841d", "#4a7856", "#7c6f63", "#b69a71", "#d8c5ad"];

const defaultInput: ComparisonFormValues = {
  amount: 1000,
  sourceCurrency: "USD",
  destinationCurrency: "INR",
  sourceCountry: "United States",
  destinationCountry: "India",
  purpose: "education",
  persona: "student",
};

export function ComparisonWorkbench({
  copy,
}: {
  copy: { title: string; subtitle: string; highlights: readonly string[] };
}) {
  const [liveRate, setLiveRate] = useState<number | null>(null);
  const [liveRateStatus, setLiveRateStatus] = useState<"loading" | "ready" | "error">("loading");

  const [assistantNotes, setAssistantNotes] = useState(
    "Ask: Should I use Wise or PayPal? What is the cheapest way to pay tuition in Canada?",
  );
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  async function handleAskAi() {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: assistantNotes,
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

  const form = useForm<ComparisonFormValues>({
    resolver: zodResolver(comparisonSchema),
    defaultValues: defaultInput,
  });

  const watchedValues = useWatch({ control: form.control });

  useEffect(() => {
    form.reset(defaultInput);
  }, [form]);

  useEffect(() => {
    const sourceCurrency = watchedValues?.sourceCurrency ?? defaultInput.sourceCurrency;
    const destinationCurrency = watchedValues?.destinationCurrency ?? defaultInput.destinationCurrency;
    const controller = new AbortController();

    async function loadLiveRate() {
      setLiveRateStatus("loading");

      try {
        const response = await fetch(
          `/api/exchange?from=${encodeURIComponent(sourceCurrency)}&to=${encodeURIComponent(destinationCurrency)}`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as { rate?: number };

        if (!controller.signal.aborted) {
          setLiveRate(typeof data.rate === "number" ? data.rate : null);
          setLiveRateStatus(typeof data.rate === "number" && data.rate > 0 ? "ready" : "error");
        }
      } catch {
        if (!controller.signal.aborted) {
          setLiveRate(null);
          setLiveRateStatus("error");
        }
      }
    }

    loadLiveRate();

    return () => controller.abort();
  }, [watchedValues?.sourceCurrency, watchedValues?.destinationCurrency]);

  const currentValues = useMemo<ComparisonFormValues>(
    () => ({
      ...defaultInput,
      ...watchedValues,
    }),
    [watchedValues],
  );

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const result = useMemo(() => buildComparisonResult(currentValues, liveRate ?? undefined), [currentValues, liveRate]);

  const historical = useMemo(() => buildHistoricalPoints(result), [result]);
  const pieData = useMemo(
    () => [
      { name: "Total charges", value: result.bestProvider.totalCost },
      { name: "Amount received", value: result.bestProvider.finalAmountReceived },
    ],
    [result.bestProvider.finalAmountReceived, result.bestProvider.totalCost],
  );

  const onSubmit = form.handleSubmit(() => {
    // The comparison updates live from form state; submitting simply prevents the default form action.
  });

  const currentPersonaNarrative = getPersonaNarrative(result.input.persona);

  return (
    <div className="space-y-6">
      <header className="grid gap-4 lg:grid-cols-[1.45fr_0.85fr] lg:items-end">
        <Card className="relative overflow-hidden border-border">
          <div className="absolute inset-0 fxwise-grid opacity-40" />
          <CardBody className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-5">
              <Badge tone="accent" className="w-fit rounded-full px-4 py-2 text-[0.72rem] uppercase tracking-[0.32em]">
                Real-time Rate Transparency
              </Badge>
              <div className="space-y-3">
                <h1 className="max-w-3xl font-(--font-display) text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                  {copy.title}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">{copy.subtitle}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {copy.highlights.map((item) => (
                  <Badge key={item} tone="neutral" className="rounded-full px-4 py-2 text-xs uppercase tracking-[0.25em]">
                    {item}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={onSubmit}>
                  Compare Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" type="button" onClick={() => form.setValue("persona", "freelancer")}>
                  Switch to Freelancer
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <MiniMetric icon={<ShieldAlert className="h-4 w-4" />} label="Hidden loss" value={formatCurrency(result.bestProvider.totalCost, result.input.sourceCurrency)} emphasis />
              <MiniMetric icon={<BadgeIndianRupee className="h-4 w-4" />} label="Amount received" value={formatCurrency(result.bestProvider.finalAmountReceived, result.input.destinationCurrency)} />
              <MiniMetric icon={<Clock3 className="h-4 w-4" />} label="Fastest" value={`${result.fastestProvider.provider.name} · ${result.fastestProvider.provider.pricing.deliveryTimeDays[0]}-${result.fastestProvider.provider.pricing.deliveryTimeDays[1]} days`} />
              <MiniMetric icon={<Wallet className="h-4 w-4" />} label="Best overall" value={result.bestProvider.provider.name} />
            </div>
          </CardBody>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <p className="text-sm uppercase tracking-[0.3em] text-muted">Persona Focus</p>
            <h2 className="mt-2 font-(--font-display) text-3xl text-foreground">{result.input.persona}</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm leading-7 text-muted">{currentPersonaNarrative}</p>
            <div className="rounded-[1.25rem] border border-border bg-accent/10 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Key Takeaways</p>
              <p className="mt-2 text-sm leading-7 text-foreground">
                {result.bestProvider.provider.name} delivers the strongest blend of cost, clarity, and conversion efficiency for this comparison.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Badge tone="positive">{getRecommendationBadge(0)}</Badge>
              <Badge tone="accent">{getRecommendationBadge(1)}</Badge>
              <Badge tone="warning">{getRecommendationBadge(2)}</Badge>
              <Badge tone="critical">{getRecommendationBadge(3)}</Badge>
            </div>
          </CardBody>
        </Card>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border">
          <CardHeader>
            <h2 className="font-(--font-display) text-3xl text-foreground">Compare options</h2>
            <p className="mt-2 text-sm text-muted">Calculate effective exchange rate, hidden forex spread, total cost, and final amount received.</p>
          </CardHeader>
          <CardBody>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
              <Field label="Amount">
                <Input type="number" step="0.01" {...form.register("amount", { valueAsNumber: true })} />
              </Field>
              <Field label="Payment Purpose">
                <Select {...form.register("purpose")}>
                  {purposeOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Source Currency">
                <Select {...form.register("sourceCurrency")}>
                  {currencies.map((currency) => (
                    <option key={currency}>{currency}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Destination Currency">
                <Select {...form.register("destinationCurrency")}>
                  {currencies.map((currency) => (
                    <option key={currency}>{currency}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Source Country">
                <Input placeholder="United States" {...form.register("sourceCountry")} />
              </Field>
              <Field label="Destination Country">
                <Input placeholder="India" {...form.register("destinationCountry")} />
              </Field>
              <Field label="Persona">
                <Select {...form.register("persona")}>
                  {personaOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  Compare Now
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <h2 className="font-(--font-display) text-3xl text-foreground">Hidden Fee Detector</h2>
            <p className="mt-2 text-sm text-muted">Users should instantly see how much money is silently lost to markup, spread, and fees.</p>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <ValuePill label="Live exchange rate" value={liveRateStatus === "ready" && liveRate ? formatRate(liveRate) : "Loading..."} />
              <ValuePill label="Effective rate" value={formatRate(result.bestProvider.effectiveRate)} />
              <ValuePill label="Total hidden loss" value={formatCurrency(result.bestProvider.totalCost, result.input.sourceCurrency)} emphasis />
              <ValuePill label="Savings vs PayPal" value={formatCurrency(result.estimatedSavings, result.input.destinationCurrency)} emphasis />
            </div>

            <div className="space-y-4 rounded-[1.25rem] border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">Transparency Score</p>
                  <p className="mt-1 text-sm text-muted">{result.bestProvider.transparencyBand.toUpperCase()} transparency</p>
                </div>
                <div className="text-right font-mono text-3xl text-foreground">{result.bestProvider.transparencyScore}</div>
              </div>
              <Meter value={result.bestProvider.transparencyScore} label="Horizontal transparency meter" />
            </div>
          </CardBody>
        </Card>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border">
          <CardHeader>
            <h2 className="font-(--font-display) text-3xl text-foreground">Provider comparison engine</h2>
            <p className="mt-2 text-sm text-muted">Structured pricing data, reusable calculations, and weighted recommendations.</p>
          </CardHeader>
          <CardBody className="space-y-4">
            {result.quotes.slice(0, 5).map((quote, index) => (
              <article key={quote.provider.id} className="rounded-[1.25rem] border border-border p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">{quote.provider.name}</h3>
                      <Badge tone={index === 0 ? "positive" : index === 1 ? "accent" : index === 2 ? "warning" : "neutral"}>
                        {getRecommendationBadge(index)}
                      </Badge>
                    </div>
                    <p className="text-sm leading-7 text-muted">{quote.provider.tagline}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">{quote.provider.rails.join(" · ")}</p>
                  </div>
                  <div className="grid gap-3 text-sm text-muted sm:grid-cols-2 md:min-w-85">
                    <QuoteMetric label="Advertised rate" value={formatRate(quote.advertisedRate)} />
                    <QuoteMetric label="Effective rate" value={formatRate(quote.effectiveRate)} emphasis />
                    <QuoteMetric label="Hidden markup" value={formatCurrency(quote.hiddenExchangeMarkup, result.input.sourceCurrency)} />
                    <QuoteMetric label="Hidden spread" value={formatCurrency(quote.hiddenForexSpread, result.input.sourceCurrency)} />
                    <QuoteMetric label="Total cost" value={formatCurrency(quote.totalCost, result.input.sourceCurrency)} emphasis />
                    <QuoteMetric label="Received" value={formatCurrency(quote.finalAmountReceived, result.input.destinationCurrency)} emphasis />
                  </div>
                </div>
              </article>
            ))}
          </CardBody>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <h2 className="font-(--font-display) text-3xl text-foreground">Analytics dashboard</h2>
            <p className="mt-2 text-sm text-muted">Fee breakdown, effective rate, and historical savings trends across 7 / 30 / 90 day views.</p>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <MiniMetric icon={<TrendingDown className="h-4 w-4" />} label="Savings" value={formatCurrency(result.bestProvider.finalAmountReceived - result.cheapestProvider.finalAmountReceived, result.input.destinationCurrency)} />
              <MiniMetric icon={<Users className="h-4 w-4" />} label="Median received" value={formatCurrency(result.medianAmountReceived, result.input.destinationCurrency)} />
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <ChartPanel title="Fee Breakdown">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={62} outerRadius={92} paddingAngle={3}>
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartPanel>

              <ChartPanel title="Historical savings">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={historical}>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(26,26,26,0.12)" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="savings" stroke={chartColors[0]} strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="charges" stroke={chartColors[1]} strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartPanel>
            </div>

            <ChartPanel title="Provider comparison">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={result.quotes.slice(0, 5)} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(26,26,26,0.12)" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="provider.name" width={110} />
                  <Tooltip />
                  <Bar dataKey="transparencyScore" fill={chartColors[1]} radius={[0, 12, 12, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border">
          <CardHeader>
            <h2 className="font-(--font-display) text-3xl text-foreground">AI Financial Advisor</h2>
            <p className="mt-2 text-sm text-muted">Reference the current comparison instead of giving generic advice.</p>
          </CardHeader>
          <CardBody className="space-y-4">
            <Textarea value={assistantNotes} onChange={(event) => setAssistantNotes(event.target.value)} />
            <div className="rounded-[1.25rem] border border-border bg-accent/10 p-4 text-sm leading-7 text-foreground">
              {aiLoading ? (
                <div className="flex items-center gap-2 text-muted">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
                  <span>Consulting Gemini AI Financial Advisor...</span>
                </div>
              ) : (
                aiAnswer || `${result.bestProvider.provider.name} is currently the strongest recommendation for this comparison because it preserves more of the send amount while keeping the effective rate and hidden charges under control.`
              )}
            </div>
            {aiError && <p className="text-xs text-rose-500">{aiError}</p>}
            <Button type="button" onClick={handleAskAi} disabled={aiLoading}>
              {aiLoading ? "Analyzing..." : "Ask FXWise"}
            </Button>
          </CardBody>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <h2 className="font-[var(--font-display)] text-3xl text-[var(--foreground)]">What this means</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Selected comparison context and a short explanation for each recommendation.</p>
          </CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <InsightCard title="Best provider" value={result.bestProvider.provider.name} subtitle="Best overall weighted score" />
            <InsightCard title="Cheapest" value={result.cheapestProvider.provider.name} subtitle="Lowest blended fee and spread" />
            <InsightCard title="Fastest" value={result.fastestProvider.provider.name} subtitle="Shortest delivery window" />
            <InsightCard title="Most transparent" value={result.mostTransparentProvider.provider.name} subtitle="Highest clarity and lowest hidden loss" />
          </CardBody>
        </Card>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-border bg-surface px-5 py-4 text-sm text-muted">
        <p>Last updated {formatDate(result.updatedAt)}</p>
        <p className="font-mono text-foreground">Effective conversion rate: {formatRate(result.bestProvider.effectiveRate)}</p>
      </footer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm text-muted">
      <span className="block text-xs uppercase tracking-[0.28em]">{label}</span>
      {children}
    </label>
  );
}

function MiniMetric({ icon, label, value, emphasis = false }: { icon: React.ReactNode; label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="rounded-[1.25rem] border border-border p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted">
        {icon}
        {label}
      </div>
      <div className={`mt-2 font-mono ${emphasis ? "text-lg text-foreground" : "text-base text-muted"}`}>{value}</div>
    </div>
  );
}

function ValuePill({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="rounded-[1.2rem] border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-[0.28em] text-muted">{label}</p>
      <p className={`mt-2 font-mono ${emphasis ? "text-2xl text-foreground" : "text-lg text-foreground"}`}>{value}</p>
    </div>
  );
}

function QuoteMetric({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="rounded-[1rem] bg-black/4 p-3 dark:bg-white/6">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted">{label}</p>
      <p className={`mt-1 font-mono ${emphasis ? "text-foreground" : "text-muted"}`}>{value}</p>
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[1.25rem] border border-border p-4">
      <p className="mb-3 text-xs uppercase tracking-[0.28em] text-muted">{title}</p>
      {children}
    </div>
  );
}

function InsightCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="rounded-[1.25rem] border border-border p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-muted">{title}</p>
      <p className="mt-2 font-(--font-display) text-2xl text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
  );
}