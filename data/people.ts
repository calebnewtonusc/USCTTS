// The single source of truth for every person on both sites.
//
// TTS and T Combinator are two sites, one organization: same team, same
// advisors, same alumni network. Duplicating these lists is how they drift,
// so both sites import from here and neither one owns the data.
//
// `status` exists because the roster shrank to three people in September 2026
// and Caleb asked for the rest to be kept rather than deleted. An inactive
// member is not rendered on the public roster; they are one field away from
// coming back.

export type Status = "active" | "inactive" | "advisor" | "alumni";

export interface Person {
  name: string;
  role: string;
  status: Status;
  photo?: string;
  link?: string;
  /** Where they work now. Advisors and alumni only. */
  company?: string;
  /** Path to the company mark, when one is on disk. */
  logo?: string;
  /** Earlier employers, so the network wall can show them too. Sourced only. */
  past?: string[];
  /** One or two sourced lines of background, for the team cards. */
  bio?: string;
  /** Background rows for an advisor card, each with a mark when one is on disk. */
  background?: { label: string; logo?: string }[];
}

// The people actually running both orgs as of 2026-09-22, confirmed by Caleb.
export const LEADERSHIP: Person[] = [
  {
    name: "Caleb Newton",
    role: "Co-President",
    status: "active",
    photo: "/img/caleb_shot.jpg",
    link: "https://calebnewton.me/",
    // second-brain/core/identity.md (USC Iovine and Young Academy, sophomore)
    // and core/now.md (took TTS from dormant to 30+ members in three months
    // with Tyler). Tizzy is paused, so it stays off; Amber stays off because
    // it is in stealth (coordinator, 2026-10-10).
    bio: "A sophomore at USC's Iovine and Young Academy. With Tyler, he took TTS from an empty club to 30+ members in three months.",
  },
  {
    name: "Tyler Larsen",
    role: "Co-President",
    status: "active",
    // His LinkedIn suit photo, which he asked for in his voice memo ("you
    // can get that on my LinkedIn"), pulled 2026-10-09 at 560px like before.
    photo: "/img/tyler_shot.jpeg",
    link: "https://www.linkedin.com/in/tyler-larsen-4130a7294/",
    // second-brain/core/now.md and core/people.md: a Global Business
    // sophomore, Co-President with Caleb, recruited the cabinet of 10, and
    // handled the RSO, Wedge and workspace-mail work.
    // NEED: anything further from Tyler himself.
    bio: "A Global Business sophomore at USC. He recruited the club's ten-person cabinet and runs its registration as a student org.",
  },
  {
    // Emily Zhao, ezhao241@usc.edu. Joined the cabinet 2026-05-16, also in
    // 180 Degrees Consulting. She designed the current logo and the previous
    // site redesign on 2026-05-24 with, in Caleb's words, "full creative
    // freedom", so brand decisions are hers to make rather than to approve.
    // Headshot from the 180 Degrees Consulting masthead Caleb built
    // (~/code/work/pro-bono-post/staff/emily-zhao.jpeg, committed 2026-09-05),
    // the same club this note places her in. NEED: LinkedIn URL.
    name: "Emily Zhao",
    role: "Design and Brand",
    status: "active",
    photo: "/img/emily_shot.jpeg",
    // The comment above: joined the cabinet 2026-05-16, also in 180 Degrees
    // Consulting, designed the current logo and the previous site redesign.
    bio: "She designed the TTS logo and the club's previous site, and is also a member of 180 Degrees Consulting.",
  },
];

