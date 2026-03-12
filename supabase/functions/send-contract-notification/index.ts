import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { buildEmail, escapeHtml, infoCard, BRAND, LOAN_TYPE_LABELS, formatCurrency } from "../_shared/emailTemplate.ts";

const resend    = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
const fromName  = Deno.env.get("RESEND_FROM_NAME")  || BRAND.name;
const frontendUrl = (Deno.env.get("FRONTEND_URL") || BRAND.website).replace(/\/+$/, "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContractNotificationPayload {
  contractId: string;
  clientEmail: string;
  clientName: string;
  action: "verified" | "rejected";
  rejectionReason?: string;
  loanType: string;
  amount: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", userData.user.id)
      .in("role", ["admin", "manager"]).maybeSingle();
    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { contractId, clientEmail, clientName, action, rejectionReason, loanType, amount }: ContractNotificationPayload = await req.json();

    const isVerified = action === "verified";
    const loanTypeLabel = LOAN_TYPE_LABELS[loanType] || loanType;

    const body = `
      <p class="greeting">Bonjour ${escapeHtml(clientName)},</p>

      <p class="message">
        ${isVerified
          ? "Nous avons le plaisir de vous informer que votre contrat de prêt a été <strong>validé</strong> par nos services."
          : "Après examen de votre contrat signé, nous ne sommes malheureusement pas en mesure de valider votre dossier en l'état."}
      </p>

      ${infoCard("📋 Détails du contrat", [
        { label: "Type de prêt", value: escapeHtml(loanTypeLabel) },
        { label: "Montant",      value: formatCurrency(amount) },
        ...((!isVerified && rejectionReason) ? [{ label: "Motif", value: escapeHtml(rejectionReason) }] : []),
      ])}

      ${isVerified ? `
      <div class="info-card">
        <div class="info-card-title">📅 Prochaines étapes</div>
        <div style="font-size:14px;color:#4a5568;line-height:1.7;">
          <p style="margin:0 0 8px;">• Les fonds seront versés sur votre compte bancaire dans les 48 heures ouvrées</p>
          <p style="margin:0 0 8px;">• Vous recevrez un email de confirmation du virement</p>
          <p style="margin:0;">• Votre première mensualité sera prélevée le mois suivant</p>
        </div>
      </div>` : `
      <div class="alert-box">
        <strong>📞 Que faire maintenant ?</strong>
        <p>Notre équipe reste à votre disposition pour vous accompagner : <strong>${BRAND.email}</strong></p>
      </div>`}
    `;

    const html = buildEmail({
      headerIcon: isVerified ? "✅" : "📋",
      headerTitle: isVerified ? "Contrat validé" : "Information contrat",
      headerSubtitle: isVerified
        ? "Votre contrat a été accepté"
        : "Une action de votre part peut être requise",
      body,
      ctaLabel: "Accéder à mon espace",
      ctaUrl: `${frontendUrl}/profile`,
      footerNote: "Cet email a été envoyé concernant votre contrat de financement.",
    });

    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [clientEmail],
      subject: isVerified
        ? `Contrat validé ✅ — ${loanTypeLabel}`
        : `Information concernant votre contrat — ${loanTypeLabel}`,
      html,
    });

    const err = (emailResponse as any).error;
    if (err) throw new Error(err.message || "Failed to send contract notification");

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-contract-notification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
