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

    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();
    
    let body: Record<string, unknown> = {};
    if (req.method !== "GET") {
      body = await req.json().catch(() => ({}));
    }
    
    const userId = body.userId as string | undefined;

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Business Entity endpoints
    if (path === "entity") {
      if (req.method === "POST") {
        const { userId: _, action, ...entityData } = body as Record<string, unknown>;
        
        // If action is 'get' or no data provided, fetch the entity
        if (action === 'get' || Object.keys(entityData).length === 0) {
          const { data, error } = await supabase
            .from("business_entity")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Upsert - create or update
        const { data: existing } = await supabase
          .from("business_entity")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        let result;
        if (existing) {
          const { data, error } = await supabase
            .from("business_entity")
            .update(entityData)
            .eq("user_id", userId)
            .select()
            .single();
          if (error) throw error;
          result = data;
        } else {
          const { data, error } = await supabase
            .from("business_entity")
            .insert({ ...entityData, user_id: userId })
            .select()
            .single();
          if (error) throw error;
          result = data;
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Domains endpoints
    if (path === "domains") {
      if (req.method === "POST") {
        const { userId: _, action, ...domainData } = body as Record<string, unknown>;
        
        // If action is 'get' or no data provided, fetch domains
        if (action === 'get' || Object.keys(domainData).length === 0) {
          const { data, error } = await supabase
            .from("domains")
            .select("*")
            .eq("user_id", userId)
            .order("expiration_date", { ascending: true, nullsFirst: false });

          if (error) throw error;
          return new Response(JSON.stringify(data || []), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Add new domain
        const { data, error } = await supabase
          .from("domains")
          .insert({ ...domainData, user_id: userId })
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (path === "domain") {
      const domainId = url.searchParams.get("id");

      if (req.method === "PUT" && domainId) {
        const { userId: _, ...updateData } = body as Record<string, unknown>;
        const { data, error } = await supabase
          .from("domains")
          .update(updateData)
          .eq("id", domainId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (req.method === "DELETE" && domainId) {
        const { error } = await supabase
          .from("domains")
          .delete()
          .eq("id", domainId)
          .eq("user_id", userId);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
