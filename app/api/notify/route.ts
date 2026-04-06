import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const schema = z.object({
  email: z.string().email(),
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
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    const { email } = body.data;
    const supabase = getSupabase();

    const { error } = await supabase.from("email_signups").insert({ email });

    if (error) {
      // Unique constraint violation means already signed up
      if (error.code === "23505") {
        return NextResponse.json({ ok: true }, { status: 200 });
      }
      console.error("[notify] supabase error:", error.message);
      return NextResponse.json(
        { error: "Failed to save email" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
