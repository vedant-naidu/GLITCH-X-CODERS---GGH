import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/format";

export default function DashboardPage() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <Badge tone="accent" className="w-fit">Dashboard & Intelligence</Badge>
          <h1 className="mt-3 font-[var(--font-display)] text-5xl">Track savings, saved searches, and compliance rules.</h1>
        </CardHeader>
        <CardBody className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Saved comparisons" value="12" />
          <Stat label="Favorites" value="4" />
          <Stat label="Savings tracked" value={formatCurrency(1740, "INR")} />
          <Stat label="Preferred currency" value="INR" />
        </CardBody>
      </Card>

      {/* Verified Business GST rule callout resolving B5 */}
      <Card className="border-[var(--accent)]/30 bg-[var(--surface-subtle)]">
        <CardHeader>
          <h2 className="font-[var(--font-display)] text-2xl text-[var(--foreground)]">
            📊 Regulatory Notice: How GST on Forex Conversion Truly Works (Rule 32(2))
          </h2>
        </CardHeader>
        <CardBody className="space-y-4 text-sm leading-relaxed text-[var(--muted)]">
          <p>
            Under <strong>Rule 32(2)(b) of the CGST Rules, 2017</strong>, GST on foreign currency exchange is not charged on the entire principal, nor does the tax itself cap at ₹60,000. Instead, GST (18%) is levied on a slab-based <em>taxable service value</em>, where the <strong>taxable service value is capped at ₹60,000</strong>:
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs font-semibold text-[var(--foreground)]">Slab 1: Up to ₹1,00,000</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Taxable value = 1% of gross amount (min ₹250). At 18% GST, tax is ₹45 to ₹180.</p>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs font-semibold text-[var(--foreground)]">Slab 2: ₹1L to ₹10,00,000</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Taxable value = ₹1,000 + 0.5% of excess. Max taxable value ₹5,500 $\rightarrow$ Max GST ₹990.</p>
            </div>

            <div className="rounded-xl border border-emerald-500/40 bg-[var(--surface)] p-4">
              <p className="text-xs font-semibold text-[var(--foreground)]">Slab 3: Above ₹10,00,000</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Taxable value = ₹5,500 + 0.1% of excess, <strong>capped at ₹60,000</strong>.
              </p>
              <p className="mt-2 font-mono text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Max GST Payable: ₹10,800 (18% of ₹60,000)
              </p>
            </div>
          </div>

          <p className="text-xs text-[var(--foreground)]">
            <strong>Key Takeaway:</strong> The maximum GST payable on any currency conversion transaction under Rule 32(2) is strictly <strong>₹10,800</strong>, regardless of whether the business converts ₹50 Lakhs or ₹10 Crores.
          </p>
        </CardBody>
      </Card>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--border)] p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-mono text-2xl text-[var(--foreground)]">{value}</p>
    </div>
  );
}