import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { providerCatalog } from "@/data/providers";

export default function TravelPage() {
  const niyo = providerCatalog.find((p) => p.id === "niyo-global");
  const wise = providerCatalog.find((p) => p.id === "wise");

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <Badge tone="accent" className="w-fit">Travel Mode</Badge>
          <h1 className="mt-3 font-[var(--font-display)] text-5xl">Pick the best forex card before you spend abroad.</h1>
          <p className="mt-2 text-base text-[var(--muted)]">
            Compare true zero-markup forex cards against typical credit card network conversion fees.
          </p>
        </CardHeader>
        <CardBody className="grid gap-4 lg:grid-cols-3">
          <ModeStat label="Top Recommendation" value="Niyo Global (Zero forex markup on card rails)" />
          <ModeStat label="Runner-Up" value="Wise Multi-Currency Card (Near-interbank rate)" />
          <ModeStat label="Traditional Cards" value="1.5%–3.5% typical issuing bank forex markup" />
        </CardBody>
      </Card>

      {/* Verified travel card ranking resolving B4 */}
      <Card className="border-[var(--accent)]/30 bg-[var(--surface-subtle)]">
        <CardHeader>
          <h2 className="font-[var(--font-display)] text-2xl text-[var(--foreground)]">
            ✈️ Verified Travel Ranking: Forex Cards vs. Traditional Credit Cards
          </h2>
        </CardHeader>
        <CardBody className="space-y-4 text-sm leading-relaxed text-[var(--muted)]">
          <p>
            When spending internationally, traditional credit cards apply a card network conversion rate plus a <strong>1.5% to 3.5% foreign transaction fee</strong> charged by your domestic issuing bank. Dedicated zero-markup travel cards eliminate this surcharge entirely.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-emerald-500/40 bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--foreground)]">#1 {niyo?.name ?? "Niyo Global"}</span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">Top Pick</span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">Zero forex markup on Visa card purchases worldwide. Real-time in-app balance lock and security controls.</p>
              <p className="mt-3 font-mono text-xs text-[var(--foreground)]">Markup: ~0.0% | Transparency: 86/100</p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--foreground)]">#2 {wise?.name ?? "Wise"}</span>
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">Runner-Up</span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">Hold and spend 40+ currencies at mid-market rates. Ideal for multi-country travel and international withdrawals.</p>
              <p className="mt-3 font-mono text-xs text-[var(--foreground)]">Markup: ~0.4% | Transparency: 92/100</p>
            </div>

            <div className="rounded-xl border border-amber-500/40 bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--foreground)]">Credit Cards (Typical)</span>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">Costly</span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">Standard domestic bank cards impose a typical 1.5%–3.5% foreign transaction fee plus GST on currency conversion.</p>
              <p className="mt-3 font-mono text-xs text-[var(--foreground)]">Markup: 1.5%–3.5% | Convenience only</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}

function ModeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--border)] p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">{value}</p>
    </div>
  );
}