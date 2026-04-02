import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

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

    // Log for now — wire to Mailchimp, Resend, or Supabase in production
    console.log("[notify] email signup:", email);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
