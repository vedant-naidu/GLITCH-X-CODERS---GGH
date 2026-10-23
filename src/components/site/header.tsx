import Link from "next/link";
import { BrandMark } from "@/components/site/brand-mark";
import { ThemeToggle } from "@/components/site/theme-toggle";

const navigation = [
  { href: "/student", label: "Student" },
  { href: "/freelancer", label: "Freelancer" },
  { href: "/travel", label: "Travel" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-muted">FXWise</p>
            <p className="text-xs text-muted">Hidden Fee Detector</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm text-muted transition hover:bg-accent/10 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}