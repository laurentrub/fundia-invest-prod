import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
const fromName = Deno.env.get("RESEND_FROM_NAME") || "Fundia Invest";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DocumentValidationRequest {
  documentRequestId: string;
  status: 'validated' | 'rejected';
  rejectionReason?: string;
}

const escapeHtml = (text: string): string => {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-document-validation function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify JWT claims
    const token = authHeader.replace("Bearer ", "");
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !userData?.user) {
      console.error("JWT verification failed:", userError);
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userId = userData.user.id;

    // Check if user has admin or manager role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "manager"]);

    if (roleError || !roleData || roleData.length === 0) {
      console.error("Role check failed:", roleError);
      return new Response(JSON.stringify({ error: "Accès refusé" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { documentRequestId, status, rejectionReason }: DocumentValidationRequest = await req.json();
    console.log("Processing document validation:", { documentRequestId, status });

    // Get document request details with user info
    const { data: docRequest, error: docError } = await supabaseAdmin
      .from("document_requests")
      .select(`
        *,
        profile:profiles!document_requests_user_id_fkey(first_name, last_name, email),
        loan_request:loan_requests(loan_type, amount)
      `)
      .eq("id", documentRequestId)
      .single();

    if (docError || !docRequest) {
      console.error("Document request not found:", docError);
      return new Response(JSON.stringify({ error: "Demande de document non trouvée" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const clientEmail = docRequest.profile?.email;
    const clientName = `${docRequest.profile?.first_name || ''} ${docRequest.profile?.last_name || ''}`.trim() || 'Client';

    if (!clientEmail) {
      console.error("Client email not found");
      return new Response(JSON.stringify({ error: "Email du client non trouvé" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const isValidated = status === 'validated';
    const statusLabel = isValidated ? 'validé' : 'refusé';
    const statusColor = isValidated ? '#22c55e' : '#ef4444';
    const statusBgColor = isValidated ? '#dcfce7' : '#fee2e2';

    const loanTypeLabels: Record<string, string> = {
      personal: 'Prêt personnel',
      auto: 'Crédit auto',
      home_improvement: 'Crédit travaux',
      business: 'Prêt entreprise',
      consolidation: 'Rachat de crédit',
      project: 'Financement de projet',
    };

    const loanTypeLabel = docRequest.loan_request 
      ? loanTypeLabels[docRequest.loan_request.loan_type] || docRequest.loan_request.loan_type
      : 'Demande de crédit';

    let rejectionSection = '';
    if (!isValidated && rejectionReason) {
      rejectionSection = `
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-top: 16px;">
          <p style="color: #991b1b; font-weight: 600; margin: 0 0 8px 0;">Raison du refus :</p>
          <p style="color: #7f1d1d; margin: 0;">${escapeHtml(rejectionReason)}</p>
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">
          Veuillez soumettre à nouveau le document en tenant compte des remarques ci-dessus. 
          Vous pouvez le faire depuis votre espace personnel.
        </p>
      `;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <div style="background: linear-gradient(135deg, #0d3b66 0%, #1a5f8a 100%); padding: 32px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                  Document ${statusLabel}
                </h1>
              </div>
              
              <div style="padding: 32px;">
                <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
                  Bonjour ${escapeHtml(clientName)},
                </p>
                
                <p style="color: #6b7280; margin: 0 0 24px 0;">
                  Le document que vous avez soumis a été examiné par notre équipe.
                </p>
                
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <div style="margin-bottom: 12px;">
                    <span style="color: #6b7280; font-size: 14px;">Document :</span>
                    <p style="margin: 4px 0 0 0; font-weight: 600; color: #111827;">${escapeHtml(docRequest.document_type)}</p>
                  </div>
                  <div style="margin-bottom: 12px;">
                    <span style="color: #6b7280; font-size: 14px;">Demande associée :</span>
                    <p style="margin: 4px 0 0 0; color: #111827;">${escapeHtml(loanTypeLabel)}${docRequest.loan_request ? ` - ${docRequest.loan_request.amount.toLocaleString('fr-FR')} €` : ''}</p>
                  </div>
                  <div>
                    <span style="color: #6b7280; font-size: 14px;">Statut :</span>
                    <p style="margin: 4px 0 0 0;">
                      <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 600; background-color: ${statusBgColor}; color: ${statusColor};">
                        ${isValidated ? '✓ Validé' : '✗ Refusé'}
                      </span>
                    </p>
                  </div>
                </div>
                
                ${rejectionSection}
                
                ${isValidated ? `
                  <p style="color: #059669; margin: 16px 0;">
                    Votre document a été accepté. Nous poursuivons le traitement de votre demande.
                  </p>
                ` : ''}
                
                <div style="text-align: center; margin-top: 32px;">
                  <a href="https://www.fundia-invest.com/profile"
                     style="display: inline-block; background-color: #0d3b66; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Accéder à mon espace
                  </a>
                </div>
              </div>

              <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                  © 2024 Fundia Invest. Tous droits réservés.
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                  5588 Rue Frontenac, Montréal, QC H2H 2L9, Canada
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log("Sending email to:", clientEmail);

    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [clientEmail],
      subject: `Document ${statusLabel} - ${docRequest.document_type}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-document-validation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
