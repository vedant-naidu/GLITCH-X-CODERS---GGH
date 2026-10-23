import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StudentPage() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <Badge tone="accent" className="w-fit">Student Mode</Badge>
          <h1 className="mt-3 font-[var(--font-display)] text-5xl">Compare tuition payments with hidden fee clarity.</h1>
          <p className="mt-2 text-base text-[var(--muted)]">
            Institutional tuition payment gateways vs direct wire transfers for universities in the US, UK, Canada, and Europe.
          </p>
        </CardHeader>
        <CardBody className="grid gap-4 lg:grid-cols-3">
          <ModeStat label="Inputs" value="Tuition amount, destination country, university portal" />
          <ModeStat label="Primary output" value="Best payment provider and estimated forex loss" />
          <ModeStat label="Top Pick" value="Flywire for university admissions, Wise for student living costs" />
        </CardBody>
      </Card>

      <Card className="border-[var(--accent)]/30 bg-[var(--surface-subtle)]">
        <CardHeader>
          <h2 className="font-[var(--font-display)] text-2xl text-[var(--foreground)]">
            🎓 Student Tuition & Living Cost Guidance
          </h2>
        </CardHeader>
        <CardBody className="space-y-4 text-sm leading-relaxed text-[var(--muted)]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-emerald-500/40 bg-[var(--surface)] p-4">
              <span className="font-semibold text-[var(--foreground)]">Direct University Portals</span>
              <p className="mt-1 text-xs text-[var(--muted)]">Flywire integrates with registrar billing portals. Provides zero unallocated payment risk, but charges a ~1.2% conversion spread.</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <span className="font-semibold text-[var(--foreground)]">Monthly Living Expenses</span>
              <p className="mt-1 text-xs text-[var(--muted)]">Wise multi-currency account delivers transparent 0.4%–0.65% spread, ideal for rent, groceries, and student stipends.</p>
            </div>
            <div className="rounded-xl border border-amber-500/40 bg-[var(--surface)] p-4">
              <span className="font-semibold text-[var(--foreground)]">Traditional Bank Swift Wires</span>
              <p className="mt-1 text-xs text-[var(--muted)]">Retail bank branches charge outward remittance handling fees plus intermediary correspondent bank deductions.</p>
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