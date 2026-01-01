-- Create business entity table for storing corporate information
CREATE TABLE public.business_entity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL DEFAULT 'XZ1 Recording Ventures Inc.',
  entity_type TEXT NOT NULL DEFAULT 'C Corporation',
  state_of_incorporation TEXT NOT NULL DEFAULT 'Hawaii',
  incorporation_date DATE,
  fiscal_year_end TEXT DEFAULT 'December 31',
  hawaii_business_id TEXT,
  irs_ein TEXT,
  registered_agent_name TEXT,
  registered_agent_address TEXT,
  registered_agent_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create domains table for portfolio tracking
CREATE TABLE public.domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain_name TEXT NOT NULL,
  registrar TEXT,
  expiration_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  primary_use TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_entity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_entity
CREATE POLICY "Users can view their own business entity"
ON public.business_entity FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business entity"
ON public.business_entity FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business entity"
ON public.business_entity FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for domains
CREATE POLICY "Users can view their own domains"
ON public.domains FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own domains"
ON public.domains FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own domains"
ON public.domains FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own domains"
ON public.domains FOR DELETE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_business_entity_updated_at
BEFORE UPDATE ON public.business_entity
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_domains_updated_at
BEFORE UPDATE ON public.domains
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();