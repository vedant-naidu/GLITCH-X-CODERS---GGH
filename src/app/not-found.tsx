import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center gap-4 px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Not found</p>
      <h1 className="font-[var(--font-display)] text-5xl text-[var(--foreground)]">This page does not exist.</h1>
      <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">Return to the comparison engine or open one of the specialized experiences.</p>
      <Link href="/" className="inline-flex">
        <Button>Back home</Button>
      </Link>
    </section>
  );
}