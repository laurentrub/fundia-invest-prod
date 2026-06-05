import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { decode } from "https://deno.land/std@0.190.0/encoding/base64.ts";
import { buildEmail, escapeHtml, infoCard, BRAND } from "../_shared/emailTemplate.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
const fromName = Deno.env.get("RESEND_FROM_NAME") || BRAND.name;
const frontendUrl = (Deno.env.get("FRONTEND_URL") || BRAND.website).replace(/\/+$/, "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContractPayload {
  requestId: string;
  clientEmail: string;
  clientName: string;
  pdfBase64: string;
}

// HTML escape function to prevent injection attacks
const escapeHtml = (str: string): string => {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, char => htmlEscapes[char]);
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-contract function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error("JWT verification failed:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userId = userData.user.id;

    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "manager"])
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("User does not have admin/manager role:", roleError);
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const payload: ContractPayload = await req.json();
    const { requestId, clientEmail, clientName, pdfBase64 } = payload;

    console.log("Sending contract to:", clientEmail);

    const pdfBuffer = decode(pdfBase64);

    const body = `
      <p class="greeting">Bonjour ${escapeHtml(clientName)},</p>

      <p class="message">
        Nous avons le plaisir de vous transmettre votre contrat de prêt en pièce jointe.
        Veuillez le lire attentivement avant de le signer et de nous le retourner.
      </p>

      <div class="info-card">
        <div class="info-card-title">📅 Prochaines étapes</div>
        <div style="font-size:14px;color:#4a5568;line-height:1.8;">
          <p style="margin:0 0 8px;">1. Lisez attentivement le contrat ci-joint</p>
          <p style="margin:0 0 8px;">2. Signez le document à l'emplacement prévu</p>
          <p style="margin:0;">3. Retournez-nous le contrat signé via votre espace personnel</p>
        </div>
      </div>

      <div class="alert-box">
        <strong>💬 Des questions ?</strong>
        <p>Notre équipe est disponible : <strong>${BRAND.email}</strong></p>
      </div>
    `;

    const html = buildEmail({
      headerIcon: "📄",
      headerTitle: "Votre contrat de prêt",
      headerSubtitle: "Veuillez signer et nous retourner ce document",
      body,
      ctaLabel: "Accéder à mon espace",
      ctaUrl: `${frontendUrl}/profile`,
      footerNote: "Cet email a été envoyé concernant votre demande de financement.",
    });

    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [clientEmail],
      subject: `Votre contrat de prêt — ${BRAND.name}`,
      html,
      attachments: [
        {
          filename: `contrat-pret-${requestId.slice(0, 8)}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    console.log("Contract email sent successfully:", emailResponse);

    await supabaseAdmin.from("request_status_history").insert({
      loan_request_id: requestId,
      changed_by: userId,
      old_status: null,
      new_status: "contract_sent",
      comment: "Contrat envoyé au client pour signature",
    });

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contract function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
