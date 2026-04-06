import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const schema = z.object({
  orgName: z.string().min(1).max(200),
  contactName: z.string().min(1).max(100),
  email: z.string().email(),
  partnerType: z.enum([
    "Client Project",
    "Sponsor",
    "Speaker",
    "Recruiting",
    "Other",
  ]),
  description: z.string().min(10).max(2000),
});

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = schema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json(
        { error: body.error.flatten() },
        { status: 400 },
      );
    }

    const { orgName, contactName, email, partnerType, description } = body.data;
    const supabase = getSupabase();

    const { error } = await supabase.from("partnerships").insert({
      org_name: orgName,
      contact_name: contactName,
      email,
      partner_type: partnerType,
      description,
    });

    if (error) {
      console.error("[partner] supabase error:", error.message);
      return NextResponse.json(
        { error: "Failed to save inquiry" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
