-- Drop the simple products table and recreate with full schema
DROP TABLE IF EXISTS public.products CASCADE;

-- Create products table with provider architecture
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  image_url TEXT NOT NULL,
  retailer TEXT NOT NULL,
  category TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'unisex',
  style_tags TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  provider TEXT NOT NULL,
  provider_product_id TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_product_id)
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable
CREATE POLICY "Products are publicly readable"
ON public.products FOR SELECT USING (true);

-- Create indexes for search performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_gender ON public.products(gender);
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_retailer ON public.products(retailer);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_provider ON public.products(provider);
CREATE INDEX idx_products_style_tags ON public.products USING GIN(style_tags);
CREATE INDEX idx_products_colors ON public.products USING GIN(colors);
CREATE INDEX idx_products_last_seen ON public.products(last_seen_at);

-- Full text search index
CREATE INDEX idx_products_search ON public.products USING GIN(
  to_tsvector('english', title || ' ' || brand || ' ' || category || ' ' || retailer)
);

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create clicks table for analytics
CREATE TABLE public.clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  session_id TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

-- Clicks can be inserted by anyone (for tracking)
CREATE POLICY "Clicks can be inserted publicly"
ON public.clicks FOR INSERT WITH CHECK (true);

-- Only allow reading own clicks (for user analytics)
CREATE POLICY "Users can view their own clicks"
ON public.clicks FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for analytics
CREATE INDEX idx_clicks_product ON public.clicks(product_id);
CREATE INDEX idx_clicks_provider ON public.clicks(provider);
CREATE INDEX idx_clicks_created ON public.clicks(created_at);
CREATE INDEX idx_clicks_session ON public.clicks(session_id);

