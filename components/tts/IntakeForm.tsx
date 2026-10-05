"use client";

import { useState } from "react";
import Link from "next/link";
import { Choices, describe, EMAIL, Field, focusFirstError, postJson, useForm, type Errors, FormFailure, asText } from "./forms";

const SERVICES = [
  "An internal tool",
  "Automating a manual process",
  "Data, CRM or dashboards",
  "Lists, enrichment or outbound",
  "Something else",
] as const;
const TIMELINES = ["This semester", "Next semester", "Not sure yet"] as const;

type Service = (typeof SERVICES)[number];
type Timeline = (typeof TIMELINES)[number];
type Key = "orgName" | "orgDescription" | "services" | "timeline" | "contactName" | "contactEmail";

export default function IntakeForm() {
  const { values, set } = useForm({
    orgName: "",
    orgDescription: "",
    services: [] as Service[],
    timeline: "" as Timeline | "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    additionalNotes: "",
  });
  const [errors, setErrors] = useState<Errors<Key>>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const toggleService = (s: Service) =>
    set("services", values.services.includes(s) ? values.services.filter((x) => x !== s) : [...values.services, s]);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Errors<Key> = {};
    if (!values.orgName.trim()) e.orgName = "Add the company or organization name.";
    if (values.orgDescription.trim().length < 10) e.orgDescription = "Describe the problem in a sentence or two.";
    if (!values.services.length) e.services = "Pick at least one, or Something else.";
    if (!values.timeline) e.timeline = "Pick one, or Not sure yet.";
    if (!values.contactName.trim()) e.contactName = "Add the name of the person we should talk to.";
    if (!EMAIL.test(values.contactEmail.trim())) e.contactEmail = "Add an email we can reply to.";
    setErrors(e);
    setFailure(null);
    if (Object.keys(e).length) return focusFirstError();
    setSending(true);
    const err = await postJson("/api/intake", {
      ...values,
      contactPhone: values.contactPhone || undefined,
      additionalNotes: values.additionalNotes || undefined,
    });
    setSending(false);
    if (err) setFailure(err);
    else setDone(true);
  };

  if (done) {
    return (
      <div className="form-done" role="status">
        <h2 className="t-h3">Thanks. It is with us.</h2>
        <p>
          We will read what {values.orgName.trim()} sent and reply to {values.contactEmail.trim()}. If it is work we
          cannot finish, we will say so in that first reply.
        </p>
        <p>
          <Link className="link" href="/">
            Back to the homepage
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field id="orgName" label="Company or organization" error={errors.orgName}>
        <input className="input" autoComplete="organization" value={values.orgName} onChange={(e) => set("orgName", e.target.value)} {...describe("orgName", false, errors.orgName)} />
      </Field>
      <Field id="orgDescription" label="What is the problem?" hint="What happens today, and what you wish happened instead." error={errors.orgDescription}>
        <textarea className="input" value={values.orgDescription} maxLength={2000} onChange={(e) => set("orgDescription", e.target.value)} {...describe("orgDescription", true, errors.orgDescription)} />
      </Field>
      <Choices name="services" legend="What kind of work" options={SERVICES.map((s) => ({ value: s, label: s }))} multiple selected={values.services} onChange={toggleService} error={errors.services} />
      <Choices name="timeline" legend="When" options={TIMELINES.map((t) => ({ value: t, label: t }))} value={values.timeline} onChange={(v) => set("timeline", v)} error={errors.timeline} />
      <Field id="contactName" label="Your name" error={errors.contactName}>
        <input className="input" autoComplete="name" value={values.contactName} onChange={(e) => set("contactName", e.target.value)} {...describe("contactName", false, errors.contactName)} />
      </Field>
      <Field id="contactEmail" label="Your email" error={errors.contactEmail}>
        <input className="input" type="email" autoComplete="email" value={values.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} {...describe("contactEmail", false, errors.contactEmail)} />
      </Field>
      <Field id="contactPhone" label="Phone, if you prefer a call" hint="Optional.">
        <input className="input" type="tel" autoComplete="tel" maxLength={30} value={values.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} {...describe("contactPhone", true)} />
      </Field>
      <Field id="additionalNotes" label="Anything else" hint="Optional.">
        <textarea className="input" maxLength={2000} value={values.additionalNotes} onChange={(e) => set("additionalNotes", e.target.value)} {...describe("additionalNotes", true)} />
      </Field>
      {failure && <FormFailure message={failure} subject="A project for TTS" body={asText(values)} />}
      <div>
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? "Sending" : "Send it"}
        </button>
      </div>
    </form>
  );
}
