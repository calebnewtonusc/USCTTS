import { NextResponse } from "next/server";
import { sampleNames } from "@/lib/yc";

/* Names for the ambient background plates. Real companies, so the texture
 * behind the hero is the index rather than lorem. */
export async function GET() {
  return NextResponse.json(
    { names: sampleNames(40) },
    { headers: { "cache-control": "public, max-age=3600, s-maxage=86400" } },
  );
}
