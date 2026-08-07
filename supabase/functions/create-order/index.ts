/**
 * Create Order Edge Function
 *
 * This Edge Function creates a new order with server-side validation and price calculation.
 *
 * SECURITY:
 * - Validates product exists and is available
 * - Validates size, color, and quantity
 * - Calculates prices server-side (never trusts client)
 * - Creates product snapshot from database
 * - Returns structured response
 */

//// <reference lib="deno.unstable" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================
// Configuration
// ============================================

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// ============================================
// Types
// ============================================

interface CreateOrderRequest {
  productId: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  shippingMethod: "standard" | "express";
  shippingAddress: {
    name: string;
    phone: string;
    email: string;
    city: string;
    district: string;
    street: string;
    postalCode?: string;
    deliveryInstructions: string;
  };
}

interface CreateOrderResponse {
  success: boolean;
  order?: {
    id: string;
    subtotal: number;
    shippingFee: number;
    total: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

// ============================================
// Error Handling
// ============================================

class OrderCreationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "OrderCreationError";
  }
}

// ============================================
// Shipping Fee Calculation
// ============================================

function calculateShippingFee(shippingMethod: "standard" | "express"): number {
  const fees = {
    standard: 3500,
    express: 8500,
  };
  return fees[shippingMethod];
}

// ============================================
// Main Handler
// ============================================

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json(
      { error: { message: "Method not allowed", code: "METHOD_NOT_ALLOWED" } },
      { status: 405, headers: corsHeaders },
    );
  }

  try {
    console.log("[create-order] Request received:", req.url);

    // Parse request
    const body: CreateOrderRequest = await req.json();

    // Validate required fields
    if (
      !body.productId ||
      !body.selectedSize ||
      !body.selectedColor ||
      !body.quantity ||
      !body.shippingMethod ||
      !body.shippingAddress
    ) {
      throw new OrderCreationError(
        "Missing required fields",
        "MISSING_REQUIRED_FIELDS",
        400,
      );
    }

    if (body.quantity < 1 || !Number.isInteger(body.quantity)) {
      throw new OrderCreationError("Invalid quantity", "INVALID_QUANTITY", 400);
    }

    // Create admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user session (optional - guest checkout allowed)
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      try {
        const {
          data: { user },
        } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
        userId = user?.id || null;
      } catch (error) {
        console.log("[create-order] No valid auth token, proceeding as guest");
      }
    }

    console.log("[create-order] User ID:", userId || "guest");

    // Fetch product from database
    console.log("[create-order] Fetching product:", body.productId);
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", body.productId)
      .single();

    if (productError || !product) {
      console.error("[create-order] Product not found:", productError);
      throw new OrderCreationError(
        "Product not found",
        "PRODUCT_NOT_FOUND",
        404,
      );
    }

    console.log("[create-order] Product found:", product.id, product.name);

    // Validate product is available
    if (!product.is_available) {
      throw new OrderCreationError(
        "Product is not available",
        "PRODUCT_NOT_AVAILABLE",
        400,
      );
    }

    // Validate size
    if (product.available_sizes && product.available_sizes.length > 0) {
      if (!product.available_sizes.includes(body.selectedSize)) {
        throw new OrderCreationError(
          `Size ${body.selectedSize} is not available`,
          "INVALID_SIZE",
          400,
        );
      }
    }

    // Validate color
    if (product.available_colors && product.available_colors.length > 0) {
      const availableColorNames = product.available_colors.map(
        (c: { name: string }) => c.name,
      );
      if (!availableColorNames.includes(body.selectedColor)) {
        throw new OrderCreationError(
          `Color ${body.selectedColor} is not available`,
          "INVALID_COLOR",
          400,
        );
      }
    }

    // Calculate prices server-side
    const subtotal = product.price * body.quantity;
    const shippingFee = calculateShippingFee(body.shippingMethod);
    const total = subtotal + shippingFee;

    console.log("[create-order] Price calculation:", {
      productPrice: product.price,
      quantity: body.quantity,
      subtotal,
      shippingFee,
      total,
    });

    // Create product snapshot from database
    const productSnapshot = {
      productId: product.id,
      brandId: product.brand_id,
      name: product.name,
      imageUrl: product.thumb,
    };

    // Insert order
    console.log("[create-order] Inserting order");
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        product_snapshot: productSnapshot,
        selected_size: body.selectedSize,
        selected_color: body.selectedColor,
        quantity: body.quantity,
        subtotal,
        shipping_fee: shippingFee,
        total,
        shipping_address: body.shippingAddress,
        status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("[create-order] Failed to insert order:", orderError);
      throw new OrderCreationError(
        orderError?.message || "Failed to create order",
        "ORDER_CREATE_FAILED",
        500,
      );
    }

    console.log("[create-order] Order created successfully:", order.id);

    // Return success response
    return Response.json(
      {
        success: true,
        order: {
          id: order.id,
          subtotal,
          shippingFee,
          total,
        },
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("[create-order] Error:", error);

    if (error instanceof OrderCreationError) {
      return Response.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.statusCode, headers: corsHeaders },
      );
    }

    return Response.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500, headers: corsHeaders },
    );
  }
});
