"use client";

import { useState } from "react";
import Link from "next/link";
import { Choices, describe, EMAIL, Field, focusFirstError, postJson, useForm, type Errors, FormFailure, asText, FormFigure, type FormState } from "./forms";

// Plain words for an owner who doesn't know AI. The API stores these as free
// strings, so the wording can change without touching it.
const SERVICES = [
  "Answering the same emails",
  "Keeping track of leads and customers",
  "Reports someone builds by hand",
  "Finding people to sell to",
  "Teaching my team to use AI",
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
  const [copied, setCopied] = useState(false);

  // When the send fails, the answers can still leave the page by hand.
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(asText(values));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  // The same rules submit() enforces, per field, for the live figure.
  const ok = {
    orgName: Boolean(values.orgName.trim()),
    orgDescription: values.orgDescription.trim().length >= 10,
    services: values.services.length > 0,
    timeline: Boolean(values.timeline),
    contactName: Boolean(values.contactName.trim()),
    contactEmail: EMAIL.test(values.contactEmail.trim()),
  };
  const state: FormState = done ? "sent" : sending ? "sending" : failure ? "failed" : "idle";
  const figure = (
    <FormFigure
      rows={[
        { key: "orgDescription", label: "The problem" },
        { key: "services", label: "Closest match" },
        { key: "timeline", label: "When" },
        { key: "orgName", label: "Company" },
        { key: "contactName", label: "Your name" },
        { key: "contactEmail", label: "Your email" },
      ]}
      ok={ok}
      dest="First reply: yes or no"
      caption="Each answer lights once it passes the same check the form runs when you send it."
    />
  );

  const toggleService = (s: Service) =>
    set("services", values.services.includes(s) ? values.services.filter((x) => x !== s) : [...values.services, s]);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Errors<Key> = {};
    if (!values.orgName.trim()) e.orgName = "Add the company or organization name.";
    if (values.orgDescription.trim().length < 10) e.orgDescription = "Tell us what it is in a sentence or two.";
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
      <div className="pg-form" data-state={state}>
      <div className="form-done" role="status">
        <h2 className="t-h3">Thanks, it&apos;s with us.</h2>
        <p>
          {`We'll read what ${values.orgName.trim()} sent and reply to ${values.contactEmail.trim()}. If it's work we can't finish, we'll say so in that first reply.`}
        </p>
        <p>
          <Link className="link" href="/">
            Back to the homepage
          </Link>
        </p>
      </div>
      {figure}
      </div>
    );
  }

  return (
    <div className="pg-form" data-state={state}>
    <form className="form" onSubmit={submit} noValidate>
      <Field id="orgDescription" label="What's eating your team's time?" hint="What happens today, and what you wish happened instead. Plain words are perfect." error={errors.orgDescription}>
        <textarea className="input" value={values.orgDescription} maxLength={2000} onChange={(e) => set("orgDescription", e.target.value)} {...describe("orgDescription", true, errors.orgDescription)} />
      </Field>
      <Choices name="services" legend="Which of these sounds closest?" options={SERVICES.map((s) => ({ value: s, label: s }))} multiple selected={values.services} onChange={toggleService} error={errors.services} />
      <Choices name="timeline" legend="When do you want help?" options={TIMELINES.map((t) => ({ value: t, label: t }))} value={values.timeline} onChange={(v) => set("timeline", v)} error={errors.timeline} />
      <Field id="orgName" label="Company or organization" error={errors.orgName}>
        <input className="input" autoComplete="organization" value={values.orgName} onChange={(e) => set("orgName", e.target.value)} {...describe("orgName", false, errors.orgName)} />
      </Field>
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
      {failure && (
        <>
          <FormFailure message={failure} subject="A project for TTS" body={asText(values)} />
          <button type="button" className="btn btn-secondary pg-copy" onClick={copy}>
            {copied ? "Copied, paste it into a message to us" : "Copy my answers"}
          </button>
        </>
      )}
      <div>
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? "Sending" : "Send it"}
        </button>
      </div>
    </form>
    {figure}
    </div>
  );
}
