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
  title: "Trojan Tech Solutions | USC's AI implementation lab",
  description:
    "USC's AI implementation lab. Members build AI into real organizations, from GTM engines and agents for companies to an AI curriculum for students.",
  openGraph: {
    title: "Trojan Tech Solutions",
    description:
      "USC's AI implementation lab. Members build AI into real organizations, from GTM engines and agents for companies to an AI curriculum for students.",
    url: "https://www.usctts.com",
    siteName: "Trojan Tech Solutions",
    type: "website",
    images: [
      {
        url: "/img/tts-logo.png",
        width: 512,
        height: 512,
        alt: "Trojan Tech Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trojan Tech Solutions",
    description:
      "USC's AI implementation lab. Members build AI into real organizations, from GTM engines and agents for companies to an AI curriculum for students.",
    images: ["/img/tts-logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
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
                url: "https://www.usctts.com/img/tts-logo.png",
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
