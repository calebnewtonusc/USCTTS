// The application lives on a Google Form (Caleb, 2026-10-05). Set
// NEXT_PUBLIC_APPLY_FORM_URL to the form's link to open applications; while
// it's empty, /apply says applications are closed and offers the email
// signup instead. No open date is on record, so the site never states one.
export const APPLY_FORM_URL = process.env.NEXT_PUBLIC_APPLY_FORM_URL ?? "";
export const APPLICATIONS_OPEN = Boolean(APPLY_FORM_URL);
