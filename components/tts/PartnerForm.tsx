"use client";

import { useState } from "react";
import Link from "next/link";
import { Choices, describe, EMAIL, Field, focusFirstError, postJson, useForm, type Errors, FormFailure, asText } from "./forms";

// Values must match the enum in app/api/partner/route.ts exactly.
const TYPES = [
  { value: "Sponsor", label: "Sponsor the club" },
  { value: "Speaker", label: "Speak at a meeting" },
  { value: "Recruiting", label: "Recruit from the club" },
  { value: "Client Project", label: "A project for us to build" },
  { value: "Other", label: "Something else" },
] as const;
type PartnerType = (typeof TYPES)[number]["value"];
type Key = "orgName" | "contactName" | "email" | "partnerType" | "description";

export default function PartnerForm() {
  const { values, set } = useForm({ orgName: "", contactName: "", email: "", partnerType: "" as PartnerType | "", description: "" });
  const [errors, setErrors] = useState<Errors<Key>>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Errors<Key> = {};
    if (!values.orgName.trim()) e.orgName = "Add the company or organization name.";
    if (!values.contactName.trim()) e.contactName = "Add your name.";
    if (!EMAIL.test(values.email.trim())) e.email = "Add an email we can reply to.";
    if (!values.partnerType) e.partnerType = "Pick the closest one.";
    if (values.description.trim().length < 10) e.description = "A sentence or two is enough.";
    setErrors(e);
    setFailure(null);
    if (Object.keys(e).length) return focusFirstError();
    setSending(true);
    const err = await postJson("/api/partner", values);
    setSending(false);
    if (err) setFailure(err);
    else setDone(true);
  };

  if (done) {
    return (
      <div className="form-done" role="status">
        <h2 className="t-h3">Thanks, {values.contactName.split(" ")[0]}.</h2>
        <p>We have it, and we will reply to {values.email.trim()}.</p>
        <p>
          <Link className="link" href="/members">
            Meet the people who will read it
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Choices name="partnerType" legend="What did you have in mind" options={TYPES.map((t) => ({ value: t.value, label: t.label }))} value={values.partnerType} onChange={(v) => set("partnerType", v)} error={errors.partnerType} />
      <Field id="orgName" label="Company or organization" error={errors.orgName}>
        <input className="input" autoComplete="organization" value={values.orgName} onChange={(e) => set("orgName", e.target.value)} {...describe("orgName", false, errors.orgName)} />
      </Field>
      <Field id="contactName" label="Your name" error={errors.contactName}>
        <input className="input" autoComplete="name" value={values.contactName} onChange={(e) => set("contactName", e.target.value)} {...describe("contactName", false, errors.contactName)} />
      </Field>
      <Field id="email" label="Email" error={errors.email}>
        <input className="input" type="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} {...describe("email", false, errors.email)} />
      </Field>
      <Field id="description" label="Tell us more" error={errors.description}>
        <textarea className="input" maxLength={2000} value={values.description} onChange={(e) => set("description", e.target.value)} {...describe("description", false, errors.description)} />
      </Field>
      {failure && <FormFailure message={failure} subject="Partnering with TTS" body={asText(values)} />}
      <div>
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? "Sending" : "Send"}
        </button>
      </div>
    </form>
  );
}
