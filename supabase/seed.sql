-- Local test data, loaded by `npx supabase db reset` after the migrations. Never run against a
-- hosted project.
--
-- Test account for signing in to the app against the local stack:
--   email:    test@hairdiary.test
--   password: password123

-- Test user. The on_auth_user_created trigger creates the matching "Users" profile row.
insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    -- Supabase Auth expects these token columns to be empty strings, not null.
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_new
)
values (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'test@hairdiary.test',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
);

insert into auth.identities (
    id,
    user_id,
    provider_id,
    provider,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
)
values (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'email',
    '{"sub": "11111111-1111-1111-1111-111111111111", "email": "test@hairdiary.test", "email_verified": true}',
    now(),
    now(),
    now()
);

update public."Users"
set hair_journey = 'Growing out my curls and cutting back on heat styling.'
where user_id = '11111111-1111-1111-1111-111111111111';

-- A few entries over the past two weeks so the calendar has marked dates.
insert into public."Entries" (user_id, date, entry_type, notes)
values
    ('11111111-1111-1111-1111-111111111111', current_date - 13, 'Wash', 'Sulfate-free shampoo and deep conditioner.'),
    ('11111111-1111-1111-1111-111111111111', current_date - 10, 'Hair Mask', 'Avocado and honey mask, 30 minutes.'),
    ('11111111-1111-1111-1111-111111111111', current_date - 7, 'Haircut', 'Trimmed the ends.'),
    ('11111111-1111-1111-1111-111111111111', current_date - 6, 'Wash', null),
    ('11111111-1111-1111-1111-111111111111', current_date - 5, 'Good Hair Day', 'Curls held all day.'),
    ('11111111-1111-1111-1111-111111111111', current_date - 1, 'Wash', 'Tried a new leave-in conditioner.');
