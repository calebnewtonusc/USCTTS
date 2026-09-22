"use client";

import React from "react";
import Link from "next/link";
import {
  Code2,
  Palette,
  Users,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  PhoneCall,
  Calendar,
  RefreshCw,
  PackageCheck,
  HeartHandshake,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

const CTA_BG = "linear-gradient(135deg, #99A6F9 0%, #F07860 100%)";
const PURPLE = "#99A6F9";

const ROLES = [
  {
    Icon: Code2,
    title: "Developers & Engineers",
    description: "Build real-world applications using modern tech stacks. Work on full-stack web apps, mobile solutions, and AI/ML projects.",
    tags: ["React", "Python", "Node.js", "Machine Learning"],
    accent: "linear-gradient(135deg, #99A6F9, #F07860)",
  },
  {
    Icon: Palette,
    title: "Designers & Product",
    description: "Create intuitive user experiences and beautiful interfaces. Lead product strategy and design thinking workshops.",
    tags: ["UI/UX Design", "Figma", "User Research", "Product Strategy"],
    accent: "linear-gradient(135deg, #F07860, #99A6F9)",
  },
  {
    Icon: Users,
    title: "Project Managers",
    description: "Coordinate teams, manage timelines, and ensure successful project delivery. Interface directly with clients.",
    tags: ["Agile", "Communication", "Stakeholder Management", "Planning"],
    accent: "linear-gradient(135deg, #99A6F9, #F07860)",
  },
  {
    Icon: MessageSquare,
    title: "Business & Strategy",
    description: "Work on client relationships, marketing, and organizational growth. Help us expand our impact and reach.",
    tags: ["Marketing", "Strategy", "Partnerships", "Communications"],
    accent: "linear-gradient(135deg, #F07860, #99A6F9)",
  },
];

const WHY_JOIN = [
  "Real consulting experience with actual clients",
  "Build your portfolio with meaningful projects",
  "Develop leadership and technical skills",
  "Network with industry professionals and alumni",
  "Flexible commitment that works with your schedule",
  "Make tangible impact in your community",
];

const ORG_TYPES = [
  {
    title: "Nonprofits",
    description: "We help mission-driven organizations leverage technology to amplify their social impact.",
    accent: "linear-gradient(135deg, #99A6F9, #F07860)",
  },
  {
    title: "Social Enterprises",
    description: "Partner with us to build sustainable tech solutions that support your business model.",
    accent: "linear-gradient(135deg, #F07860, #99A6F9)",
  },
  {
    title: "Community Groups",
    description: "We work with local organizations to address community needs through technology.",
    accent: "linear-gradient(135deg, #99A6F9, #F07860)",
  },
];

const PROCESS_STEPS = [
  {
    num: "01",
    Icon: PhoneCall,
    title: "Contact Us",
    subtitle: "Tell us about your needs",
    description: "Fill out our intake form with details about your organization, what you're looking for, and your timeline. We'll review your submission and assess whether we're a good fit for your project.",
    accent: "linear-gradient(135deg, #99A6F9, #F07860)",
    lightAccent: "#eef0fe",
    borderColor: "#99A6F9",
    link: "/work-with-us/form",
    linkLabel: "Start Here",
  },
  {
    num: "02",
    Icon: Calendar,
    title: "Consultation Meeting",
    subtitle: "Align on scope and vision",
    description: "We schedule a call to dig deeper into your goals, constraints, and success criteria. Together we define the project scope, deliverables, and a realistic timeline.",
    accent: "#F07860",
    lightAccent: "#fef0ea",
    borderColor: "#F07860",
    link: null,
    linkLabel: null,
  },
  {
    num: "03",
    Icon: RefreshCw,
    title: "Weekly Check-ins",
    subtitle: "Transparent progress updates",
    description: "Your dedicated team holds structured weekly syncs to share progress, gather feedback, and course-correct early. You stay informed at every stage without managing day-to-day execution.",
    accent: "linear-gradient(135deg, #F07860, #99A6F9)",
    lightAccent: "#fef0ea",
    borderColor: "#F07860",
    link: null,
    linkLabel: null,
  },
  {
    num: "04",
    Icon: PackageCheck,
    title: "Solution Delivered",
    subtitle: "Handoff with full documentation",
    description: "We deliver the final product with complete documentation, training materials, and a thorough handoff session. Everything is built to be maintained by your team independently.",
    accent: "#99A6F9",
    lightAccent: "#eef0fe",
    borderColor: "#99A6F9",
    link: null,
    linkLabel: null,
  },
  {
    num: "05",
    Icon: HeartHandshake,
    title: "Continued Support",
    subtitle: "We stay in your corner",
    description: "Our relationship doesn't end at delivery. We provide a post-launch support period for bug fixes, updates, and questions. Many of our partners continue working with us on follow-on projects.",
    accent: "linear-gradient(135deg, #F07860, #99A6F9)",
    lightAccent: "#eef0fe",
    borderColor: "#99A6F9",
    link: null,
    linkLabel: null,
  },
];


export default function WorkWithUs() {
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
          Work With Us
        </h1>
        <p className="text-base text-gray-900 max-w-md mx-auto leading-relaxed relative z-10">
          Whether you&apos;re a student looking to contribute or an organization seeking tech solutions, we&apos;d love to connect.
        </p>
      </section>

      {/* For Students */}
      <section className="px-6 py-20 border-t-2 border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-center text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">[ JOIN_THE_TEAM ]</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">For Students</h2>
            <p className="text-base text-gray-900 max-w-md mx-auto leading-relaxed">
              Join a community of passionate students making real impact. No application process, everyone is welcome.
            </p>
            <p className="text-sm font-semibold mt-3" style={{ color: PURPLE }}>
              Fall Session starts in August.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 border-2 border-gray-300 bg-gray-300">
            {ROLES.map(({ Icon, title, description, tags, accent }) => (
              <div key={title} className="bg-white p-6 hover:bg-gray-100 transition-colors duration-150">
                <div className="w-10 h-10 flex items-center justify-center mb-4" style={{ background: accent }}>
                  <Icon size={18} color="white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-900 leading-relaxed mb-4">{description}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="text-xs font-medium px-2.5 py-1 border tts-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="px-6 py-16 bg-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="border-2 border-gray-300 bg-white p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8 tracking-tight">Why Join?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WHY_JOIN.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle size={18} color={PURPLE} className="flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-900 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Organizations */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">For Organizations</h2>
            <p className="text-base text-gray-900 max-w-md mx-auto leading-relaxed">
              Hand us the thing that keeps sliding because it is nobody's first priority. Free for this cohort.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5 border-2 border-gray-300 bg-gray-300">
            {ORG_TYPES.map(({ title, description, accent }) => (
              <div key={title} className="bg-white p-6 hover:bg-gray-100 transition-colors duration-150">
                <div className="w-8 h-1.5 mb-4" style={{ background: accent }} />
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-900 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process — 5 Steps */}
      <section className="px-6 py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">[ HOW_IT_WORKS ]</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">Our Process</h2>
            <p className="text-base text-gray-900 max-w-md mx-auto leading-relaxed">
              From first contact to continued support, here&apos;s what working with TTS looks like.
            </p>
          </div>

          {/* Step detail cards */}
          <div className="flex flex-col gap-0.5 border-2 border-gray-300 bg-gray-300">
            {PROCESS_STEPS.map(({ num, Icon, title, subtitle, description, accent, lightAccent, borderColor, link, linkLabel }) => (
              <div key={num} className="bg-white p-6 md:p-8 hover:bg-gray-100 transition-colors duration-150">
                <div className="flex items-start gap-5">
                  <div
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                    style={{ background: accent }}
                  >
                    <Icon size={18} color="white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className="text-xs font-bold tracking-widest"
                        style={{ color: "#9CA3AF" }}
                      >
                        STEP {num}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-0.5">{title}</h3>
                    <p className="text-xs font-semibold mb-2" style={{ color: PURPLE }}>{subtitle}</p>
                    <p className="text-sm text-gray-900 leading-relaxed">{description}</p>
                    {link && linkLabel && (
                      <Link
                        href={link}
                        className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold no-underline transition-colors duration-150"
                        style={{ color: PURPLE }}
                      >
                        {linkLabel} <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                  <div
                    className="hidden md:flex items-center justify-center w-10 h-10 flex-shrink-0 border-2 text-lg font-black"
                    style={{
                      background: lightAccent,
                      borderColor,
                      color: borderColor,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {num}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/work-with-us/form"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white no-underline transition-all duration-200 hover:opacity-90"
              style={{ background: CTA_BG }}
            >
              Start a Project <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
