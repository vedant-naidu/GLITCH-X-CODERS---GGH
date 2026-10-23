import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FreelancerPage() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <Badge tone="accent" className="w-fit">Freelancer Mode</Badge>
          <h1 className="mt-3 font-[var(--font-display)] text-5xl">Protect take-home income across cross-border client payments.</h1>
        </CardHeader>
        <CardBody className="grid gap-4 lg:grid-cols-3">
          <ModeStat label="Inputs" value="Payment amount, client country, platform" />
          <ModeStat label="Compare" value="Wise, PayPal, and Payoneer" />
          <ModeStat label="Primary output" value="Final take-home earnings and hidden losses" />
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