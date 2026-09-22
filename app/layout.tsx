import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://usctts.com"),
  title: "Trojan Tech Solutions | USC's applied AI implementation lab",
  description:
    "USC's applied AI implementation lab. Every engagement ends with a working tool, a named owner, a written SOP, and a number that moved.",
  openGraph: {
    title: "Trojan Technology Solutions",
    description:
      "USC's applied AI implementation lab. Not a consulting club.",
    url: "https://usctts.com",
    siteName: "Trojan Technology Solutions",
    type: "website",
    images: [
      {
        url: "/img/tts-logo.png",
        width: 512,
        height: 512,
        alt: "Trojan Technology Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trojan Technology Solutions",
    description:
      "USC's applied AI implementation lab. Not a consulting club.",
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
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('tts-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Trojan Technology Solutions",
              url: "https://usctts.com",
              logo: {
                "@type": "ImageObject",
                url: "https://usctts.com/img/tts-logo.png",
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
        <Analytics />
      </body>
    </html>
  );
}
