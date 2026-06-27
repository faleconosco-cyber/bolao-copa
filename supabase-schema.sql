create table participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pin text not null unique
);

create table games (
  id text primary key,
  phase text not null,
  ordering int not null,
  game_date date not null,
  home_team text,
  away_team text,
  home_source_game_id text references games(id),
  away_source_game_id text references games(id),
  result_home int,
  result_away int,
  result_advance_team text
);

create table predictions (
  participant_id uuid references participants(id),
  game_id text references games(id),
  home_score int not null,
  away_score int not null,
  advance_team text,
  primary key (participant_id, game_id)
);

create table artilheiro_predictions (
  participant_id uuid primary key references participants(id),
  player text not null
);

create table config (
  id int primary key default 1,
  inscricao numeric not null default 50,
  artilheiro_real text
);
insert into config (id) values (1) on conflict do nothing;
