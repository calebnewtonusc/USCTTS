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
  // www, not the apex: the apex 301s and drops the path, so og:image 404d there.
  metadataBase: new URL("https://www.usctts.com"),
  title: "Trojan Tech Solutions | USC's AI implementation and go-to-market lab",
  description:
    "USC's AI implementation and go-to-market lab. Students build whatever AI a company or nonprofit needs, anywhere in the world: automations, CRMs, outbound, agents and training. They learn it by shipping it.",
  openGraph: {
    title: "Trojan Tech Solutions",
    description:
      "USC's AI implementation and go-to-market lab. Students build whatever AI a company or nonprofit needs, anywhere in the world: automations, CRMs, outbound, agents and training. They learn it by shipping it.",
    url: "https://www.usctts.com",
    siteName: "Trojan Tech Solutions",
    type: "website",
    images: [
      {
        // The A15 helmet, Caleb's pick (2026-10-21). A new file name,
        // not a swap at the old one, because iMessage and Slack cache a
        // preview by its image URL.
        url: "/tts/brand/og-a15.png",
        width: 1200,
        height: 630,
        alt: "Trojan Tech Solutions, the red helmet with TTS in its face openings, beside the name",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trojan Tech Solutions",
    description:
      "USC's AI implementation and go-to-market lab. Students build whatever AI a company or nonprofit needs, anywhere in the world: automations, CRMs, outbound, agents and training. They learn it by shipping it.",
    images: ["/tts/brand/og-a15.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png?v=15", type: "image/png" },
      { url: "/favicon.ico?v=15" },
    ],
    shortcut: "/favicon.png?v=15",
    apple: "/apple-touch-icon.png?v=15",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Trojan Tech Solutions",
              url: "https://www.usctts.com",
              logo: {
                "@type": "ImageObject",
                url: "https://www.usctts.com/favicon.png",
                width: 512,
                height: 512,
              },
              sameAs: [
                "https://www.instagram.com/trojantechsolutions",
                "https://www.linkedin.com/company/trojan-tech-solutions/",
              ],
            }),
          }}
        />
      </head>
      <body className={`min-h-full bg-white antialiased`}>
        {children}
        <Toaster theme="light" />
      </body>
    </html>
  );
}
