"use client";

import { useState } from "react";
import Link from "next/link";
import { LEADERSHIP } from "@/data/people";
import { Choices, describe, EMAIL, Field, focusFirstError, postJson, useForm, type Errors, FormFailure, asText, FormFigure, type FormState } from "./forms";

// The stored values must match the enum in app/api/apply/route.ts, which
// still accepts Building, Consulting, Growing and Unsure. The labels say what
// the work is now that TTS does whatever AI work a company needs: building it,
// or getting a company to use it. "Growing" was labelled "GTM engineering"
// before; the value stays so the applications table reads the same.
const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"] as const;
const TRACKS = [
  { value: "Building", label: "Building it: automations, agents, tools" },
  { value: "Growing", label: "Getting it used: CRM, outreach, teaching a team" },
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

  // The same rules validate() enforces, per field, for the live figure.
  const ok = {
    name: Boolean(values.name.trim()),
    email: EMAIL.test(values.email.trim()),
    major: Boolean(values.major.trim()),
    year: Boolean(values.year),
    track: Boolean(values.track),
    why: values.why.trim().length >= 20 && values.why.length <= 1000,
  };
  const state: FormState = done ? "sent" : sending ? "sending" : failure ? "failed" : "idle";
  const readers = LEADERSHIP.map((p) => p.name.split(" ")[0]);
  const figure = (
    <FormFigure
      rows={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "major", label: "Major" },
        { key: "year", label: "Year" },
        { key: "track", label: "Kind of work" },
        { key: "why", label: "One thing you made" },
      ]}
      ok={ok}
      dest={`Read by ${readers.slice(0, -1).join(", ")} and ${readers[readers.length - 1]}`}
      caption="Each answer lights once it passes the same check the form runs when you send it."
    />
  );

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
      <div className="pg-form" data-state={state}>
      <div className="form-done" role="status">
        <h2 className="t-h3">Got it, {values.name.split(" ")[0]}.</h2>
        <p>
          {`Your application is in. One of the people running the club reads every one, and you'll hear back at ${values.email.trim()} whether it's a yes or a no.`}
        </p>
        <p>
          <Link className="link" href="/members">
            Meet the people who&apos;ll read it
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
      <Choices name="track" legend="Which kind of work do you want to do?" options={TRACKS.map((t) => ({ value: t.value, label: t.label }))} value={values.track} onChange={(v) => set("track", v)} error={errors.track} />
      <Field
        id="why"
        label="One thing you have made, or want to make"
        hint="A project, a script, a spreadsheet that got out of hand. Link it if it lives somewhere."
        error={errors.why}
      >
        <textarea className="input" value={values.why} maxLength={1000} onChange={(e) => set("why", e.target.value)} {...describe("why", true, errors.why)} />
      </Field>
      {failure && (
        <>
          <FormFailure message={failure} subject="Application to TTS" body={asText(values)} />
          <button type="button" className="btn btn-secondary pg-copy" onClick={copy}>
            {copied ? "Copied, paste it into a message to us" : "Copy my answers"}
          </button>
        </>
      )}
      <div>
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? "Sending" : "Send application"}
        </button>
      </div>
    </form>
    {figure}
    </div>
  );
}
