-- applications
create table public.applications (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  major       text not null,
  year        text not null,
  track       text not null,
  why         text not null,
  created_at  timestamptz not null default now()
);

alter table public.applications enable row level security;

create policy "service role full access on applications"
  on public.applications
  using (true)
  with check (true);

-- partnerships
create table public.partnerships (
  id            uuid primary key default gen_random_uuid(),
  org_name      text not null,
  contact_name  text not null,
  email         text not null,
  partner_type  text not null,
  description   text not null,
  created_at    timestamptz not null default now()
);

alter table public.partnerships enable row level security;

create policy "service role full access on partnerships"
  on public.partnerships
  using (true)
  with check (true);

-- email_signups
create table public.email_signups (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

alter table public.email_signups enable row level security;

create policy "service role full access on email_signups"
  on public.email_signups
  using (true)
  with check (true);
