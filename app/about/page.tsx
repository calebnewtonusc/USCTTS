"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

const PHILOSOPHY = [
  {
    prefix: "Everyone can",
    keyword: "learn",
    body: "We believe technology education should be accessible to all students, regardless of their background or experience level. Through our comprehensive lecture series and dedicated mentorship program, members can develop skills in software development, data science, AI/ML, product design, and project management.",
  },
  {
    prefix: "Everyone can",
    keyword: "build",
    body: "There's no barrier to entry at TTS. Whether you're a first-year student just starting your tech journey or a seasoned developer, all students have the opportunity to gain hands-on experience on real consulting projects. We believe the best way to learn is by doing.",
  },
  {
    prefix: "Everyone can",
    keyword: "enjoy",
    body: "We implement. A consulting engagement at USC almost always ends with a deck and a recommendation, and then everybody graduates. Ours ends with a tool that runs without us, the person on your team who owns it, the SOP written down, and a number measured before and after. If we cannot hand over those four things, we did not do the work.",
  },
];

const VALUES = [
  {
    title: "Accessibility",
    description: "Our first cohort is free, because our builders want the work on their resume more than they want the money. That changes in the spring, and it does not change for anyone we have already started with.",
    accent: "linear-gradient(135deg, #99A6F9, #F07860)",
  },
  {
    title: "Excellence",
    description: "We deliver professional-grade solutions with the same quality standards as top consulting firms, ensuring real impact for our partners.",
    accent: "linear-gradient(135deg, #F07860, #99A6F9)",
  },
  {
    title: "Growth",
    description: "We create opportunities for students to develop technical and leadership skills while making a tangible difference in their community.",
    accent: "linear-gradient(135deg, #99A6F9, #F07860)",
  },
];

export default function AboutPage() {
  return (
    <div className="tts-inner-page font-sans bg-white text-gray-900 min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative text-center px-6 pt-20 pb-16 overflow-hidden tts-hero-bg">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "300px 300px",
            opacity: 0.06,
            mixBlendMode: "overlay",
          }}
        />
        <h1
          className="font-bold tracking-tight leading-none mb-4 relative z-10"
          style={{
            fontSize: "clamp(2.5rem,7vw,4.5rem)",
            background: "linear-gradient(180deg, #99A6F9 0%, #F07860 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          About Us
        </h1>
        <p className="text-base text-gray-900 max-w-md mx-auto leading-relaxed relative z-10">
          A student-run organization at USC dedicated to leveraging technology and AI for social impact.
        </p>
      </section>

      {/* Philosophy */}
      <section className="px-6 py-20 border-t-2 border-gray-200">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-semibold text-gray-400 tracking-widest uppercase mb-5">[ OUR_PHILOSOPHY ]</p>
          <h2 className="text-2xl md:text-3xl text-gray-900 text-center mb-16 tracking-tight">
            At TTS,{" "}
            <span className="font-monoska" style={{ background: "rgba(153,166,249,0.3)", padding: "2px 8px", display: "inline" }}>
              Tech is for everyone.
            </span>
          </h2>
          <div className="flex flex-col gap-0 border-2 border-gray-300">
            {PHILOSOPHY.map(({ prefix, keyword, body }) => (
              <div key={keyword} className="p-8 border-b-2 border-gray-300 last:border-b-0">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {prefix}{" "}
                  <span
                    style={{
                      background: "linear-gradient(180deg, #99A6F9 0%, #F07860 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      display: "inline-block",
                    }}
                  >
                    {keyword}
                  </span>
                </h3>
                <p className="text-base text-gray-900 leading-relaxed mb-3">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">What We Stand For</h2>
            <p className="text-base text-gray-900 max-w-md mx-auto leading-relaxed">
              Our values guide every project we take on and every relationship we build.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5 border-2 border-gray-300 bg-gray-300">
            {VALUES.map(({ title, description, accent }) => (
              <div key={title} className="bg-white p-6">
                <div className="w-8 h-1.5 mb-4" style={{ background: accent }} />
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-900 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-10 text-center">Our Story</h2>
          <div className="flex flex-col gap-6 text-base text-gray-900 leading-relaxed">
            <p>
              Founded by USC students who saw the gap between cutting-edge technology and the organizations that needed it most, Trojan Technology Solutions has grown into a thriving community of changemakers.
            </p>
            <p>
              What started as a small group of students working on a single project has evolved into a comprehensive consulting organization, completing over 15 projects for partner organizations across education, healthcare, environmental sustainability, and social justice.
            </p>
            <p>
              Today, we continue to push the boundaries of what&apos;s possible when technology meets purpose, empowering both our student members and our community partners to achieve more together.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
