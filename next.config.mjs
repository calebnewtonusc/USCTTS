/** @type {import('next').NextConfig} */

// T Combinator moved to its own deployment on 2026-10-04. TTS links only to
// /tc on its own host, and this sends that path on. With no origin set there
// is no redirect, and components/tts/links.ts renders every mention as text.
const TC_ORIGIN = process.env.NEXT_PUBLIC_TC_ORIGIN ?? "";

const nextConfig = {
  images: {
    unoptimized: false,
  },
  async redirects() {
    if (!TC_ORIGIN) return [];
    return [
      { source: "/tc", destination: TC_ORIGIN, permanent: false },
      { source: "/tc/:path*", destination: `${TC_ORIGIN}/:path*`, permanent: false },
    ];
  },
};

export default nextConfig;
