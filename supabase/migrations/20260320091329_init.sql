-- PROFILES
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  name                text not null check (length(trim(name)) >= 1 and length(name) <= 50),
  age                 int check (age is null or (age >= 13 and age <= 120)),
  timezone            text not null default 'UTC',
  push_subscription   jsonb,
  notif_morning_time  text not null default '08:00',
  notif_night_time    text not null default '21:30',
  notif_enabled       boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- CYCLES
create table public.cycles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  start_date    date not null,
  end_date      date not null,
  length_days   int not null default 14 check (length_days in (7, 14)),
  status        text not null default 'active' check (status in ('active', 'closed')),
  closed_at     timestamptz,
  created_at    timestamptz not null default now(),
  constraint valid_date_range check (end_date >= start_date)
);

-- DIRECTIONS
create table public.directions (
  id          uuid primary key default gen_random_uuid(),
  cycle_id    uuid not null references public.cycles(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null check (length(trim(title)) >= 1 and length(title) <= 80),
  color       text not null check (color in ('terra', 'forest', 'slate')),
  position    int  not null check (position in (1, 2, 3)),
  created_at  timestamptz not null default now(),
  unique (cycle_id, position)
);

-- MOVES
create table public.moves (
  id            uuid primary key default gen_random_uuid(),
  cycle_id      uuid not null references public.cycles(id) on delete cascade,
  direction_id  uuid references public.directions(id) on delete set null,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  title         text not null check (length(trim(title)) >= 1 and length(title) <= 80),
  date          date not null,
  status        text not null default 'pending' check (status in ('pending', 'done')),
  done_at       timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- DB-level max 3 moves per day
create or replace function check_max_moves_per_day()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.moves
      where user_id = new.user_id and date = new.date and id != new.id) >= 3 then
    raise exception 'max_moves_exceeded'
      using hint = 'Maximum 3 moves per day';
  end if;
  return new;
end; $$;

create trigger enforce_max_moves_per_day
  before insert on public.moves
  for each row execute function check_max_moves_per_day();

-- CHECKINS
create table public.checkins (
  id          uuid primary key default gen_random_uuid(),
  cycle_id    uuid not null references public.cycles(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  date        date not null,
  status      text not null check (status in ('showed_up', 'avoided')),
  created_at  timestamptz not null default now(),
  unique (user_id, date)
);

-- LATER PILE
create table public.later_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('link', 'idea')),
  content     text not null check (length(trim(content)) >= 1 and length(content) <= 500),
  note        text check (note is null or length(note) <= 200),
  promoted    boolean not null default false,
  dropped     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- REFLECTIONS
create table public.reflections (
  id          uuid primary key default gen_random_uuid(),
  cycle_id    uuid not null references public.cycles(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  body        text check (body is null or length(body) <= 2000),
  created_at  timestamptz not null default now(),
  unique (cycle_id, user_id)
);

-- INDEXES
create index idx_cycles_user_status     on public.cycles      (user_id, status);
create index idx_directions_cycle       on public.directions   (cycle_id);
create index idx_moves_user_date        on public.moves        (user_id, date);
create index idx_moves_cycle            on public.moves        (cycle_id);
create index idx_moves_user_date_status on public.moves        (user_id, date, status);
create index idx_checkins_user_date     on public.checkins     (user_id, date);
create index idx_checkins_cycle         on public.checkins     (cycle_id);
create index idx_later_user             on public.later_items  (user_id, dropped, promoted);

-- AUTO UPDATED_AT
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_updated_at before update on public.profiles for each row execute function set_updated_at();
create trigger moves_updated_at    before update on public.moves    for each row execute function set_updated_at();

-- RLS (every table, every operation)
alter table public.profiles    enable row level security;
alter table public.cycles       enable row level security;
alter table public.directions   enable row level security;
alter table public.moves        enable row level security;
alter table public.checkins     enable row level security;
alter table public.later_items  enable row level security;
alter table public.reflections  enable row level security;

create policy "profiles own"    on public.profiles    for all using (auth.uid() = id)         with check (auth.uid() = id);
create policy "cycles own"      on public.cycles      for all using (auth.uid() = user_id)    with check (auth.uid() = user_id);
create policy "directions own"  on public.directions  for all using (auth.uid() = user_id)    with check (auth.uid() = user_id);
create policy "moves own"       on public.moves       for all using (auth.uid() = user_id)    with check (auth.uid() = user_id);
create policy "checkins own"    on public.checkins    for all using (auth.uid() = user_id)    with check (auth.uid() = user_id);
create policy "later own"       on public.later_items for all using (auth.uid() = user_id)    with check (auth.uid() = user_id);
create policy "reflections own" on public.reflections for all using (auth.uid() = user_id)    with check (auth.uid() = user_id);
