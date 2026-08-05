/**
 * @deprecated This function is deprecated.
 * Payment cancellation is now handled directly in the client via services/payment.ts
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  return Response.json(
    { error: "This function is deprecated" },
    { status: 410 },
  );
});
