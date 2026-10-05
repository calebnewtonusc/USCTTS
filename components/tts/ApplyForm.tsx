"use client";

import { useState } from "react";
import Link from "next/link";
import { Choices, describe, EMAIL, Field, focusFirstError, postJson, useForm, type Errors, FormFailure, asText } from "./forms";

// Values must match the enums in app/api/apply/route.ts exactly.
const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"] as const;
const TRACKS = [
  { value: "Building", label: "Engineering" },
  { value: "Growing", label: "GTM engineering" },
  { value: "Unsure", label: "Not sure yet" },
] as const;

type Year = (typeof YEARS)[number];
type Track = (typeof TRACKS)[number]["value"];
type Key = "name" | "email" | "major" | "year" | "track" | "why";

export default function ApplyForm() {
  const { values, set } = useForm({ name: "", email: "", major: "", year: "" as Year | "", track: "" as Track | "", why: "" });
  const [errors, setErrors] = useState<Errors<Key>>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const validate = () => {
    const e: Errors<Key> = {};
    if (!values.name.trim()) e.name = "Add your name.";
    if (!EMAIL.test(values.email.trim())) e.email = "Add an email we can reply to, like tommy@usc.edu.";
    if (!values.major.trim()) e.major = "Add your major, or undeclared.";
    if (!values.year) e.year = "Pick your year.";
    if (!values.track) e.track = "Pick one, or Not sure yet.";
    if (values.why.trim().length < 20) e.why = "Tell us about one thing, in a sentence or two at least.";
    if (values.why.length > 1000) e.why = "Keep it under 1,000 characters.";
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setFailure(null);
    if (Object.keys(e).length) return focusFirstError();
    setSending(true);
    const err = await postJson("/api/apply", { ...values, name: values.name.trim(), email: values.email.trim() });
    setSending(false);
    if (err) setFailure(err);
    else setDone(true);
  };

  if (done) {
    return (
      <div className="form-done" role="status">
        <h2 className="t-h3">Got it, {values.name.split(" ")[0]}.</h2>
        <p>
          Your application is in. One of the people running the club reads every one, and you will hear back at{" "}
          {values.email.trim()} whether it is a yes or a no.
        </p>
        <p>
          <Link className="link" href="/#run">
            In the meantime, watch the pipeline run
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field id="name" label="Name" error={errors.name}>
        <input className="input" autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} {...describe("name", false, errors.name)} />
      </Field>
      <Field id="email" label="Email" hint="Your USC address if you have one." error={errors.email}>
        <input className="input" type="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} {...describe("email", true, errors.email)} />
      </Field>
      <Field id="major" label="Major" error={errors.major}>
        <input className="input" value={values.major} onChange={(e) => set("major", e.target.value)} {...describe("major", false, errors.major)} />
      </Field>
      <Choices name="year" legend="Year" options={YEARS.map((y) => ({ value: y, label: y }))} value={values.year} onChange={(v) => set("year", v)} error={errors.year} />
      <Choices name="track" legend="Which half of the work" options={TRACKS.map((t) => ({ value: t.value, label: t.label }))} value={values.track} onChange={(v) => set("track", v)} error={errors.track} />
      <Field
        id="why"
        label="One thing you have made, or want to make"
        hint="A project, a script, a spreadsheet that got out of hand. Link it if it lives somewhere."
        error={errors.why}
      >
        <textarea className="input" value={values.why} maxLength={1000} onChange={(e) => set("why", e.target.value)} {...describe("why", true, errors.why)} />
      </Field>
      {failure && <FormFailure message={failure} subject="Application to TTS" body={asText(values)} />}
      <div>
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? "Sending" : "Send application"}
        </button>
      </div>
    </form>
  );
}
