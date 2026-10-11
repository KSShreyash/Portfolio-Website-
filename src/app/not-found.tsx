import Link from "next/link";
import { Monogram } from "@/components/ui/Monogram";

export default function NotFound() {
  return (
    <main
      id="main"
      className="folio-narrow flex min-h-screen flex-col items-center justify-center py-24 text-center"
    >
      <Monogram size={96} decorative />
      <h1 className="mt-8 text-display-md text-parchment">
        This page isn&rsquo;t on the map
      </h1>
      <hr className="rule-gold mt-6 w-40" />
      <p className="measure mt-6 text-muted">
        The link may be out of date, or the page may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 font-mono text-[0.75rem] tracking-[0.1em] text-gold-light uppercase underline underline-offset-4"
      >
        Back to the beginning
      </Link>
    </main>
  );
}
