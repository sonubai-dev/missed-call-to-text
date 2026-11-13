import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, deviceId, orderId, paymentId, signature } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const keyId = Deno.env.get("RAZORPAY_KEY_ID") || "";
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "";

    if (action === "create_order") {
      // Create a Razorpay Order (e.g. ₹99 = 9900 paise)
      const authHeader = "Basic " + btoa(`${keyId}:${keySecret}`);
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 9900,
          currency: "INR",
          receipt: `rcpt_${deviceId}_${Date.now()}`,
          notes: { deviceId },
        }),
      });

      const orderData = await res.json();
      return new Response(JSON.stringify(orderData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify_payment") {
      // Record payment & extend device validity
      if (deviceId) {
        const newValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        await supabase
          .from("devices")
          .update({
            status: "active",
            valid_until: newValidUntil,
            updated_at: new Date().toISOString(),
          })
          .eq("device_id", deviceId);

        await supabase.from("payments").insert({
          device_id: deviceId,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          amount: 9900,
          currency: "INR",
          status: "captured",
          event_type: "client_verification",
        });
      }

      return new Response(JSON.stringify({ success: true, status: "active" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
