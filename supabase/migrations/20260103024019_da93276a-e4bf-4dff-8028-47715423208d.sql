-- Step 1: Drop all RLS policies that depend on user_id columns
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.manual_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.manual_transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.manual_transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.manual_transactions;
DROP POLICY IF EXISTS "Allow all manual transaction operations" ON public.manual_transactions;

DROP POLICY IF EXISTS "Users can insert their own business entity" ON public.business_entity;
DROP POLICY IF EXISTS "Users can update their own business entity" ON public.business_entity;
DROP POLICY IF EXISTS "Users can view their own business entity" ON public.business_entity;
DROP POLICY IF EXISTS "Allow all business entity operations" ON public.business_entity;

DROP POLICY IF EXISTS "Users can delete their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can insert their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can update their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can view their own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Allow all recurring transaction operations" ON public.recurring_transactions;

-- Step 2: Drop foreign key constraints that reference auth.users
ALTER TABLE public.manual_transactions DROP CONSTRAINT IF EXISTS manual_transactions_user_id_fkey;
ALTER TABLE public.business_entity DROP CONSTRAINT IF EXISTS business_entity_user_id_fkey;
ALTER TABLE public.recurring_transactions DROP CONSTRAINT IF EXISTS recurring_transactions_user_id_fkey;

-- Step 3: Change user_id column type from uuid to text
ALTER TABLE public.manual_transactions 
ALTER COLUMN user_id TYPE text USING user_id::text;

ALTER TABLE public.business_entity 
ALTER COLUMN user_id TYPE text USING user_id::text;

ALTER TABLE public.recurring_transactions 
ALTER COLUMN user_id TYPE text USING user_id::text;

-- Step 4: Create permissive RLS policies for all tables (to work with service role edge functions)
CREATE POLICY "Allow all manual transaction operations" 
ON public.manual_transactions FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all business entity operations" 
ON public.business_entity FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all recurring transaction operations" 
ON public.recurring_transactions FOR ALL
USING (true)
WITH CHECK (true);