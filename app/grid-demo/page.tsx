import type { Metadata } from "next";
import GridDemo from "@/components/tts/grid/GridDemo";

// Verification route for the LA grid engine only. Deleted before launch.
export const metadata: Metadata = {
  title: "Grid demo",
  robots: { index: false, follow: false },
};

export default function GridDemoPage() {
  return <GridDemo />;
}
