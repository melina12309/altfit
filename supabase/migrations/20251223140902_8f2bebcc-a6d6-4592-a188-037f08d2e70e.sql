-- Create a rate limiting table for tracking API requests
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  requested_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- No direct access - only through SECURITY DEFINER function
-- Users should not be able to read or write to this table directly

-- Create index for efficient querying
CREATE INDEX idx_rate_limits_user_endpoint_time 
ON public.api_rate_limits (user_id, endpoint, requested_at DESC);

-- Create a function to check and record rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid,
  p_endpoint text,
  p_max_requests integer DEFAULT 20,
  p_window_minutes integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  request_count integer;
  window_start timestamp with time zone;
BEGIN
  -- Validate inputs
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  window_start := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Count requests in the window
  SELECT COUNT(*) INTO request_count
  FROM public.api_rate_limits
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND requested_at > window_start;
  
  -- If over limit, reject
  IF request_count >= p_max_requests THEN
    RETURN false;
  END IF;
  
  -- Record this request
  INSERT INTO public.api_rate_limits (user_id, endpoint, requested_at)
  VALUES (p_user_id, p_endpoint, now());
  
  -- Clean up old entries (older than 1 hour) to prevent table bloat
  DELETE FROM public.api_rate_limits
  WHERE requested_at < now() - interval '1 hour';
  
  RETURN true;
END;
$$;