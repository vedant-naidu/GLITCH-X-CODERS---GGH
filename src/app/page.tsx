import { ComparisonWorkbench } from "@/components/site/comparison-workbench";
import { siteCopy } from "@/data/site-copy";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#12110F]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <ComparisonWorkbench copy={siteCopy} />
      </section>
    </main>
  );
}
