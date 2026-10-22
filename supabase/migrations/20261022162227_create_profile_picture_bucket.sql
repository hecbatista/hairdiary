-- Storage bucket for profile pictures, used by uploadProfilePicture() in lib/supabaseProfile.ts.
--
-- Files live at {user_id}/{user_id}-{timestamp}.{ext}. The bucket is public because the app stores
-- getPublicUrl() links in "Users".profile_picture, so anyone with a link can view the image.
-- Writes are limited to the owner's own folder by the policies below.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'profile_picture',
    'profile_picture',
    true,
    10485760, -- 10 MiB; the image picker uploads at full quality
    -- A wildcard, because the app sends image/{file extension} (e.g. image/jpg) as the content type.
    array['image/*']
)
on conflict (id) do nothing;

-- Uploads use upsert, which needs insert, select and update.
create policy "Users can view their own profile pictures"
    on storage.objects
    for select
    to authenticated
    using (
        bucket_id = 'profile_picture'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );

create policy "Users can upload their own profile pictures"
    on storage.objects
    for insert
    to authenticated
    with check (
        bucket_id = 'profile_picture'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );

create policy "Users can update their own profile pictures"
    on storage.objects
    for update
    to authenticated
    using (
        bucket_id = 'profile_picture'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    )
    with check (
        bucket_id = 'profile_picture'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );

create policy "Users can delete their own profile pictures"
    on storage.objects
    for delete
    to authenticated
    using (
        bucket_id = 'profile_picture'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );
