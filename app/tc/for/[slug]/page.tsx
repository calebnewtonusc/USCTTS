import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCompany, isKnownCompany } from "@/lib/yc";
import { companyFromIndex } from "@/components/tc/directory";
import {
  BriefHead,
  BriefRead,
  BriefWork,
  Deal,
  Footer,
  Masthead,
  Proof,
  Reply,
} from "@/components/tc/sections";

interface Props {
  params: Promise<{ slug: string }>;
}

async function load(slug: string) {
  // yc-oss first, for team size, tags and hiring. If it does not answer, the
  // bundled index still has the name, batch and one-liner, and every section
  // that needs a missing field skips itself instead of guessing.
  return (await getCompany(slug)) ?? companyFromIndex(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isKnownCompany(slug))
    return { title: "Not in the directory | T Combinator" };
  const company = await load(slug);
  const name = company?.name ?? slug;
  return {
    title: `A brief for ${name} | T Combinator`,
    description: `USC builders on free contract work, read against ${name}'s own YC listing.`,
    // One founder opening one link from one DM. Nothing here belongs in an index.
    robots: { index: false, follow: false },
  };
}

export default async function ForCompanyPage({ params }: Props) {
  const { slug } = await params;
  if (!isKnownCompany(slug)) notFound();
  const company = await load(slug);
  if (!company) notFound();

  return (
    <>
      <Masthead />
      <main id="main" className="tc-main">
        <BriefHead company={company} />
        <BriefRead company={company} />
        <BriefWork company={company} />
        <Deal />
        <Proof />
        <Reply company={company} />
      </main>
      <Footer company={company} />
    </>
  );
}
