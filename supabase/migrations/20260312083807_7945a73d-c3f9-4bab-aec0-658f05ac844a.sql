-- Create storage bucket for note images
INSERT INTO storage.buckets (id, name, public)
VALUES ('note-images', 'note-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload note images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'note-images');

-- Allow public read access to note images
CREATE POLICY "Anyone can view note images"
ON storage.objects FOR SELECT
USING (bucket_id = 'note-images');

-- Allow authenticated users to delete their own images
CREATE POLICY "Authenticated users can delete note images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'note-images' AND auth.uid()::text = (storage.foldername(name))[1]);