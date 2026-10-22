-- Profiles for signed-in users. Read and updated by lib/supabaseProfile.ts.
--
-- The app never inserts into this table: a trigger on auth.users creates the row when an account
-- is created, so fetchUserProfile() can always .single() it.
--
-- The quoted, capitalized table name matches the app's .from("Users") calls.

create table public."Users" (
    user_id uuid primary key references auth.users (id) on delete cascade,
    email text,
    hair_journey text,
    profile_picture text,
    created_at timestamptz not null default now()
);

comment on table public."Users" is 'One profile per auth user, created by private.handle_new_user().';
comment on column public."Users".profile_picture is 'Public URL of the image in the profile_picture storage bucket.';

-- Data API access. New tables are not exposed automatically (auto_expose_new_tables = false
-- locally, and the hosted default since Oct 2026), so grant exactly what the app needs. The revoke
-- makes the result the same on projects that still auto-grant new tables.
revoke all on table public."Users" from anon, authenticated;
grant select on table public."Users" to authenticated;
-- Users may edit their profile fields, but not their user_id or email.
grant update (hair_journey, profile_picture) on table public."Users" to authenticated;
grant select, insert, update, delete on table public."Users" to service_role;

alter table public."Users" enable row level security;

create policy "Users can view their own profile"
    on public."Users"
    for select
    to authenticated
    using ((select auth.uid()) = user_id);

create policy "Users can update their own profile"
    on public."Users"
    for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

-- Trigger function that creates the profile row. It runs as its owner (security definer) because
-- the signing-up user has no insert grant on "Users". It lives in the unexposed private schema so
-- it can't be called through the Data API.
create schema if not exists private;
revoke all on schema private from public;

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public."Users" (user_id, email)
    values (new.id, new.email);
    return new;
end;
$$;

revoke execute on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function private.handle_new_user();
