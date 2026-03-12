import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { buildEmail, escapeHtml, referenceBox, BRAND } from "../_shared/emailTemplate.ts";

const resend    = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
const fromName  = Deno.env.get("RESEND_FROM_NAME")  || BRAND.name;
const frontendUrl = (Deno.env.get("FRONTEND_URL") || BRAND.website).replace(/\/+$/, "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DocumentRequestPayload {
  requestId: string;
  clientEmail: string;
  clientName: string;
  documents: string[];
  customMessage?: string;
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

    const userId = userData.user.id;
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", userId)
      .in("role", ["admin", "manager"]).maybeSingle();
    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { requestId, clientEmail, clientName, documents, customMessage }: DocumentRequestPayload = await req.json();

    // Get loan request user_id
    const { data: loanRequest, error: loanError } = await supabaseAdmin
      .from("loan_requests").select("user_id").eq("id", requestId).single();
    if (loanError || !loanRequest) {
      return new Response(JSON.stringify({ error: "Loan request not found" }), {
        status: 404, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create document_requests records
    const records = documents.map((doc: string) => ({
      loan_request_id: requestId,
      user_id: loanRequest.user_id,
      document_type: doc,
      status: "pending",
      requested_by: userId,
      custom_message: customMessage || null,
    }));

    const { error: insertError } = await supabaseAdmin.from("document_requests").insert(records);
    if (insertError) console.error("Error creating document requests:", insertError);

    const docsListHtml = documents
      .map((doc: string) => `
        <div style="background:#F0F7FF;border:1px solid #BFDBFE;border-radius:8px;padding:12px 16px;margin-bottom:8px;display:flex;align-items:center;color:#1B4F8C;font-weight:500;font-size:14px;">
          <span style="margin-right:10px;font-size:16px;">📄</span>
          ${escapeHtml(doc)}
        </div>`)
      .join("");

    const body = `
      <p class="greeting">Bonjour ${escapeHtml(clientName)},</p>

      <p class="message">
        Nous progressons dans l'étude de votre demande de financement !
        Pour finaliser l'analyse de votre dossier, nous aurions besoin de quelques documents complémentaires.
      </p>

      ${referenceBox(requestId.substring(0, 8).toUpperCase())}

      <div class="info-card" style="border-left-color:#F59E0B;">
        <div class="info-card-title" style="color:#92400E;">📋 Documents requis (${documents.length})</div>
        ${docsListHtml}
      </div>

      ${customMessage ? `
      <div class="alert-box">
        <strong>💬 Message de notre équipe</strong>
        <p>${escapeHtml(customMessage)}</p>
      </div>` : ""}

      <div class="info-card">
        <div class="info-card-title">📤 Comment nous transmettre vos documents</div>
        <div style="font-size:14px;color:#4a5568;line-height:1.7;">
          Connectez-vous à votre espace personnel et téléversez vos justificatifs de manière sécurisée.
          Ces documents nous permettront de finaliser l'analyse de votre dossier.
        </div>
      </div>
    `;

    const html = buildEmail({
      headerIcon: "📄",
      headerTitle: "Documents requis",
      headerSubtitle: "Pour finaliser l'analyse de votre dossier",
      body,
      ctaLabel: "Envoyer mes documents",
      ctaUrl: `${frontendUrl}/profile?section=requested-docs`,
      footerNote: "Cet email a été envoyé concernant votre demande de financement.",
    });

    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [clientEmail],
      subject: "Documents requis pour votre dossier 📄",
      html,
    });

    const err = (emailResponse as any).error;
    if (err) throw new Error(err.message || "Failed to send document request email");

    // Log in status history
    await supabaseAdmin.from("request_status_history").insert({
      loan_request_id: requestId,
      changed_by: userId,
      old_status: null,
      new_status: "document_requested",
      comment: `Demande de justificatifs envoyée : ${documents.join(", ")}`,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-document-request error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
