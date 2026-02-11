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

    console.log(`Processing request: ${req.method} ${path} for user ${userId}`);

    // Business Entity endpoints
    if (path === "entity") {
      if (req.method === "POST") {
        const { userId: _, action, ...entityData } = body as Record<string, unknown>;
        
        // If action is 'get', fetch the entity
        if (action === 'get') {
          console.log("Fetching business entity for user:", userId);
          const { data, error } = await supabase
            .from("business_entity")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          if (error) {
            console.error("Error fetching entity:", error);
            throw error;
          }
          console.log("Entity fetched:", data);
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Upsert - create or update
        console.log("Upserting entity data:", entityData);
        const { data: existing } = await supabase
          .from("business_entity")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        let result;
        if (existing) {
          console.log("Updating existing entity:", existing.id);
          const { data, error } = await supabase
            .from("business_entity")
            .update(entityData)
            .eq("user_id", userId)
            .select()
            .single();
          if (error) {
            console.error("Update error:", error);
            throw error;
          }
          result = data;
        } else {
          console.log("Creating new entity for user:", userId);
          const { data, error } = await supabase
            .from("business_entity")
            .insert({ ...entityData, user_id: userId })
            .select()
            .single();
          if (error) {
            console.error("Insert error:", error);
            throw error;
          }
          result = data;
        }

        console.log("Entity saved:", result);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Domains endpoints
    if (path === "domains") {
      if (req.method === "POST") {
        const { userId: _, action, ...domainData } = body as Record<string, unknown>;
        
        // If action is 'get', fetch domains
        if (action === 'get') {
          console.log("Fetching domains for user:", userId);
          const { data, error } = await supabase
            .from("domains")
            .select("*")
            .eq("user_id", userId)
            .order("expiration_date", { ascending: true, nullsFirst: false });

          if (error) {
            console.error("Error fetching domains:", error);
            throw error;
          }
          console.log("Domains fetched:", data?.length);
          return new Response(JSON.stringify(data || []), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Add new domain
        console.log("Adding domain:", domainData);
        const { data, error } = await supabase
          .from("domains")
          .insert({ ...domainData, user_id: userId })
          .select()
          .single();

        if (error) {
          console.error("Error adding domain:", error);
          throw error;
        }
        console.log("Domain added:", data);
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (path === "domain") {
      const domainId = url.searchParams.get("id");

      if (req.method === "PUT" && domainId) {
        const { userId: _, ...updateData } = body as Record<string, unknown>;
        console.log("Updating domain:", domainId, updateData);
        const { data, error } = await supabase
          .from("domains")
          .update(updateData)
          .eq("id", domainId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) {
          console.error("Error updating domain:", error);
          throw error;
        }
        console.log("Domain updated:", data);
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (req.method === "DELETE" && domainId) {
        console.log("Deleting domain:", domainId);
        const { error } = await supabase
          .from("domains")
          .delete()
          .eq("id", domainId)
          .eq("user_id", userId);

        if (error) {
          console.error("Error deleting domain:", error);
          throw error;
        }
        console.log("Domain deleted");
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Corporate Events endpoints
    if (path === "events") {
      if (req.method === "POST") {
        const { userId: _, action, ...eventData } = body as Record<string, unknown>;
        
        if (action === 'get') {
          console.log("Fetching corporate events for user:", userId);
          const { data, error } = await supabase
            .from("corporate_events")
            .select("*")
            .eq("user_id", userId)
            .order("event_date", { ascending: true });

          if (error) {
            console.error("Error fetching events:", error);
            throw error;
          }
          return new Response(JSON.stringify(data || []), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Add new event
        console.log("Adding event:", eventData);
        const { data, error } = await supabase
          .from("corporate_events")
          .insert({ ...eventData, user_id: userId })
          .select()
          .single();

        if (error) {
          console.error("Error adding event:", error);
          throw error;
        }
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (path === "event") {
      const eventId = url.searchParams.get("id");

      if (req.method === "PUT" && eventId) {
        const { userId: _, ...updateData } = body as Record<string, unknown>;
        console.log("Updating event:", eventId, updateData);
        const { data, error } = await supabase
          .from("corporate_events")
          .update(updateData)
          .eq("id", eventId)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) {
          console.error("Error updating event:", error);
          throw error;
        }
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (req.method === "DELETE" && eventId) {
        console.log("Deleting event:", eventId);
        const { error } = await supabase
          .from("corporate_events")
          .delete()
          .eq("id", eventId)
          .eq("user_id", userId);

        if (error) {
          console.error("Error deleting event:", error);
          throw error;
        }
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
