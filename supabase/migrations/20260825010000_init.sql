create extension if not exists "uuid-ossp";

do $$ begin create type encounter_status as enum ('WAITING','IN_PROGRESS','SEEN'); exception when duplicate_object then null; end $$;

do $$ begin create type order_type as enum ('DRUG','LAB','RAD'); exception when duplicate_object then null; end $$;

do $$ begin create type order_status as enum ('PENDING','DISPENSED'); exception when duplicate_object then null; end $$;

create table if not exists public.branches (id uuid primary key default uuid_generate_v4(), hospital_id uuid references public.hospitals(id) on delete cascade, name text not null, created_at timestamptz default now());
create table if not exists public.encounters (id uuid primary key default uuid_generate_v4(), hospital_id uuid references public.hospitals(id) on delete cascade, branch_id uuid references public.branches(id), patient_id uuid references public.patients(id) on delete cascade, queue_number integer, encounter_number text, department text not null, specialty text, attending_staff_id uuid, acting_staff_id uuid, status encounter_status not null default 'WAITING', scheduled_at timestamptz default now(), seen_at timestamptz);
create table if not exists public.drugs_master (id uuid primary key default uuid_generate_v4(), generic_name text not null, brand_names text[] default '{}', category text, indication text, strength text, route text);
create table if not exists public.lab_catalog (id uuid primary key default uuid_generate_v4(), hospital_id uuid references public.hospitals(id) on delete cascade, name text not null, category text, price numeric(10,2) default 0, duration_minutes integer default 30);
create table if not exists public.orders (id uuid primary key default uuid_generate_v4(), hospital_id uuid references public.hospitals(id) on delete cascade, encounter_id uuid references public.encounters(id) on delete cascade, order_type order_type not null, item_id uuid, item_name text not null, qty integer default 1, price numeric(10,2) default 0, status order_status not null default 'PENDING', created_at timestamptz default now());

alter table public.encounters enable row level security;
alter table public.drugs_master enable row level security;
alter table public.lab_catalog enable row level security;
alter table public.orders enable row level security;

drop policy if exists drugs_master_read_authenticated on public.drugs_master;
create policy drugs_master_read_authenticated on public.drugs_master for select to authenticated using (true);

create or replace function public.decrement_queue() returns trigger language plpgsql security invoker set search_path = public as $$ begin if new.status = 'SEEN' and old.status <> 'SEEN' then update public.encounters set queue_number = queue_number - 1 where hospital_id = new.hospital_id and department = new.department and status = 'WAITING' and queue_number > new.queue_number; end if; return new; end; $$;
drop trigger if exists encounter_queue_decrement on public.encounters;
create trigger encounter_queue_decrement after update of status on public.encounters for each row execute function public.decrement_queue();

create index if not exists encounters_queue_idx on public.encounters (hospital_id, department, status, queue_number);
