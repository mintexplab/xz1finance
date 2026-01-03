import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, userId, data, id, startDate, endDate } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Manual transactions: ${action} for user ${userId}`);

    switch (action) {
      case "list": {
        let query = supabase
          .from("manual_transactions")
          .select("*")
          .eq("user_id", userId)
          .order("transaction_date", { ascending: false });

        if (startDate) {
          query = query.gte("transaction_date", startDate);
        }
        if (endDate) {
          query = query.lte("transaction_date", endDate);
        }

        const { data: transactions, error } = await query;

        if (error) {
          console.error("Error fetching transactions:", error);
          throw error;
        }

        return new Response(JSON.stringify({ transactions: transactions || [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "create": {
        const { data: transaction, error } = await supabase
          .from("manual_transactions")
          .insert({ ...data, user_id: userId })
          .select()
          .single();

        if (error) {
          console.error("Error creating transaction:", error);
          throw error;
        }

        console.log("Transaction created:", transaction.id);
        return new Response(JSON.stringify({ transaction }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete": {
        if (!id) {
          return new Response(JSON.stringify({ error: "Transaction ID required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error } = await supabase
          .from("manual_transactions")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);

        if (error) {
          console.error("Error deleting transaction:", error);
          throw error;
        }

        console.log("Transaction deleted:", id);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
