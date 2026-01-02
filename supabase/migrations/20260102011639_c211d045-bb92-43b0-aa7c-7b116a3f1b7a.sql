-- Drop remaining RLS policies on domains table
DROP POLICY IF EXISTS "Users can view their own domains" ON public.domains;
DROP POLICY IF EXISTS "Users can insert their own domains" ON public.domains;
DROP POLICY IF EXISTS "Users can update their own domains" ON public.domains;
DROP POLICY IF EXISTS "Users can delete their own domains" ON public.domains;

-- Alter domains to use TEXT for user_id
ALTER TABLE public.domains ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Recreate RLS policies with permissive access
CREATE POLICY "Allow all domain operations" ON public.domains FOR ALL USING (true) WITH CHECK (true);

-- Create corporate_events table for corporate calendar
CREATE TABLE IF NOT EXISTS public.corporate_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type TEXT DEFAULT 'general',
  is_reminder BOOLEAN DEFAULT true,
  reminder_days INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.corporate_events ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all corporate event operations" ON public.corporate_events FOR ALL USING (true) WITH CHECK (true);

-- Update trigger
DROP TRIGGER IF EXISTS update_corporate_events_updated_at ON public.corporate_events;
CREATE TRIGGER update_corporate_events_updated_at BEFORE UPDATE ON public.corporate_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();