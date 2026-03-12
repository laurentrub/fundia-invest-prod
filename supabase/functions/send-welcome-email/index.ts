import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { buildEmail, escapeHtml, BRAND } from "../_shared/emailTemplate.ts";

const resend    = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
const fromName  = Deno.env.get("RESEND_FROM_NAME")  || BRAND.name;
const frontendUrl = (Deno.env.get("FRONTEND_URL") || BRAND.website).replace(/\/+$/, "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { firstName, lastName } = await req.json();
    if (!firstName) throw new Error("firstName is required");

    const body = `
      <p class="greeting">Bonjour ${escapeHtml(firstName)} ${escapeHtml(lastName || "")},</p>

      <p class="message">
        Nous sommes ravis de vous accueillir sur <strong>${BRAND.name}</strong> !
        Votre compte a été créé avec succès et vous pouvez dès maintenant accéder à votre espace personnel.
      </p>

      <div class="info-card">
        <div class="info-card-title">🚀 Ce que vous pouvez faire</div>
        <div class="info-row">
          <span class="info-label">💰 Demander un crédit</span>
          <span class="info-value">Prêt personnel, auto, travaux…</span>
        </div>
        <div class="info-row">
          <span class="info-label">🏢 Financer votre projet</span>
          <span class="info-value">Solutions entreprise sur mesure</span>
        </div>
        <div class="info-row">
          <span class="info-label">📊 Suivre vos demandes</span>
          <span class="info-value">Espace personnel dédié</span>
        </div>
        <div class="info-row">
          <span class="info-label">📋 Gérer vos documents</span>
          <span class="info-value">Upload sécurisé en ligne</span>
        </div>
      </div>

      <div class="alert-box">
        <strong>💡 Conseil</strong>
        <p>Complétez votre profil pour accélérer le traitement de vos futures demandes.</p>
      </div>
    `;

    const html = buildEmail({
      headerIcon: "👋",
      headerTitle: "Bienvenue chez Fundia Invest",
      headerSubtitle: "Votre compte a été créé avec succès",
      body,
      ctaLabel: "Accéder à mon espace",
      ctaUrl: frontendUrl,
      footerNote: "Cet email a été envoyé suite à la création de votre compte.",
    });

    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [user.email],
      subject: `Bienvenue chez ${BRAND.name} !`,
      html,
    });

    const err = (emailResponse as any).error;
    if (err) throw new Error(err.message || "Failed to send welcome email");

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("send-welcome-email error:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
