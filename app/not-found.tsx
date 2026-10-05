import type { Metadata } from "next";
import Link from "next/link";
import Shell from "@/components/tts/Shell";

export const metadata: Metadata = {
  title: "Not found | Trojan Tech Solutions",
};

/* Any unknown URL landed on Next's unstyled default: a
 * white page in a system font (review, 2026-10-04). This keeps the visitor
 * inside the site with the two places most people were looking for. */
export default function NotFound() {
  return (
    <Shell>
      <section className="hero col section-head prose" aria-labelledby="nf-title">
        <h1 id="nf-title" className="t-h2">
          Nothing is running at this address.
        </h1>
        <p className="t-lead">
          The page may have moved when the site was rebuilt. The work is on the home page, and the people are on the
          people page.
        </p>
        <p className="mt-s">
          <Link className="btn btn-primary" href="/">Go to the home page</Link>{" "}
          <Link className="btn btn-secondary" href="/members">See the people</Link>
        </p>
      </section>
    </Shell>
  );
}