// Kept, not deleted. Every one of these ran a team under the previous cabinet
// and may rejoin; flipping status back to "active" is the whole restore path.
export const INACTIVE_CABINET: Person[] = [
  { name: "Shirley Park", role: "Co-Lead, Building", status: "inactive", photo: "/img/shirley_shot.jpeg", link: "https://www.linkedin.com/in/seoyeon-shirley-park/" },
  { name: "Kaitlyn Lee", role: "Co-Lead, Building", status: "inactive", photo: "/img/kaitlyn_shot.jpeg", link: "https://www.linkedin.com/in/kaitlynleee/" },
  { name: "Austin Chen", role: "President, Biotech Team", status: "inactive", photo: "/img/austin_shot.jpeg", link: "https://www.linkedin.com/in/austin-f-chen/" },
  { name: "Gabriel Oliveri", role: "President, Engineering Team", status: "inactive", photo: "/img/gabriel_shot.jpeg", link: "https://www.linkedin.com/in/gabriel-oliveri/" },
  { name: "Malakai Carey", role: "President, Music Team", status: "inactive", photo: "/img/malakai_shot.jpeg", link: "https://www.linkedin.com/in/malakai-carey-11187038a/" },
  { name: "Jet Jadeja", role: "President, Web3 Team", status: "inactive", photo: "/img/jet_shot.jpeg", link: "https://www.linkedin.com/in/jet-jadeja/" },
  { name: "Omniya Mohamed", role: "Lead of Operations", status: "inactive", photo: "/img/omniya_shot.jpeg", link: "https://www.linkedin.com/in/itsomniya/" },
  { name: "Mary Zewdie", role: "Lead of Marketing", status: "inactive", photo: "/img/mary_shot.jpeg", link: "https://www.linkedin.com/in/mary-zewdie-826768218/" },
  { name: "Esrom Dawit", role: "External Affairs", status: "inactive", photo: "/img/esrom_shot.jpeg", link: "https://www.linkedin.com/in/esrom-dawit-4780302b2/" },
  { name: "Annabelle Forbes", role: "Social Chair", status: "inactive", photo: "/img/annabelle_shot.jpeg", link: "https://www.linkedin.com/in/annabelle-forbes-9b381838b/" },
  { name: "Jacob Han", role: "Co-Lead, Videography", status: "inactive", photo: "/img/jacob_shot.jpeg", link: "https://www.linkedin.com/in/jacobwonhan/" },
  // Named Treasurer on 2026-04-08 and absent from every version of the site.
  // RSO registration requires a treasurer by name, so this one is load-bearing.
  // NEED: spelling. Three sources disagree: "Zavier Jacques" in the group
  // chat, "Zacier Jaques" on the contact card, jacquesh@usc.edu on the email.
  { name: "Zavier Jacques", role: "Treasurer", status: "inactive" },
  // NEED: "Choi" on the old site, "Choy" on the contact card. The LinkedIn
  // slug says choi27, so the site spelling is probably right. Confirm before print.
  { name: "Alex Choi", role: "Co-Lead, Videography", status: "inactive", photo: "/img/alex_shot.jpeg", link: "https://www.linkedin.com/in/alexchoi27/" },
];

