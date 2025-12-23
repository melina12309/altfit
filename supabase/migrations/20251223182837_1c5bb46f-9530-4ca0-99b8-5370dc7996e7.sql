-- Add unique constraint for upsert on provider + provider_product_id
ALTER TABLE public.products 
ADD CONSTRAINT products_provider_product_unique 
UNIQUE (provider, provider_product_id);