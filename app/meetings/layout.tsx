import type { Metadata } from "next";
import { PasswordGate } from "@/components/meetings/PasswordGate";

export const metadata: Metadata = {
  title: "Meetings | Trojan Tech Solutions",
  description: "TTS meeting slides. Members only.",
  robots: { index: false, follow: false },
};

export default function MeetingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PasswordGate>{children}</PasswordGate>;
}
