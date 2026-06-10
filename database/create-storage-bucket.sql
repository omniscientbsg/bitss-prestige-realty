-- Run this in Supabase SQL Editor to create the public uploads bucket
-- Go to: supabase.com → your project → SQL Editor → paste this → Run

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  true,
  52428800,  -- 50MB max per file
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','application/pdf']
)
on conflict (id) do nothing;

-- Allow public read (anyone can view files)
create policy "Public read access" on storage.objects
  for select using (bucket_id = 'uploads');

-- Allow authenticated uploads via service_role (our server uses service_role key)
create policy "Service role can upload" on storage.objects
  for insert with check (bucket_id = 'uploads');

create policy "Service role can delete" on storage.objects
  for delete using (bucket_id = 'uploads');
