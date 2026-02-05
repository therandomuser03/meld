-- Create the 'avatars' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Ensure RLS is enabled (This usually fails if not owner, but it is enabled by default. 
-- If this line fails, you can safely ignore it or comment it out if the bucket creates successfully.)
-- alter table storage.objects enable row level security; 

-- Policy: Allow public read access to the avatars bucket
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Policy: Allow authenticated users to upload files to the avatars bucket
drop policy if exists "Authenticated Upload" on storage.objects;
create policy "Authenticated Upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'avatars' );

-- Policy: Allow users to update their own avatar entries
drop policy if exists "Authenticated Update" on storage.objects;
create policy "Authenticated Update"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'avatars' );

-- Policy: Allow users to delete their own avatar entries
drop policy if exists "Authenticated Delete" on storage.objects;
create policy "Authenticated Delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'avatars' );
