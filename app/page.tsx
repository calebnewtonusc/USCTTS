"use client";

import dynamic from "next/dynamic";

const VisionWeb = dynamic(() => import("@/components/VisionWeb"), {
  ssr: false,
});

export default function Home() {
  return <VisionWeb />;
}
