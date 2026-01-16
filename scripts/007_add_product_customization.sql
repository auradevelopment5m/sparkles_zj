-- Add product_type column to existing products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'customizable' CHECK (product_type IN ('customizable', 'premade'));

-- Update existing products to be customizable by default
UPDATE public.products SET product_type = 'customizable' WHERE product_type IS NULL OR product_type = '';

-- Create product_customization_fields table for admin-defined customization options
CREATE TABLE IF NOT EXISTS public.product_customization_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'select', 'number', 'color')),
  field_label TEXT NOT NULL,
  field_options TEXT[], -- For select fields
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_customization_values table for customer selections
CREATE TABLE IF NOT EXISTS public.product_customization_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE,
  field_id UUID REFERENCES public.product_customization_fields(id) ON DELETE CASCADE,
  field_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);