"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-start justify-center gap-4 px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Something went wrong</p>
      <h1 className="font-[var(--font-display)] text-5xl text-[var(--foreground)]">We could not complete this comparison.</h1>
      <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">Refresh the page or try again. If the issue persists, verify the API and Supabase environment variables.</p>
      <Button onClick={reset}>Try again</Button>
    </section>
  );
}