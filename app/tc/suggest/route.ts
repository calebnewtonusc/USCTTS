import { suggestCompanies } from "@/components/tc/directory";

/* Typo-tolerant lookup for the not-found brief. Lives under /tc so the T
 * Combinator host's rewrite in middleware.ts reaches it unchanged. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  return Response.json(
    { hits: suggestCompanies(q.slice(0, 80)) },
    { headers: { "cache-control": "public, max-age=300, s-maxage=86400" } },
  );
}
