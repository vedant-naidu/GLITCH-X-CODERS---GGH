import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StudentPage() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <Badge tone="accent" className="w-fit">Student Mode</Badge>
          <h1 className="mt-3 font-[var(--font-display)] text-5xl">Compare tuition payments with hidden fee clarity.</h1>
        </CardHeader>
        <CardBody className="grid gap-4 lg:grid-cols-3">
          <ModeStat label="Inputs" value="Tuition amount, destination country, university" />
          <ModeStat label="Primary output" value="Best payment provider and estimated forex loss" />
          <ModeStat label="Typical winner" value="Flywire for institutional tuition flows" />
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