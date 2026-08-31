/*
  # Create Logos Storage Bucket

  1. New Storage
    - `logos` bucket for company logo uploads
    - Public access for reading (logos need to be visible in embeds)

  2. Security
    - Authenticated users can upload logos to their own folder
    - Authenticated users can update/delete their own logos
    - Anyone can read logos (needed for public embed widgets)
    - Folder structure: logos/{user_id}/filename
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can update own logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can delete own logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'logos');