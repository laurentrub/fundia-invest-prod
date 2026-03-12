import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";
import {
  buildEmail, escapeHtml, infoCard, referenceBox, statusBadge,
  BRAND, LOAN_TYPE_LABELS, formatCurrency,
} from "../_shared/emailTemplate.ts";

const resend    = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
const fromName  = Deno.env.get("RESEND_FROM_NAME")  || BRAND.name;
const frontendUrl = (Deno.env.get("FRONTEND_URL") || BRAND.website).replace(/\/+$/, "");
const adminNotificationEmails = (Deno.env.get("APPLICATION_NOTIFICATION_EMAILS") || "")
  .split(",").map((e) => e.trim()).filter(Boolean);

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
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { loanRequestId } = await req.json();
    if (!loanRequestId) throw new Error("loanRequestId is required");

    const { data: roleData } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", user.id)
      .in("role", ["admin", "manager"]).maybeSingle();
    const isAdminOrManager = !!roleData;

    const { data: loan, error: loanError } = await supabaseAdmin
      .from("loan_requests").select("*").eq("id", loanRequestId).single();
    if (loanError || !loan) throw new Error("Demande introuvable");

    if (!isAdminOrManager && loan.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const loanTypeLabel = LOAN_TYPE_LABELS[loan.loan_type] || loan.loan_type;
    const formattedDate = new Date(loan.created_at).toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

    const body = `
      <p class="greeting">Bonjour ${escapeHtml(loan.first_name)} ${escapeHtml(loan.last_name)},</p>

      <p class="message">
        Merci d'avoir choisi <strong>${BRAND.name}</strong> pour votre projet de financement.
        Nous avons bien reçu votre demande et nous vous confirmons son enregistrement.
      </p>

      ${referenceBox(loan.id.substring(0, 8).toUpperCase())}

      ${infoCard("📋 Récapitulatif de votre demande", [
        { label: "Type de crédit",  value: escapeHtml(loanTypeLabel) },
        { label: "Montant demandé", value: formatCurrency(loan.amount) },
        { label: "Durée souhaitée", value: `${loan.duration} mois` },
        { label: "Date de dépôt",   value: escapeHtml(formattedDate) },
        { label: "Statut actuel",   value: statusBadge("pending") },
      ])}

      <h3 style="color:#1B4F8C; margin-bottom:20px; font-size:16px;">📅 Les prochaines étapes</h3>

      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-dot done">✓</div>
          <div class="timeline-content">
            <strong>Réception de votre demande</strong>
            <span>Votre dossier a été enregistré dans notre système</span>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot todo">2</div>
          <div class="timeline-content">
            <strong>Analyse de votre dossier</strong>
            <span>Notre équipe va examiner votre demande sous 24-48h</span>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot todo">3</div>
          <div class="timeline-content">
            <strong>Réponse et accompagnement</strong>
            <span>Vous serez informé par email de notre décision</span>
          </div>
        </div>
      </div>

      <div class="alert-box">
        <strong>💡 Besoin d'aide ?</strong>
        <p>Notre équipe est à votre disposition : <strong>${BRAND.email}</strong></p>
      </div>
    `;

    const html = buildEmail({
      headerIcon: "✅",
      headerTitle: "Demande enregistrée",
      headerSubtitle: "Nous avons bien reçu votre dossier",
      body,
      ctaLabel: "Suivre ma demande",
      ctaUrl: `${frontendUrl}/profile`,
      footerNote: "Cet email a été envoyé automatiquement suite à votre demande de crédit.",
    });

    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [loan.email],
      subject: "Confirmation de réception de votre demande ✓",
      html,
    });

    const err = (emailResponse as any).error;
    if (err) throw new Error(err.message || "Failed to send confirmation email");

    // Notification admin
    if (adminNotificationEmails.length > 0) {
      await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: adminNotificationEmails,
        subject: `Nouvelle demande — ${loan.first_name} ${loan.last_name}`,
        html: buildEmail({
          headerTitle: "Nouvelle demande reçue",
          headerSubtitle: `De : ${loan.first_name} ${loan.last_name}`,
          body: `
            <p class="message">Une nouvelle demande de crédit vient d'être soumise.</p>
            ${infoCard("📋 Détails", [
              { label: "Client",   value: escapeHtml(`${loan.first_name} ${loan.last_name}`) },
              { label: "Email",    value: escapeHtml(loan.email) },
              { label: "Type",     value: escapeHtml(loanTypeLabel) },
              { label: "Montant",  value: formatCurrency(loan.amount) },
              { label: "Durée",    value: `${loan.duration} mois` },
              { label: "Référence", value: loan.id.substring(0, 8).toUpperCase() },
            ])}
          `,
          ctaLabel: "Voir la demande dans l'admin",
          ctaUrl: `${frontendUrl}/admin/requests/${loan.id}`,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("send-application-confirmation error:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
