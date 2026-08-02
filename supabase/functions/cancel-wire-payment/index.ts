/**
 * Cancel Wire Payment Edge Function
 * 
 * Cancels a pending Wire payment and updates the order status.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================
// Configuration
// ============================================

const WIRE_API_BASE = "https://api.wire.mn/v1";
const WIRE_API_KEY = Deno.env.get("WIRE_SECRET_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// ============================================
// Types
// ============================================

interface CancelPaymentRequest {
  orderId: string;
}

// ============================================
// Main Handler
// ============================================

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CancelPaymentRequest = await req.json();
    
    if (!body.orderId) {
      return Response.json(
        { error: { message: "Order ID is required", code: "MISSING_ORDER_ID" } },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, wire_payment_intent_id, payment_status")
      .eq("id", body.orderId)
      .single();

    if (orderError || !order) {
      return Response.json(
        { error: { message: "Order not found", code: "ORDER_NOT_FOUND" } },
        { status: 404, headers: corsHeaders }
      );
    }

    // Check if payment can be cancelled
    if (!order.wire_payment_intent_id) {
      // No payment initiated yet, just mark as cancelled
      await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "cancelled",
          order_status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.orderId);

      return Response.json({ cancelled: true, by_api: false }, { headers: corsHeaders });
    }

    // Cancel with Wire API
    try {
      const response = await fetch(
        `${WIRE_API_BASE}/payment_intents/${order.wire_payment_intent_id}/cancel`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${WIRE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("[cancel-wire-payment] Wire API error:", error);
        
        // Even if Wire API fails, we can mark the order as cancelled locally
        // if the payment intent was in a cancellable state
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "cancelled",
            order_status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.orderId);

        return Response.json(
          { 
            cancelled: true, 
            by_api: false,
            message: "Payment cancelled locally (Wire API unavailable)"
          },
          { headers: corsHeaders }
        );
      }
    } catch (apiError) {
      console.error("[cancel-wire-payment] Wire API call failed:", apiError);
      
      // Mark as cancelled locally
      await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "cancelled",
          order_status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.orderId);

      return Response.json(
        { 
          cancelled: true, 
          by_api: false,
          message: "Payment cancelled locally (Wire API unavailable)"
        },
        { headers: corsHeaders }
      );
    }

    // Update order status
    await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "cancelled",
        order_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.orderId);

    return Response.json({ cancelled: true, by_api: true }, { headers: corsHeaders });

  } catch (error) {
    console.error("[cancel-wire-payment] Error:", error);
    return Response.json(
      { error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: 500, headers: corsHeaders }
    );
  }
});
