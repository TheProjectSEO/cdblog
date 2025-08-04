-- Enable RLS on storage.buckets
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Enable RLS on storage.objects  
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public bucket creation (for admin use)
CREATE POLICY "Allow bucket creation" ON storage.buckets
FOR INSERT WITH CHECK (true);

-- Allow public bucket read
CREATE POLICY "Allow bucket read" ON storage.buckets
FOR SELECT USING (true);

-- Allow public file uploads to blog-images bucket
CREATE POLICY "Allow blog images upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'blog-images'
);

-- Allow public file reads from blog-images bucket
CREATE POLICY "Allow blog images read" ON storage.objects
FOR SELECT USING (
  bucket_id = 'blog-images'
);

-- Allow public file updates in blog-images bucket
CREATE POLICY "Allow blog images update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'blog-images'
) WITH CHECK (
  bucket_id = 'blog-images'
);

-- Allow public file deletes from blog-images bucket
CREATE POLICY "Allow blog images delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'blog-images'
);