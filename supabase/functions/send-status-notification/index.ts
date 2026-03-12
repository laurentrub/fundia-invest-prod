import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";
import {
  buildEmail, escapeHtml, infoCard, statusBadge,
  BRAND, LOAN_TYPE_LABELS, formatCurrency,
} from "../_shared/emailTemplate.ts";

const resend    = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
const fromName  = Deno.env.get("RESEND_FROM_NAME")  || BRAND.name;
const frontendUrl = (Deno.env.get("FRONTEND_URL") || BRAND.website).replace(/\/+$/, "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STATUS_CONTENT: Record<string, { icon: string; subject: string; subtitle: string; message: string }> = {
  pending: {
    icon: "⏳",
    subject: "Votre dossier est en attente d'examen",
    subtitle: "Dossier en attente",
    message: "Votre demande de crédit est actuellement en attente d'examen. Notre équipe va prochainement étudier votre dossier et vous contactera très rapidement.",
  },
  in_progress: {
    icon: "🔍",
    subject: "Votre dossier est en cours d'analyse",
    subtitle: "Analyse en cours",
    message: "Bonne nouvelle ! Notre équipe a commencé l'analyse détaillée de votre demande. Nous étudions actuellement tous les éléments de votre dossier pour vous proposer la meilleure solution de financement. Vous recevrez une réponse définitive très prochainement.",
  },
  approved: {
    icon: "🎉",
    subject: "Votre demande de crédit est approuvée !",
    subtitle: "Félicitations, votre dossier est accepté",
    message: "Nous sommes heureux de vous informer que votre demande de crédit a été approuvée. Un conseiller vous contactera sous peu pour finaliser le dossier et mettre en place votre financement.",
  },
  refused: {
    icon: "📋",
    subject: "Mise à jour concernant votre demande",
    subtitle: "Réponse concernant votre dossier",
    message: "Après étude approfondie de votre dossier, nous ne sommes malheureusement pas en mesure de donner une suite favorable à votre demande pour le moment. N'hésitez pas à nous contacter pour en savoir plus ou si votre situation évolue.",
  },
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

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

    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", userData.user.id)
      .in("role", ["admin", "manager"]).maybeSingle();
    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { loanRequestId, newStatus } = await req.json();

    const { data: loan, error: loanError } = await supabaseAdmin
      .from("loan_requests").select("*").eq("id", loanRequestId).single();
    if (loanError || !loan) throw new Error("Demande introuvable");

    const content = STATUS_CONTENT[newStatus] ?? STATUS_CONTENT["pending"];
    const loanTypeLabel = LOAN_TYPE_LABELS[loan.loan_type] || loan.loan_type;

    const body = `
      <p class="greeting">Bonjour ${escapeHtml(loan.first_name)} ${escapeHtml(loan.last_name)},</p>

      <p class="message">${content.message}</p>

      ${infoCard("📋 Détails de votre demande", [
        { label: "Type de crédit",  value: escapeHtml(loanTypeLabel) },
        { label: "Montant",         value: formatCurrency(loan.amount) },
        { label: "Durée",           value: `${loan.duration} mois` },
        { label: "Statut actuel",   value: statusBadge(newStatus) },
      ])}

      ${newStatus === "refused" ? `
      <div class="alert-box">
        <strong>📞 Vous avez des questions ?</strong>
        <p>Notre équipe reste disponible pour vous accompagner : <strong>${BRAND.email}</strong></p>
      </div>` : ""}
    `;

    const html = buildEmail({
      headerIcon: content.icon,
      headerTitle: content.subtitle,
      headerSubtitle: `Demande n° ${loan.id.substring(0, 8).toUpperCase()}`,
      body,
      ctaLabel: "Voir mon tableau de bord",
      ctaUrl: `${frontendUrl}/profile`,
      footerNote: "Cet email a été envoyé automatiquement suite à une mise à jour de votre dossier.",
    });

    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [loan.email],
      subject: content.subject,
      html,
    });

    const err = (emailResponse as any).error;
    if (err) throw new Error(err.message || "Failed to send status notification");

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-status-notification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
