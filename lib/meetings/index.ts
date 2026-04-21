// =====================================================================
// Meeting registry.
// To add a new meeting:
//   1. Create `meeting-XX.ts` (copy `_TEMPLATE.ts`).
//   2. Import it below.
//   3. Add it to the MEETINGS array. Order does not matter; the list
//      page sorts by number descending.
// =====================================================================

import type { Meeting } from "./types";
import { meeting01 } from "./meeting-01";
import { meeting02 } from "./meeting-02";
import { meeting03 } from "./meeting-03";

export type { Meeting, Slide, Person } from "./types";
export { COLOR } from "./types";

export const MEETINGS: Meeting[] = [meeting01, meeting02, meeting03];

export function getMeeting(slug: string): Meeting | undefined {
  return MEETINGS.find((m) => m.slug === slug);
}

export function meetingSlugs(): string[] {
  return MEETINGS.map((m) => m.slug);
}
