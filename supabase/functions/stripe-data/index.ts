import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[STRIPE-DATA] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const { action, params } = await req.json();
    
    logStep("Received request", { action, params });

    let result: unknown;

    switch (action) {
      case "getBalance": {
        result = await stripe.balance.retrieve();
        logStep("Balance retrieved", result);
        break;
      }

      case "getPaymentIntents": {
        const limit = params?.limit || 100;
        const startingAfter = params?.startingAfter;
        const created = params?.created;
        
        const options: Stripe.PaymentIntentListParams = { 
          limit,
          expand: ['data.customer']
        };
        if (startingAfter) options.starting_after = startingAfter;
        if (created) options.created = created;
        
        result = await stripe.paymentIntents.list(options);
        logStep("Payment intents retrieved", { count: (result as Stripe.ApiList<Stripe.PaymentIntent>).data.length });
        break;
      }

      case "getCharges": {
        const limit = params?.limit || 100;
        const startingAfter = params?.startingAfter;
        const created = params?.created;
        
        const options: Stripe.ChargeListParams = { 
          limit,
          expand: ['data.customer', 'data.balance_transaction']
        };
        if (startingAfter) options.starting_after = startingAfter;
        if (created) options.created = created;
        
        result = await stripe.charges.list(options);
        logStep("Charges retrieved", { count: (result as Stripe.ApiList<Stripe.Charge>).data.length });
        break;
      }

      case "getPayouts": {
        const limit = params?.limit || 100;
        const startingAfter = params?.startingAfter;
        const created = params?.created;
        
        const options: Stripe.PayoutListParams = { limit };
        if (startingAfter) options.starting_after = startingAfter;
        if (created) options.created = created;
        
        result = await stripe.payouts.list(options);
        logStep("Payouts retrieved", { count: (result as Stripe.ApiList<Stripe.Payout>).data.length });
        break;
      }

      case "getBalanceTransactions": {
        const limit = params?.limit || 100;
        const startingAfter = params?.startingAfter;
        const created = params?.created;
        const type = params?.type;
        
        const options: Stripe.BalanceTransactionListParams = { limit };
        if (startingAfter) options.starting_after = startingAfter;
        if (created) options.created = created;
        if (type) options.type = type;
        
        result = await stripe.balanceTransactions.list(options);
        logStep("Balance transactions retrieved", { count: (result as Stripe.ApiList<Stripe.BalanceTransaction>).data.length });
        break;
      }

      case "getCustomers": {
        const limit = params?.limit || 100;
        const startingAfter = params?.startingAfter;
        
        const options: Stripe.CustomerListParams = { limit };
        if (startingAfter) options.starting_after = startingAfter;
        
        result = await stripe.customers.list(options);
        logStep("Customers retrieved", { count: (result as Stripe.ApiList<Stripe.Customer>).data.length });
        break;
      }

      case "getSubscriptions": {
        const limit = params?.limit || 100;
        const status = params?.status || 'all';
        
        const options: Stripe.SubscriptionListParams = { limit, status };
        
        result = await stripe.subscriptions.list(options);
        logStep("Subscriptions retrieved", { count: (result as Stripe.ApiList<Stripe.Subscription>).data.length });
        break;
      }

      case "getInvoices": {
        const limit = params?.limit || 100;
        const startingAfter = params?.startingAfter;
        const status = params?.status;
        
        const options: Stripe.InvoiceListParams = { limit };
        if (startingAfter) options.starting_after = startingAfter;
        if (status) options.status = status;
        
        result = await stripe.invoices.list(options);
        logStep("Invoices retrieved", { count: (result as Stripe.ApiList<Stripe.Invoice>).data.length });
        break;
      }

      case "getProducts": {
        const limit = params?.limit || 100;
        
        result = await stripe.products.list({ limit, active: true });
        logStep("Products retrieved", { count: (result as Stripe.ApiList<Stripe.Product>).data.length });
        break;
      }

      case "getDashboardSummary": {
        // Get all data in parallel
        const [balance, charges, payouts, balanceTransactions] = await Promise.all([
          stripe.balance.retrieve(),
          stripe.charges.list({ limit: 100, expand: ['data.balance_transaction'] }),
          stripe.payouts.list({ limit: 50 }),
          stripe.balanceTransactions.list({ limit: 100 })
        ]);

        result = {
          balance,
          charges: charges.data,
          payouts: payouts.data,
          balanceTransactions: balanceTransactions.data
        };
        logStep("Dashboard summary retrieved");
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
