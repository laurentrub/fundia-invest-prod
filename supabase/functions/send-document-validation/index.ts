import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { buildEmail, escapeHtml, infoCard, BRAND, LOAN_TYPE_LABELS, formatCurrency } from "../_shared/emailTemplate.ts";

const resend    = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
const fromName  = Deno.env.get("RESEND_FROM_NAME")  || BRAND.name;
const frontendUrl = (Deno.env.get("FRONTEND_URL") || BRAND.website).replace(/\/+$/, "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DocumentValidationRequest {
  documentRequestId: string;
  status: "validated" | "rejected";
  rejectionReason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", userData.user.id)
      .in("role", ["admin", "manager"]);
    if (roleError || !roleData || roleData.length === 0) {
      return new Response(JSON.stringify({ error: "Accès refusé" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { documentRequestId, status, rejectionReason }: DocumentValidationRequest = await req.json();

    const { data: docRequest, error: docError } = await supabaseAdmin
      .from("document_requests")
      .select(`*, profile:profiles!document_requests_user_id_fkey(first_name, last_name, email), loan_request:loan_requests(loan_type, amount)`)
      .eq("id", documentRequestId).single();

    if (docError || !docRequest) {
      return new Response(JSON.stringify({ error: "Demande de document non trouvée" }), {
        status: 404, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const clientEmail = docRequest.profile?.email;
    const clientName = `${docRequest.profile?.first_name || ""} ${docRequest.profile?.last_name || ""}`.trim() || "Client";

    if (!clientEmail) {
      return new Response(JSON.stringify({ error: "Email du client non trouvé" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const isValidated = status === "validated";
    const loanTypeLabel = docRequest.loan_request
      ? LOAN_TYPE_LABELS[docRequest.loan_request.loan_type] || docRequest.loan_request.loan_type
      : "Demande de crédit";

    const statusBadgeHtml = isValidated
      ? `<span style="background:#D1FAE5;color:#065F46;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">✓ Validé</span>`
      : `<span style="background:#FEE2E2;color:#991B1B;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">✗ Refusé</span>`;

    const body = `
      <p class="greeting">Bonjour ${escapeHtml(clientName)},</p>

      <p class="message">
        Le document que vous avez soumis a été examiné par notre équipe.
        ${isValidated
          ? "Votre document a été <strong>accepté</strong>. Nous poursuivons le traitement de votre demande."
          : "Votre document n'a malheureusement pas pu être accepté en l'état."}
      </p>

      ${infoCard("📋 Détails", [
        { label: "Document",         value: escapeHtml(docRequest.document_type) },
        { label: "Demande associée", value: `${escapeHtml(loanTypeLabel)}${docRequest.loan_request ? " — " + formatCurrency(docRequest.loan_request.amount) : ""}` },
        { label: "Statut",           value: statusBadgeHtml },
      ])}

      ${!isValidated && rejectionReason ? `
      <div class="alert-box">
        <strong>📝 Raison du refus</strong>
        <p>${escapeHtml(rejectionReason)}</p>
      </div>
      <p class="message" style="font-size:14px;">
        Veuillez soumettre à nouveau le document en tenant compte des remarques ci-dessus depuis votre espace personnel.
      </p>` : ""}
    `;

    const html = buildEmail({
      headerIcon: isValidated ? "✅" : "📋",
      headerTitle: isValidated ? "Document validé" : "Document refusé",
      headerSubtitle: isValidated
        ? "Votre document a été accepté"
        : "Une action de votre part est requise",
      body,
      ctaLabel: "Accéder à mon espace",
      ctaUrl: `${frontendUrl}/profile`,
      footerNote: "Cet email a été envoyé concernant votre demande de financement.",
    });

    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [clientEmail],
      subject: `Document ${isValidated ? "validé ✅" : "refusé"} — ${docRequest.document_type}`,
      html,
    });

    const err = (emailResponse as any).error;
    if (err) throw new Error(err.message || "Failed to send document validation email");

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-document-validation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
