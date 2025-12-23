-- Create saved_outfits table for custom outfits from builder
CREATE TABLE public.saved_outfits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('women', 'men')),
  items JSONB NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  budget NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_wardrobe table for locked/owned items
CREATE TABLE public.user_wardrobe (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id TEXT NOT NULL,
  item_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Enable RLS
ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wardrobe ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_outfits
CREATE POLICY "Users can view their own outfits"
ON public.saved_outfits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outfits"
ON public.saved_outfits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfits"
ON public.saved_outfits FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfits"
ON public.saved_outfits FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for user_wardrobe
CREATE POLICY "Users can view their own wardrobe"
ON public.user_wardrobe FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their wardrobe"
ON public.user_wardrobe FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their wardrobe"
ON public.user_wardrobe FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_saved_outfits_updated_at
BEFORE UPDATE ON public.saved_outfits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_saved_outfits_user_id ON public.saved_outfits(user_id);
CREATE INDEX idx_user_wardrobe_user_id ON public.user_wardrobe(user_id);