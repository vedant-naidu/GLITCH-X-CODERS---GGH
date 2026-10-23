import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/format";

export default function DashboardPage() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <Badge tone="accent" className="w-fit">Dashboard</Badge>
          <h1 className="mt-3 font-[var(--font-display)] text-5xl">Track savings, saved searches, and favorite providers.</h1>
        </CardHeader>
        <CardBody className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat label="Saved comparisons" value="12" />
          <Stat label="Favorites" value="4" />
          <Stat label="Savings tracked" value={formatCurrency(1740, "INR")} />
          <Stat label="Preferred currency" value="INR" />
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