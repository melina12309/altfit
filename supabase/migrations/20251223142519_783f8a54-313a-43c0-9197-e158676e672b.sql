-- Add deny-all policy for api_rate_limits table
-- This table is managed exclusively by the check_rate_limit SECURITY DEFINER function
-- Direct access should be blocked for all users

CREATE POLICY "No direct access - managed by check_rate_limit function"
ON public.api_rate_limits
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);