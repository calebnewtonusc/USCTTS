import type { Metadata } from "next";
import Way from "@/components/tts/landing/Way";

/* The scroll story, behind home's "Understand the TTS way" card (Tyler,
 * 2026-10-09: home starts as a basic page, and the 3D walkthrough is a
 * door you choose). */
export const metadata: Metadata = {
  title: "The TTS way | Trojan Tech Solutions",
  description:
    "Follow one client project at Trojan Tech Solutions, stage by stage: finding leads in Clay, qualifying them with Perplexity, drafting the first email, wiring the CRM and handing it over.",
};

export default function WayPage() {
  return <Way />;
}
