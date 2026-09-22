"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

const PURPLE = "#99A6F9";
const CTA_BG = "linear-gradient(135deg, #99A6F9 0%, #F07860 100%)";

const SERVICE_OPTIONS = [
  "Web Application",
  "Mobile App",
  "AI / Machine Learning",
  "Data Analytics",
  "Automation / Scripting",
  "UI/UX Design",
  "Strategy & Consulting",
  "Other",
];

const TIMELINE_OPTIONS = [
  "1-2 months",
  "2-4 months",
  "4-6 months",
  "6+ months",
  "Flexible / Not sure",
];

type FormState = {
  orgName: string;
  orgDescription: string;
  services: string[];
  timeline: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  additionalNotes: string;
};

const EMPTY: FormState = {
  orgName: "",
  orgDescription: "",
  services: [],
  timeline: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  additionalNotes: "",
};

export default function ClientIntakeForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleService(s: string) {
    setForm((f) => ({
      ...f,
      services: f.services.includes(s)
        ? f.services.filter((x) => x !== s)
        : [...f.services, s],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.orgName || !form.orgDescription || !form.services.length || !form.timeline || !form.contactName || !form.contactEmail) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please email us directly at hello@usctts.com.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="font-sans bg-white text-gray-900 min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
          <div
            className="w-16 h-16 flex items-center justify-center mb-6"
            style={{ background: "linear-gradient(135deg, #99A6F9, #FE885C)" }}
          >
            <CheckCircle size={32} color="white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
            We&apos;ve got your submission.
          </h1>
          <p className="text-base text-gray-500 max-w-md leading-relaxed mb-8">
            Thank you for reaching out. Our team will review your project and get back to you within 48 hours to schedule a consultation call.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white no-underline"
            style={{ background: CTA_BG }}
          >
            Back to Home <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans bg-white text-gray-900 min-h-screen">
      <Navbar />

      {/* Hero */}
      <section
        className="relative text-center px-6 pt-16 pb-10 overflow-hidden border-b border-gray-100"
        style={{
          background: "radial-gradient(ellipse 90% 70% at 15% 0%, rgba(153,166,249,0.10) 0%, transparent 55%), #ffffff",
        }}
      >
        <h1
          className="font-bold tracking-tight leading-none mb-3"
          style={{
            fontSize: "clamp(28px,5vw,48px)",
            background: "linear-gradient(135deg, #99A6F9 0%, #FE885C 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Start a Project
        </h1>
        <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
          Tell us about your organization and what you need. We&apos;ll review and follow up within 48 hours.
        </p>
      </section>

      {/* Form */}
      <section className="px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} noValidate>

            {/* Organization */}
            <fieldset className="mb-10">
              <legend className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-6">
                [ 01 ] ABOUT YOUR ORGANIZATION
              </legend>
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Organization Name <span style={{ color: PURPLE }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.orgName}
                    onChange={(e) => set("orgName", e.target.value)}
                    placeholder="e.g. Kids Who Code LA"
                    className="w-full border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    What does your organization do? <span style={{ color: PURPLE }}>*</span>
                  </label>
                  <textarea
                    value={form.orgDescription}
                    onChange={(e) => set("orgDescription", e.target.value)}
                    placeholder="Describe your mission, who you serve, and the problem you're trying to solve with technology..."
                    rows={4}
                    className="w-full border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors resize-none"
                    required
                  />
                </div>
              </div>
            </fieldset>

            {/* Services */}
            <fieldset className="mb-10">
              <legend className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-6">
                [ 02 ] WHAT ARE YOU LOOKING FOR?
              </legend>
              <p className="text-sm text-gray-500 mb-4">Select all that apply. <span style={{ color: PURPLE }}>*</span></p>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_OPTIONS.map((s) => {
                  const selected = form.services.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleService(s)}
                      className="px-4 py-2.5 text-sm font-medium text-left border transition-all duration-150 cursor-pointer"
                      style={{
                        background: selected ? "#F5F3FF" : "#fff",
                        borderColor: selected ? "#C4B5FD" : "#D1D5DB",
                        color: selected ? PURPLE : "#374151",
                      }}
                    >
                      {selected && <CheckCircle size={13} className="inline mr-1.5 mb-0.5" />}
                      {s}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Timeline */}
            <fieldset className="mb-10">
              <legend className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-6">
                [ 03 ] YOUR TIMELINE
              </legend>
              <p className="text-sm text-gray-500 mb-4">When do you need this completed? <span style={{ color: PURPLE }}>*</span></p>
              <div className="flex flex-wrap gap-2">
                {TIMELINE_OPTIONS.map((t) => {
                  const selected = form.timeline === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set("timeline", t)}
                      className="px-4 py-2 text-sm font-medium border transition-all duration-150 cursor-pointer"
                      style={{
                        background: selected ? "#F5F3FF" : "#fff",
                        borderColor: selected ? "#C4B5FD" : "#D1D5DB",
                        color: selected ? PURPLE : "#374151",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Contact */}
            <fieldset className="mb-10">
              <legend className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-6">
                [ 04 ] YOUR CONTACT INFORMATION
              </legend>
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Full Name <span style={{ color: PURPLE }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.contactName}
                      onChange={(e) => set("contactName", e.target.value)}
                      placeholder="Jane Smith"
                      className="w-full border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email Address <span style={{ color: PURPLE }}>*</span>
                    </label>
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => set("contactEmail", e.target.value)}
                      placeholder="jane@example.org"
                      className="w-full border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={form.contactPhone}
                    onChange={(e) => set("contactPhone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Anything else we should know? <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.additionalNotes}
                    onChange={(e) => set("additionalNotes", e.target.value)}
                    placeholder="Budget constraints, prior attempts, specific requirements, links to existing work..."
                    rows={3}
                    className="w-full border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors resize-none"
                  />
                </div>
              </div>
            </fieldset>

            {error && (
              <p className="text-sm text-red-500 mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              style={{ background: CTA_BG }}
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Submitting...</>
              ) : (
                <>Submit Project Request <ArrowRight size={15} /></>
              )}
            </button>
            <p className="text-xs text-gray-400 mt-3">We respond within 48 hours. This cohort is free.</p>
          </form>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
