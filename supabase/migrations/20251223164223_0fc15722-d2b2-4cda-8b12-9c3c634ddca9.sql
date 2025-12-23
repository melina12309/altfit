-- Create suggestion_feedback table to track user preferences
CREATE TABLE public.suggestion_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  suggestion_title TEXT NOT NULL,
  suggestion_category TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('saved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, suggestion_title)
);

-- Enable RLS
ALTER TABLE public.suggestion_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own feedback"
ON public.suggestion_feedback FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own feedback"
ON public.suggestion_feedback FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
ON public.suggestion_feedback FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
ON public.suggestion_feedback FOR DELETE
USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_suggestion_feedback_user_id ON public.suggestion_feedback(user_id);