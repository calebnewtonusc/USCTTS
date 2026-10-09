import type { Metadata } from "next";
import TTSHome from "@/components/tts/TTSHome";

/* The scroll story that used to be the home page. Tyler, 2026-10-09: the
 * landing should be a plain, structured site after the LA opener, and this
 * story should sit behind a "TTS way" button instead of being the first
 * thing a visitor has to scroll through. */
export const metadata: Metadata = {
  title: "The TTS way | Trojan Tech Solutions",
  description:
    "Follow one student's first client project at Trojan Tech Solutions, from a list of names in Koreatown to a booked meeting.",
};

export default function Way() {
  return <TTSHome />;
}