// Caleb's instruction on 2026-09-22: the advisory board and alumni all stay,
// on both sites. This is the bench the cold outreach actually points at.
export const ADVISORS: Person[] = [
  // Faculty advisor, per Caleb on 2026-10-05. Title, headshot and background
  // from his IYA faculty page, iovine-young.usc.edu/people/chris-swain (read
  // 2026-10-10): "co-founded three venture-backed companies", "led 50+
  // products and business initiatives for companies that include Disney,
  // Intel, Sony, IBM...", "co-founded/directed the Electronic Arts Game
  // Innovation Lab at USC", "a founding member of the design firm R/GA".
  {
    name: "Chris Swain",
    role: "Faculty advisor, Associate Professor of Teaching",
    company: "USC Iovine and Young Academy",
    status: "advisor",
    photo: "/img/chris_swain_shot.jpg",
    link: "https://iovine-young.usc.edu/people/chris-swain",
    background: [
      { label: "Co-founded three venture-backed companies" },
      { label: "Led 50+ products for Disney, Intel, Sony, IBM and others" },
      { label: "Co-founded the EA Game Innovation Lab at USC" },
      { label: "Founding member of R/GA" },
    ],
  },
  // Matthew and Kevin co-founded TTS ("OG Co-Founder", site at 37795eb).
  // Matthew: Analyst at McKinsey (meeting slides, 9a698f2).
  {
    name: "Matthew Kim",
    role: "Analyst",
    company: "McKinsey & Company",
    status: "advisor",
    link: "https://www.linkedin.com/in/matthewkiiim",
    photo: "/img/matthew_shot.jpeg",
    logo: "/tts/marks/mckinsey.png",
    background: [
      { label: "Analyst, McKinsey & Company", logo: "/tts/marks/mckinsey.png" },
      { label: "Co-founded TTS" },
    ],
  },
  // Kevin: "Founder and current CFO of Retax 360" (meeting slides, 9a698f2).
  {
    name: "Kevin Sangmuah",
    role: "Software Engineer, and founder",
    company: "Reddit",
    status: "advisor",
    link: "https://www.linkedin.com/in/kevin-sangmuah-4a780a221",
    photo: "/img/kevin_shot.jpeg",
    logo: "/tts/marks/reddit.png",
    background: [
      { label: "Software Engineer, Reddit", logo: "/tts/marks/reddit.png" },
      { label: "Founder and CFO, Retax 360" },
      { label: "Co-founded TTS" },
    ],
  },
  // Duncan: "Active mentor to USC students through ACTS2 Fellowship"
  // (meeting slides, 02498dc).
  {
    name: "Duncan Inganji",
    role: "Software Engineer",
    company: "Google",
    status: "advisor",
    link: "https://www.linkedin.com/in/duncaninganji/",
    photo: "/img/duncan_shot.jpeg",
    logo: "/tts/marks/google.png",
    background: [
      { label: "Software Engineer, Google", logo: "/tts/marks/google.png" },
      { label: "Mentors USC students through the ACTS2 Fellowship" },
    ],
  },
  // Sagar: Stanford GSB (second-brain/core/people.md, confirmed by Caleb
  // 2026-10-05), former McKinsey (site at 9a698f2, and Tyler's voice memo),
  // past president of 180 Degrees Consulting at USC (people.md, confirmed by
  // Caleb 2026-09-04). NEED: the company Tyler called "Hydroc" in his
  // 2026-10-09 memo; LinkedIn was logged out (401) when checked 2026-10-10.
  {
    name: "Sagar Tiwari",
    role: "MBA, ex-McKinsey",
    company: "Stanford GSB",
    status: "advisor",
    link: "https://www.linkedin.com/in/sagart851/",
    photo: "/img/sagar_shot.jpeg",
    logo: "/tts/marks/stanford.png",
    background: [
      { label: "MBA, Stanford GSB", logo: "/tts/marks/stanford.png" },
      { label: "Formerly at McKinsey & Company", logo: "/tts/marks/mckinsey.png" },
      { label: "Past president, 180 Degrees Consulting at USC" },
    ],
  },
  {
    name: "Andrew Laffoon",
    role: "Founder and CEO",
    company: "Mixbook",
    status: "advisor",
    link: "https://www.linkedin.com/in/andrewlaffoon/",
    photo: "/img/andrew_shot.jpeg",
    logo: "/tts/marks/mixbook.png",
    background: [{ label: "Founder and CEO, Mixbook", logo: "/tts/marks/mixbook.png" }],
  },
];

