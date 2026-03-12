-- Create storage bucket for note images
INSERT INTO storage.buckets (id, name, public)
VALUES ('note-images', 'note-images', true);

-- Allow public uploads (Firebase auth is handled separately in app)
CREATE POLICY "Anyone can upload note images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'note-images');

-- Allow public read access to note images
CREATE POLICY "Anyone can view note images"
ON storage.objects FOR SELECT
USING (bucket_id = 'note-images');

-- Allow public deletes for files in note-images
CREATE POLICY "Anyone can delete note images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'note-images');