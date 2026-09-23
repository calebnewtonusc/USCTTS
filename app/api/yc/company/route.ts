import { NextResponse } from "next/server";
import { getCompany } from "@/lib/yc";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug") ?? "";
  const company = await getCompany(slug);
  if (!company) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(company, {
    headers: { "cache-control": "public, max-age=300, s-maxage=86400" },
  });
}
