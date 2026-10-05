/** @type {import('next').NextConfig} */

// T Combinator moved to its own deployment on 2026-10-04. TTS links only to
// /tc on its own host, and this sends that path on. Unset, there is no
// redirect and components/tts/links.ts renders every mention as text (the
// Railway host answered "Application not found" on 2026-10-04; see links.ts).
const TC_ORIGIN = process.env.NEXT_PUBLIC_TC_ORIGIN ?? "";

const nextConfig = {
  images: {
    unoptimized: false,
  },
  async redirects() {
    // Caleb, 2026-10-04: "Why are about and home 2 diff pages?" They said the
    // same thing twice, so the home page is the about page now.
    // Caleb, same night: "Build tab shouldn't exist if we already have the
    // main page and the apply tab", and the old meeting slides were "ai
    // slop". Both routes are gone and their old links land on home.
    const about = [
      { source: "/about", destination: "/", permanent: true },
      { source: "/build", destination: "/", permanent: true },
      { source: "/build/:path*", destination: "/", permanent: true },
      { source: "/meetings", destination: "/", permanent: true },
      { source: "/meetings/:path*", destination: "/", permanent: true },
    ];
    if (!TC_ORIGIN) return about;
    return [
      ...about,
      { source: "/tc", destination: TC_ORIGIN, permanent: false },
      { source: "/tc/:path*", destination: `${TC_ORIGIN}/:path*`, permanent: false },
    ];
  },
};

export default nextConfig;