-- Seed with sample affiliate products
INSERT INTO public.products (title, brand, price, currency, image_url, retailer, category, gender, style_tags, colors, provider, provider_product_id, affiliate_url) VALUES
-- Men's Tops
('Classic Oxford Shirt', 'Ralph Lauren', 89, 'EUR', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', 'Nordstrom', 'tops', 'men', ARRAY['formal', 'classic', 'office'], ARRAY['white', 'blue'], 'awin_feed', 'RL-OXF-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
('Slim Fit Polo', 'Lacoste', 95, 'EUR', 'https://images.unsplash.com/photo-1625910513413-5fc45fd15ea2?w=400', 'Lacoste', 'tops', 'men', ARRAY['casual', 'preppy', 'summer'], ARRAY['navy', 'green'], 'awin_feed', 'LAC-POL-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
('Merino Wool Sweater', 'COS', 125, 'EUR', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400', 'COS', 'tops', 'men', ARRAY['smart-casual', 'layering', 'winter'], ARRAY['gray', 'black'], 'awin_feed', 'COS-MER-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
('Linen Camp Collar Shirt', 'Zara', 59, 'EUR', 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400', 'Zara', 'tops', 'men', ARRAY['summer', 'vacation', 'casual'], ARRAY['beige', 'white'], 'awin_feed', 'ZAR-LIN-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
-- Men's Bottoms
('Tailored Chinos', 'Bonobos', 98, 'EUR', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', 'Bonobos', 'bottoms', 'men', ARRAY['smart-casual', 'office', 'classic'], ARRAY['khaki', 'navy'], 'awin_feed', 'BON-CHI-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
('Slim Fit Jeans', 'Levi''s', 79, 'EUR', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', 'Levi''s', 'bottoms', 'men', ARRAY['casual', 'everyday', 'denim'], ARRAY['blue', 'black'], 'awin_feed', 'LEV-JNS-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
('Wool Dress Pants', 'Hugo Boss', 195, 'EUR', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', 'Hugo Boss', 'bottoms', 'men', ARRAY['formal', 'business', 'tailored'], ARRAY['charcoal', 'navy'], 'awin_feed', 'HB-DRS-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
-- Men's Shoes
('White Leather Sneakers', 'Common Projects', 425, 'EUR', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', 'Mr Porter', 'shoes', 'men', ARRAY['casual', 'minimalist', 'luxury'], ARRAY['white'], 'awin_feed', 'CP-SNK-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
('Brown Oxford Shoes', 'Allen Edmonds', 395, 'EUR', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400', 'Allen Edmonds', 'shoes', 'men', ARRAY['formal', 'classic', 'business'], ARRAY['brown', 'tan'], 'awin_feed', 'AE-OXF-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
('Chelsea Boots', 'R.M. Williams', 495, 'EUR', 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=400', 'R.M. Williams', 'shoes', 'men', ARRAY['versatile', 'smart-casual', 'autumn'], ARRAY['black', 'brown'], 'awin_feed', 'RMW-CHE-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
-- Men's Outerwear
('Wool Overcoat', 'Theory', 595, 'EUR', 'https://images.unsplash.com/photo-1544923246-77307dd628b9?w=400', 'Theory', 'outerwear', 'men', ARRAY['formal', 'winter', 'tailored'], ARRAY['camel', 'black'], 'awin_feed', 'TH-OVC-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
('Leather Bomber Jacket', 'AllSaints', 450, 'EUR', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', 'AllSaints', 'outerwear', 'men', ARRAY['casual', 'edgy', 'rock'], ARRAY['black', 'brown'], 'awin_feed', 'AS-BOM-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
-- Men's Accessories
('Leather Belt', 'Gucci', 350, 'EUR', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 'Gucci', 'accessories', 'men', ARRAY['luxury', 'classic', 'statement'], ARRAY['black', 'brown'], 'awin_feed', 'GUC-BLT-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
('Aviator Sunglasses', 'Ray-Ban', 175, 'EUR', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', 'Ray-Ban', 'accessories', 'men', ARRAY['classic', 'timeless', 'summer'], ARRAY['gold', 'silver'], 'awin_feed', 'RB-AVI-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
-- Women's Tops
('Silk Blouse', 'Equipment', 230, 'EUR', 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400', 'Net-a-Porter', 'tops', 'women', ARRAY['elegant', 'office', 'luxury'], ARRAY['ivory', 'black'], 'awin_feed', 'EQ-SLK-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
('Cashmere Turtleneck', 'Everlane', 145, 'EUR', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400', 'Everlane', 'tops', 'women', ARRAY['cozy', 'luxury', 'winter'], ARRAY['cream', 'gray'], 'awin_feed', 'EV-CSH-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
('Striped Breton Top', 'Saint James', 85, 'EUR', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', 'Saint James', 'tops', 'women', ARRAY['classic', 'french', 'casual'], ARRAY['navy', 'white'], 'awin_feed', 'SJ-BRT-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
-- Women's Bottoms
('High-Waist Tailored Trousers', 'Massimo Dutti', 120, 'EUR', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', 'Massimo Dutti', 'bottoms', 'women', ARRAY['office', 'elegant', 'tailored'], ARRAY['black', 'camel'], 'awin_feed', 'MD-TRS-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
('Wide Leg Jeans', 'Agolde', 198, 'EUR', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400', 'Shopbop', 'bottoms', 'women', ARRAY['trendy', 'casual', 'denim'], ARRAY['blue', 'white'], 'awin_feed', 'AG-WLJ-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
('Pleated Midi Skirt', 'Reformation', 178, 'EUR', 'https://images.unsplash.com/photo-1583496661160-fb5886a0ebb2?w=400', 'Reformation', 'bottoms', 'women', ARRAY['feminine', 'versatile', 'sustainable'], ARRAY['black', 'burgundy'], 'awin_feed', 'RF-PLT-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
-- Women's Shoes
('Pointed Toe Pumps', 'Jimmy Choo', 650, 'EUR', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 'Jimmy Choo', 'shoes', 'women', ARRAY['formal', 'elegant', 'luxury'], ARRAY['nude', 'black'], 'awin_feed', 'JC-PMP-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
('White Platform Sneakers', 'Veja', 150, 'EUR', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400', 'Veja', 'shoes', 'women', ARRAY['casual', 'sustainable', 'sporty'], ARRAY['white', 'green'], 'awin_feed', 'VJ-PLT-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
('Ankle Boots', 'Gianvito Rossi', 995, 'EUR', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 'Mytheresa', 'shoes', 'women', ARRAY['chic', 'versatile', 'autumn'], ARRAY['black', 'brown'], 'awin_feed', 'GR-ANK-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
-- Women's Outerwear
('Tailored Blazer', 'The Row', 2490, 'EUR', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400', 'The Row', 'outerwear', 'women', ARRAY['luxury', 'minimal', 'investment'], ARRAY['black', 'cream'], 'awin_feed', 'TR-BLZ-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
('Trench Coat', 'Burberry', 1990, 'EUR', 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400', 'Burberry', 'outerwear', 'women', ARRAY['classic', 'iconic', 'investment'], ARRAY['beige', 'black'], 'awin_feed', 'BB-TRN-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
-- Women's Accessories
('Leather Crossbody Bag', 'Celine', 1850, 'EUR', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', 'Celine', 'accessories', 'women', ARRAY['luxury', 'everyday', 'investment'], ARRAY['tan', 'black'], 'awin_feed', 'CL-CRS-001', 'https://click.linksynergy.com/deeplink?id=DEMO'),
('Gold Hoop Earrings', 'Mejuri', 98, 'EUR', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 'Mejuri', 'accessories', 'women', ARRAY['minimal', 'everyday', 'jewelry'], ARRAY['gold'], 'awin_feed', 'MJ-HOP-001', 'https://click.linksynergy.com/deeplink?id=DEMO');