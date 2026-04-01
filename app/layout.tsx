import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trojan Tech Solutions",
  description:
    "USC pro-bono tech consulting club. Small Businesses. Big Impacts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className={`${inter.className} min-h-full bg-zinc-950 antialiased`}>
        {children}
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
