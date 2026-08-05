/**
 * Webhook Signature Verification
 *
 * This module provides utilities for verifying Wire webhook signatures.
 */

/**
 * Verifies a webhook signature using HMAC-SHA256.
 *
 * @param payload - Raw request body
 * @param signature - Signature header from webhook
 * @param secret - Webhook secret for verification
 * @returns true if signature is valid
 */
export async function verifySignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    // Parse signature header (format: t=timestamp,v1=signature)
    const parts = signature.split(",");
    const timestampPart = parts.find((p) => p.startsWith("t="));
    const signaturePart = parts.find((p) => p.startsWith("v1="));

    if (!timestampPart || !signaturePart) {
      return false;
    }

    const timestamp = timestampPart.split("=")[1];
    const receivedSignature = signaturePart.split("=")[1];

    // Check timestamp (prevent replay attacks - 5 minutes tolerance)
    const now = Math.floor(Date.now() / 1000);
    const timestampNum = parseInt(timestamp, 10);
    if (Math.abs(now - timestampNum) > 300) {
      console.error("[verify] Timestamp out of range");
      return false;
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload),
    );
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Constant-time comparison
    return timingSafeEqual(receivedSignature, expectedSignature);
  } catch (error) {
    console.error("[verify] Signature verification error:", error);
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
