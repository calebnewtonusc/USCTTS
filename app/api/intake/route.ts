import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const schema = z.object({
  orgName: z.string().min(1).max(200),
  orgDescription: z.string().min(10).max(2000),
  services: z.array(z.string()).min(1),
  timeline: z.string().min(1),
  contactName: z.string().min(1).max(200),
  contactEmail: z.string().email(),
  contactPhone: z.string().max(30).optional(),
  additionalNotes: z.string().max(2000).optional(),
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
      return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
    }

    const { orgName, orgDescription, services, timeline, contactName, contactEmail, contactPhone, additionalNotes } = body.data;

    const emailBody = [
      `New Project Intake Submission`,
      ``,
      `Organization: ${orgName}`,
      `Description: ${orgDescription}`,
      `Services Requested: ${services.join(", ")}`,
      `Timeline: ${timeline}`,
      ``,
      `Contact: ${contactName}`,
      `Email: ${contactEmail}`,
      contactPhone ? `Phone: ${contactPhone}` : null,
      additionalNotes ? `\nAdditional Notes:\n${additionalNotes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    // A company that fills this in is a lead, so it is stored before anything
    // else. On 2026-10-04 this route answered success with no RESEND_API_KEY
    // and a hello@usctts.com inbox that did not exist, so a lead could vanish
    // while the page said "Thanks, it's with us". The row is the record; the
    // email is a courtesy, and a failed store is a failed request.
    const { error: dbError } = await getSupabase().from("partnerships").insert({
      org_name: orgName,
      contact_name: contactName,
      email: contactEmail,
      partner_type: `Intake: ${services.join(", ")}`.slice(0, 200),
      description: emailBody,
    });
    if (dbError) {
      console.error("[POST /api/intake] supabase error:", dbError.message);
      return NextResponse.json({ error: "Could not save your request" }, { status: 500 });
    }

    if (process.env.RESEND_API_KEY) {
      const sent = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "TTS Intake <noreply@usctts.com>",
          to: ["hello@usctts.com"],
          subject: `New Project Request: ${orgName}`,
          text: emailBody,
        }),
      }).catch(() => null);
      if (!sent?.ok) console.error("[POST /api/intake] notify email failed");
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/intake]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
