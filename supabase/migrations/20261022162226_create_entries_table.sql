-- Hair care diary entries. Read and written by lib/supabaseEntries.ts.
--
-- The quoted, capitalized table name matches the app's .from("Entries") calls.

create table public."Entries" (
    entry_id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    date date not null,
    -- Keep in sync with ENTRY_TYPES in type.ts. Adding a type needs a migration.
    entry_type text not null check (
        entry_type in (
            'Wash',
            'Haircut',
            'Hair Mask',
            'Chemical Treatment',
            'Good Hair Day',
            'Other'
        )
    ),
    notes text,
    created_at timestamptz not null default now()
);

comment on table public."Entries" is 'Diary entries; each row belongs to one auth user.';

-- fetchUserEntries() filters by user_id and orders by date desc. This index also covers the
-- user_id foreign key and the RLS ownership check.
create index entries_user_id_date_idx on public."Entries" (user_id, date desc);

-- Data API access. New tables are not exposed automatically (auto_expose_new_tables = false
-- locally, and the hosted default since Oct 2026), so grant exactly what the app needs. The revoke
-- makes the result the same on projects that still auto-grant new tables.
revoke all on table public."Entries" from anon, authenticated;
grant select, insert, update, delete on table public."Entries" to authenticated;
grant select, insert, update, delete on table public."Entries" to service_role;

alter table public."Entries" enable row level security;

create policy "Users can view their own entries"
    on public."Entries"
    for select
    to authenticated
    using ((select auth.uid()) = user_id);

create policy "Users can create their own entries"
    on public."Entries"
    for insert
    to authenticated
    with check ((select auth.uid()) = user_id);

create policy "Users can update their own entries"
    on public."Entries"
    for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Users can delete their own entries"
    on public."Entries"
    for delete
    to authenticated
    using ((select auth.uid()) = user_id);
