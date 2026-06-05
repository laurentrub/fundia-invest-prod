import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { checkRateLimit, createRateLimitResponse, getClientIdentifier, getRateLimitHeaders } from "../_shared/rateLimiter.ts";
import { buildEmail, escapeHtml, BRAND } from "../_shared/emailTemplate.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
const fromName = Deno.env.get("RESEND_FROM_NAME") || BRAND.name;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CustomEmailRequest {
  loanRequestId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email || '';

    // Rate limiting - 10 emails per minute per user
    const clientId = getClientIdentifier(req, userEmail);
    const rateLimitResult = checkRateLimit(clientId, { maxRequests: 10, windowMs: 60000 });

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, corsHeaders);
    }

    // Verify admin/manager role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "manager"])
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin or manager access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { recipientEmail, recipientName, subject, body }: CustomEmailRequest = await req.json();

    if (!recipientEmail || !subject || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const htmlBody = escapeHtml(body).replace(/\n/g, '<br>');

    const html = buildEmail({
      headerTitle: escapeHtml(subject),
      body: `
        <p class="greeting">Bonjour ${escapeHtml(recipientName)},</p>
        <div class="message">${htmlBody}</div>
      `,
      footerNote: "Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.",
    });

    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [recipientEmail],
      subject,
      html,
    });

    console.log("Custom email sent to:", recipientEmail, "Response:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
          ...getRateLimitHeaders(rateLimitResult)
        }
      }
    );
  } catch (error: any) {
    console.error("Error sending custom email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
