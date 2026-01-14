-- Create admin user
-- Note: This creates the admin account with email ahmad23slieman@gmail.com
-- The password will be set during signup flow

-- First, we'll insert the admin user via the API
-- This script seeds initial data

-- Insert some sample products
INSERT INTO public.products (name, description, price, points_value, stock, is_limited, is_featured) VALUES
  ('Sunset Dreams', 'A beautiful sunset landscape painted with warm colors and gentle strokes.', 45.00, 45, 3, false, true),
  ('Ocean Waves', 'Capturing the essence of the sea with deep blues and turquoise.', 55.00, 55, 2, true, true),
  ('Abstract Joy', 'Vibrant abstract piece that brings energy to any room.', 35.00, 35, 5, false, true),
  ('Floral Whispers', 'Delicate flowers painted in soft pastels.', 40.00, 40, 4, false, false),
  ('Golden Hour', 'Limited edition canvas capturing the magical golden hour light.', 75.00, 100, 1, true, true);

-- Insert sample featured gallery items
INSERT INTO public.featured_gallery (title, image_url, sort_order) VALUES
  ('Masterpiece Collection', '/placeholder.svg?height=600&width=800', 1),
  ('Nature Series', '/placeholder.svg?height=600&width=800', 2),
  ('Modern Art', '/placeholder.svg?height=600&width=800', 3);

-- Insert sample redeemable items
INSERT INTO public.redeemable_items (name, description, points_required, stock) VALUES
  ('Mini Canvas Print', 'A beautiful mini canvas print from our exclusive collection.', 100, 10),
  ('Art Brush Set', 'Professional brush set for aspiring artists.', 200, 5),
  ('Limited Edition Print', 'Exclusive signed print by Zahraa Jaffal.', 500, 2);
