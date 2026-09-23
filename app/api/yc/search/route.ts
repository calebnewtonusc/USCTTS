import { NextResponse } from "next/server";
import { searchCompanies } from "@/lib/yc";

/* Homepage lookup. The index is 550KB, which belongs on the server rather
 * than in everybody's bundle, so search runs here and returns at most six
 * hits. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  return NextResponse.json(
    { hits: searchCompanies(q) },
    { headers: { "cache-control": "public, max-age=300, s-maxage=3600" } },
  );
}
