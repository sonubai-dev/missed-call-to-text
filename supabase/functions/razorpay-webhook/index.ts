import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");

    // Optional HMAC signature verification if secret is provided
    if (webhookSecret && signature) {
      const keyBuf = new TextEncoder().encode(webhookSecret);
      const dataBuf = new TextEncoder().encode(rawBody);
      const key = await crypto.subtle.importKey(
        "raw",
        keyBuf,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signatureBuf = await crypto.subtle.sign("HMAC", key, dataBuf);
      const expectedHex = Array.from(new Uint8Array(signatureBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (expectedHex !== signature) {
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const subscriptionEntity = payload.payload?.subscription?.entity;

    const deviceId =
      paymentEntity?.notes?.deviceId ||
      subscriptionEntity?.notes?.deviceId ||
      payload.deviceId ||
      null;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Record the payment event
    await supabase.from("payments").insert({
      device_id: deviceId,
      razorpay_order_id: paymentEntity?.order_id || null,
      razorpay_payment_id: paymentEntity?.id || null,
      razorpay_subscription_id: subscriptionEntity?.id || paymentEntity?.subscription_id || null,
      razorpay_signature: signature || null,
      amount: paymentEntity?.amount || 9900,
      currency: paymentEntity?.currency || "INR",
      status: paymentEntity?.status || event || "received",
      event_type: event || "manual",
      payload: payload,
    });

    // Update device validity if payment or subscription succeeded
    if (deviceId && (event === "payment.captured" || event === "subscription.charged")) {
      const newValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await supabase
        .from("devices")
        .update({
          status: "active",
          valid_until: newValidUntil,
          razorpay_subscription_id: subscriptionEntity?.id || paymentEntity?.subscription_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("device_id", deviceId);
    } else if (deviceId && (event === "subscription.halted" || event === "subscription.cancelled")) {
      await supabase
        .from("devices")
        .update({
          status: event === "subscription.halted" ? "halted" : "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("device_id", deviceId);
    }

    return new Response(JSON.stringify({ success: true, event }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
