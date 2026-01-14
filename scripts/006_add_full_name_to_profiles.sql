-- Add full_name column to profiles table for easier display
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update existing profiles to concatenate first and last name
UPDATE public.profiles 
SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
WHERE full_name IS NULL AND (first_name IS NOT NULL OR last_name IS NOT NULL);
