-- Storage buckets for Sparkes

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('products', 'products', true),
  ('gallery', 'gallery', true),
  ('custom-orders', 'custom-orders', true),
  ('chat-images', 'chat-images', true),
  ('redeemables', 'redeemables', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for products bucket
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products'
  AND public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products'
  AND public.is_admin(auth.uid())
);

-- Storage policies for gallery bucket
DROP POLICY IF EXISTS "Anyone can view gallery images" ON storage.objects;
CREATE POLICY "Anyone can view gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Admins can manage gallery images" ON storage.objects;
CREATE POLICY "Admins can manage gallery images"
ON storage.objects FOR ALL
USING (
  bucket_id = 'gallery'
  AND public.is_admin(auth.uid())
);

-- Storage policies for custom-orders bucket
DROP POLICY IF EXISTS "Anyone can view custom order images" ON storage.objects;
CREATE POLICY "Anyone can view custom order images"
ON storage.objects FOR SELECT
USING (bucket_id = 'custom-orders');

DROP POLICY IF EXISTS "Anyone can upload custom order images" ON storage.objects;
CREATE POLICY "Anyone can upload custom order images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'custom-orders');

-- Storage policies for chat-images bucket
DROP POLICY IF EXISTS "Authenticated users can view chat images" ON storage.objects;
CREATE POLICY "Authenticated users can view chat images"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can upload chat images" ON storage.objects;
CREATE POLICY "Authenticated users can upload chat images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-images' AND auth.role() = 'authenticated');

-- Storage policies for redeemables bucket
DROP POLICY IF EXISTS "Anyone can view redeemable images" ON storage.objects;
CREATE POLICY "Anyone can view redeemable images"
ON storage.objects FOR SELECT
USING (bucket_id = 'redeemables');

DROP POLICY IF EXISTS "Admins can manage redeemable images" ON storage.objects;
CREATE POLICY "Admins can manage redeemable images"
ON storage.objects FOR ALL
USING (
  bucket_id = 'redeemables'
  AND public.is_admin(auth.uid())
);
