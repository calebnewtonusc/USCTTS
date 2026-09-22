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
}

// The people actually running both orgs as of 2026-09-22, confirmed by Caleb.
export const LEADERSHIP: Person[] = [
  {
    name: "Caleb Newton",
    role: "Co-President",
    status: "active",
    photo: "/img/caleb_shot.jpg",
    link: "https://calebnewton.me/",
  },
  {
    name: "Tyler Larsen",
    role: "Co-President",
    status: "active",
    photo: "/img/tyler_shot.jpeg",
    link: "https://www.linkedin.com/in/tyler-larsen-4130a7294/",
  },
  {
    // Emily Zhao, ezhao241@usc.edu. Joined the cabinet 2026-05-16, also in
    // 180 Degrees Consulting. She designed the current logo and the previous
    // site redesign on 2026-05-24 with, in Caleb's words, "full creative
    // freedom", so brand decisions are hers to make rather than to approve.
    // NEED: headshot and LinkedIn; neither exists on disk.
    name: "Emily Zhao",
    role: "Design and Brand",
    status: "active",
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
  { name: "Matthew Kim", role: "Incoming Analyst", company: "McKinsey & Company", status: "advisor", photo: "/img/matthew_shot.jpeg", logo: "/img/logos/mckinsey.png" },
  { name: "Kevin Sangmuah", role: "Software Engineer, and founder", company: "Reddit", status: "advisor", photo: "/img/kevin_shot.jpeg", logo: "/img/logos/reddit.png" },
  { name: "Duncan Inganji", role: "Software Engineer", company: "Google", status: "advisor", photo: "/img/duncan_shot.jpeg", logo: "/img/logos/google.png" },
  { name: "Sagar Tiwari", role: "Stanford MBA, ex-McKinsey", company: "Stanford", status: "advisor", photo: "/img/sagar_shot.jpeg", logo: "/img/logos/stanford.png" },
  { name: "Andrew Laffoon", role: "Founder and CEO", company: "Mixbook", status: "advisor", photo: "/img/andrew_shot.jpeg", logo: "/img/logos/mixbook.png" },
  { name: "Catherine Newton, M.D.", role: "Pediatrician", status: "advisor", photo: "/img/catherine_shot.jpg", logo: "/img/logos/kaiser.png" },
];

// Fifteen people who started in this club. This is the proof section: the
// outreach line "our people are at Google, Apple, McKinsey and Reddit" is
// sourced entirely from ADVISORS and this list, with Apple being Susan
// Nyirenda and Reddit appearing in both.
export const ALUMNI: Person[] = [
  { name: "Susan Nyirenda", role: "Software Engineer", company: "Apple", status: "alumni", photo: "/img/alumni/susannyirenda.jpeg" },
  { name: "Albert Chung", role: "Forward Deployed Engineer", company: "Palantir", status: "alumni", photo: "/img/alumni/albertchung.jpeg" },
  { name: "Elizabeth Abbey", role: "Software Engineer, ex-Microsoft", company: "Reddit", status: "alumni", photo: "/img/alumni/elizabethabbey.jpeg" },
  { name: "Senai Assefa", role: "Software Engineer, ex-Microsoft", company: "Bloomberg", status: "alumni", photo: "/img/alumni/senaiassefa.jpeg" },
  { name: "Rohan Singh", role: "Sales and Analytics", company: "Bloomberg", status: "alumni", photo: "/img/alumni/rohansingh.jpeg" },
  { name: "David Esquivel", role: "Cybersecurity Engineer", company: "Capital One", status: "alumni", photo: "/img/alumni/davidesquivel.jpeg" },
  { name: "Anthony Nasser", role: "Software Engineer", company: "NBC Universal", status: "alumni", photo: "/img/alumni/anthonynasser.jpeg" },
  { name: "Emerson Kahle", role: "Software Development Engineer", company: "Fastly", status: "alumni", photo: "/img/alumni/emersonkahle.jpeg" },
  { name: "Brandon McGowan", role: "Product Manager", company: "Epic", status: "alumni", photo: "/img/alumni/brandonmcgowan.jpeg" },
  { name: "James La", role: "Tech Consulting", company: "PwC", status: "alumni", photo: "/img/alumni/jamesla.jpeg" },
  { name: "Akshar Aiyer", role: "Investment Banking", company: "Citi", status: "alumni", photo: "/img/alumni/aksharaiyer.jpeg" },
  { name: "Abhi Shah", role: "Investment Banking", company: "Jefferies", status: "alumni", photo: "/img/alumni/abhishah.jpeg" },
  { name: "Parth Juthani", role: "Investment Banking", company: "Nomura", status: "alumni", photo: "/img/alumni/parthjuthani.jpeg" },
  { name: "Joshua Kim", role: "Analyst", company: "Roxborough Group", status: "alumni", photo: "/img/alumni/joshuakim.jpeg" },
  { name: "Kelly Kim", role: "JD Candidate", company: "USC Gould", status: "alumni", photo: "/img/alumni/kellykim.jpeg" },
];

/** Companies the network actually reaches, for a logo wall. Sourced, not claimed. */
export const NETWORK_COMPANIES = Array.from(
  new Set([...ADVISORS, ...ALUMNI].map((p) => p.company).filter(Boolean)),
) as string[];
