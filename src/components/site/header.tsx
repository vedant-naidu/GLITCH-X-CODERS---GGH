import Link from "next/link";
import { BrandMark } from "@/components/site/brand-mark";
import { ThemeToggle } from "@/components/site/theme-toggle";

const navigation = [
  { href: "/", label: "Compare" },
  { href: "/student", label: "Student" },
  { href: "/freelancer", label: "Freelancer" },
  { href: "/travel", label: "Traveler" },
  { href: "/dashboard", label: "Business" },
  { href: "#advisor", label: "Advisor" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#FAF7F2]/90 backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <BrandMark size={34} />
          <span className="font-serif text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            FXWise
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-stone-600 transition hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="rounded-full bg-[#C4841D] hover:bg-[#b57718] px-5 py-1.5 text-sm font-medium text-white shadow-xs transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}