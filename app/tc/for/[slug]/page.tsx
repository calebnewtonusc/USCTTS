import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Hero from "@/components/tc/Hero";
import { Bench, Handoffs, Refusals, Close, TcFooter, PersonalBand } from "@/components/tc/sections";
import { getCompany, isKnownCompany } from "@/lib/yc";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompany(slug);
  if (!company) return { title: "T Combinator" };
  return {
    title: `T Combinator for ${company.name}`,
    description: `USC builders on free contract work, for ${company.name}.`,
    // One founder opening one link from one DM. Nothing here belongs in an index.
    robots: { index: false, follow: false },
  };
}

export default async function ForCompanyPage({ params }: Props) {
  const { slug } = await params;

  // An unknown slug is a typo in a DM, and a 404 in front of a founder is the
  // worst possible outcome of the whole idea.
  if (!isKnownCompany(slug)) notFound();

  const company = await getCompany(slug);

  return (
    <main>
      {/* A null company means yc-oss was unreachable. The page falls back to the
        * generic pitch rather than erroring, because a founder is looking at it. */}
      {company && <PersonalBand company={company} />}
      <Hero compact={Boolean(company)} />
      <hr className="tc-rule" />
      <Handoffs />
      <div id="bench">
        <Bench />
      </div>
      <Refusals />
      <Close />
      <TcFooter />
    </main>
  );
}
