import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create client with service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, userId, data, id } = await req.json();

    console.log(`Recurring transactions: action=${action}, userId=${userId}, id=${id}`);

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;

    switch (action) {
      case 'list': {
        console.log('Fetching recurring transactions for user:', userId);
        const { data: transactions, error } = await supabase
          .from('recurring_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching transactions:', error);
          throw error;
        }
        result = { transactions };
        break;
      }

      case 'create': {
        console.log('Creating recurring transaction:', data);
        const { data: transaction, error } = await supabase
          .from('recurring_transactions')
          .insert({
            ...data,
            user_id: userId,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating transaction:', error);
          throw error;
        }
        result = { transaction };
        break;
      }

      case 'update': {
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'Transaction ID is required for update' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Updating recurring transaction:', id, data);
        const { data: transaction, error } = await supabase
          .from('recurring_transactions')
          .update(data)
          .eq('id', id)
          .eq('user_id', userId) // Security: ensure user owns this transaction
          .select()
          .single();

        if (error) {
          console.error('Error updating transaction:', error);
          throw error;
        }
        result = { transaction };
        break;
      }

      case 'delete': {
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'Transaction ID is required for delete' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Deleting recurring transaction:', id);
        const { error } = await supabase
          .from('recurring_transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', userId); // Security: ensure user owns this transaction

        if (error) {
          console.error('Error deleting transaction:', error);
          throw error;
        }
        result = { success: true };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: list, create, update, delete' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('Operation successful:', action);
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in recurring-transactions function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