// LinkedIn URLs, alumni and advisors: every one is the URL the site carried
// before (git history of components/TTSSite.tsx and data/people.ts, April to
// May 2026); Susan's from ecf1a0f ("use susan nyirenda's actual linkedin
// profile") and Sagar's from d5b9437 ("Sagar's LinkedIn URL to the one Caleb
// sent"). None is constructed. Chris Swain has no LinkedIn on disk, so his
// link stays his IYA faculty page.
// Fifteen people who started in this club. This is the proof section: the
// outreach line "our people are at Google, Apple, McKinsey and Reddit" is
// sourced entirely from ADVISORS and this list, with Apple being Susan
// Nyirenda and Reddit appearing in both.
// Albert's employer is left off on purpose: Caleb, 2026-10-04, "We shouldn't
// flex palantir". Company is optional, so every renderer must handle it absent.
export const ALUMNI: Person[] = [
  { name: "Susan Nyirenda", role: "Software Engineer", company: "Apple", status: "alumni", link: "https://www.linkedin.com/in/susannyirenda/", photo: "/img/alumni/susannyirenda.jpeg" },
  { name: "Albert Chung", role: "Forward Deployed Engineer", status: "alumni", link: "https://www.linkedin.com/in/albert-chung-70577821b", photo: "/img/alumni/albertchung.jpeg" },
  { name: "Elizabeth Abbey", role: "Software Engineer, ex-Microsoft", company: "Reddit", past: ["Microsoft"], status: "alumni", link: "https://www.linkedin.com/in/elizabeth-abbey-27418123b", photo: "/img/alumni/elizabethabbey.jpeg" },
  { name: "Senai Assefa", role: "Software Engineer, ex-Microsoft", company: "Bloomberg", past: ["Microsoft"], status: "alumni", link: "https://www.linkedin.com/in/senai-assefa", photo: "/img/alumni/senaiassefa.jpeg" },
  { name: "Rohan Singh", role: "Sales and Analytics", company: "Bloomberg", status: "alumni", link: "https://www.linkedin.com/in/rohansingh23/", photo: "/img/alumni/rohansingh.jpeg" },
  { name: "David Esquivel", role: "Cybersecurity Engineer", company: "Capital One", status: "alumni", link: "https://www.linkedin.com/in/davesq", photo: "/img/alumni/davidesquivel.jpeg" },
  { name: "Anthony Nasser", role: "Software Engineer", company: "NBC Universal", status: "alumni", link: "https://www.linkedin.com/in/anthony-nasser", photo: "/img/alumni/anthonynasser.jpeg" },
  { name: "Emerson Kahle", role: "Software Development Engineer", company: "Fastly", status: "alumni", link: "https://www.linkedin.com/in/emerson-kahle-560315198", photo: "/img/alumni/emersonkahle.jpeg" },
  { name: "Brandon McGowan", role: "Product Manager", company: "Epic", status: "alumni", link: "https://www.linkedin.com/in/brandon-mcgowan-413724223", photo: "/img/alumni/brandonmcgowan.jpeg" },
  { name: "James La", role: "Tech Consulting", company: "PwC", status: "alumni", link: "https://www.linkedin.com/in/jbla-usc", photo: "/img/alumni/jamesla.jpeg" },
  { name: "Akshar Aiyer", role: "Investment Banking", company: "Citi", status: "alumni", link: "https://www.linkedin.com/in/akshar-aiyer/", photo: "/img/alumni/aksharaiyer.jpeg" },
  { name: "Abhi Shah", role: "Investment Banking", company: "Jefferies", status: "alumni", link: "https://www.linkedin.com/in/abhiiishah", photo: "/img/alumni/abhishah.jpeg" },
  { name: "Parth Juthani", role: "Investment Banking", company: "Nomura", status: "alumni", link: "https://www.linkedin.com/in/parthjuthani", photo: "/img/alumni/parthjuthani.jpeg" },
  { name: "Joshua Kim", role: "Analyst", company: "Roxborough Group", status: "alumni", link: "https://www.linkedin.com/in/joshuadkim", photo: "/img/alumni/joshuakim.jpeg" },
  { name: "Kelly Kim", role: "JD Candidate", company: "USC Gould", status: "alumni", link: "https://www.linkedin.com/in/kelly-kim-usc", photo: "/img/alumni/kellykim.jpeg" },
];

/* Everyone who started at TTS: the fifteen alumni plus Matthew Kim and
 * Kevin Sangmuah, who co-founded it ("OG Co-Founder" on the site at
 * 37795eb). The other advisors never were members, so they stay off home's
 * "See where TTS can get you" wall (Network.tsx). */
export const NETWORK_PEOPLE: Person[] = [
  ...ALUMNI,
  // Without their photos: their faces are in the advisors section, and a
  // face appears once on home (coordinator, 2026-10-10). Their tiles keep
  // the company mark and their first names.
  ...ADVISORS.filter((p) => p.name === "Matthew Kim" || p.name === "Kevin Sangmuah").map(
    (p) => ({ ...p, photo: undefined }),
  ),
];

/** Companies the network actually reaches, for a logo wall. Sourced, not claimed. */
export const NETWORK_COMPANIES = Array.from(
  new Set([...ADVISORS, ...ALUMNI].map((p) => p.company).filter(Boolean)),
) as string[];
