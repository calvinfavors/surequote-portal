import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getAuthenticatedClient(authHeader: string) {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
}

function getAdminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function handleSync(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ error: "Missing authorization" }, 401);

  const supabase = getAuthenticatedClient(authHeader);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user)
    return jsonResponse({ error: "Unauthorized" }, 401);

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return jsonResponse({ synced: false, status: "" });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2024-12-18.acacia",
  });

  const subscriptions = await stripe.subscriptions.list({
    customer: profile.stripe_customer_id,
    status: "all",
    limit: 1,
  });

  const adminClient = getAdminClient();

  if (subscriptions.data.length > 0) {
    const sub = subscriptions.data[0];
    await adminClient
      .from("profiles")
      .update({
        stripe_subscription_id: sub.id,
        subscription_status: sub.status,
        subscription_current_period_end: new Date(
          sub.current_period_end * 1000
        ).toISOString(),
      })
      .eq("id", user.id);

    return jsonResponse({ synced: true, status: sub.status });
  }

  return jsonResponse({ synced: false, status: "" });
}

async function handleCheckout(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ error: "Missing authorization" }, 401);

  const supabase = getAuthenticatedClient(authHeader);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user)
    return jsonResponse({ error: "Unauthorized" }, 401);

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2024-12-18.acacia",
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .maybeSingle();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || profile?.email || "",
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    const adminClient = getAdminClient();
    await adminClient
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const origin =
    req.headers.get("origin") || req.headers.get("referer") || "";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: "price_1TLpSeAhmf2h4c03ETo9Ahtz", quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${origin}/dashboard?subscription=success`,
    cancel_url: `${origin}/subscribe?canceled=true`,
    metadata: { supabase_user_id: user.id },
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
  });

  return jsonResponse({ url: session.url });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method === "GET") {
      return await handleSync(req);
    }
    return await handleCheckout(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return jsonResponse({ error: message }, 500);
  }
});
