import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";
import {
  buildEmail, escapeHtml, infoCard, BRAND,
} from "../_shared/emailTemplate.ts";
import { checkRateLimit } from "../_shared/rateLimiter.ts";

const resend    = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
const fromName  = Deno.env.get("RESEND_FROM_NAME")  || BRAND.name;
const adminNotificationEmails = (Deno.env.get("APPLICATION_NOTIFICATION_EMAILS") || "")
  .split(",").map((e) => e.trim()).filter(Boolean);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimit = checkRateLimit(`contact-message:${ip}`, { maxRequests: 5, windowMs: 60000 });
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: "Trop de tentatives, réessayez plus tard." }), {
        status: 429, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { contactMessageId } = await req.json();
    if (!contactMessageId) throw new Error("contactMessageId is required");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: msg, error: msgError } = await supabaseAdmin
      .from("contact_messages").select("*").eq("id", contactMessageId).single();
    if (msgError || !msg) throw new Error("Message introuvable");

    // Confirmation à l'utilisateur
    const userHtml = buildEmail({
      headerIcon: "✅",
      headerTitle: "Message bien reçu",
      headerSubtitle: "Nous revenons vers vous rapidement",
      body: `
        <p class="greeting">Bonjour ${escapeHtml(msg.name)},</p>
        <p class="message">
          Merci de nous avoir contactés. Votre message a bien été reçu par l'équipe <strong>${BRAND.name}</strong>
          et nous vous répondrons dans les meilleurs délais.
        </p>
        ${infoCard("📋 Récapitulatif de votre message", [
          { label: "Sujet", value: escapeHtml(msg.subject) },
        ])}
      `,
      footerNote: "Cet email a été envoyé automatiquement suite à votre message via le formulaire de contact.",
    });

    const userEmailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [msg.email],
      subject: "Nous avons bien reçu votre message ✓",
      html: userHtml,
    });
    const userErr = (userEmailResponse as any).error;
    if (userErr) throw new Error(userErr.message || "Failed to send confirmation email");

    // Notification admin
    if (adminNotificationEmails.length > 0) {
      await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: adminNotificationEmails,
        subject: `Nouveau message de contact — ${msg.name}`,
        html: buildEmail({
          headerTitle: "Nouveau message de contact",
          headerSubtitle: `De : ${msg.name}`,
          body: `
            ${infoCard("📋 Détails", [
              { label: "Nom",    value: escapeHtml(msg.name) },
              { label: "Email",  value: escapeHtml(msg.email) },
              { label: "Sujet",  value: escapeHtml(msg.subject) },
              { label: "Message", value: escapeHtml(msg.message) },
            ])}
          `,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("send-contact-notification error:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
