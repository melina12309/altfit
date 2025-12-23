-- Create products table for outfit items
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'unisex',
  image TEXT NOT NULL,
  shop_url TEXT,
  tags TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable (for browsing)
CREATE POLICY "Products are publicly readable"
ON public.products
FOR SELECT
USING (true);

-- Create indexes for search
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_gender ON public.products(gender);
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_tags ON public.products USING GIN(tags);
CREATE INDEX idx_products_colors ON public.products USING GIN(colors);

-- Full text search index
CREATE INDEX idx_products_search ON public.products USING GIN(to_tsvector('english', name || ' ' || brand || ' ' || category));

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();