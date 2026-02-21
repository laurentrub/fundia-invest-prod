import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://fundia-invest.com";
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
const fromName = Deno.env.get("RESEND_FROM_NAME") || "Fundia Invest";
const adminNotificationEmails = (Deno.env.get("APPLICATION_NOTIFICATION_EMAILS") || "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicationConfirmationRequest {
  loanRequestId: string;
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

const loanTypeLabels: Record<string, string> = {
  personal: "Prêt personnel",
  auto: "Crédit auto",
  home: "Crédit travaux",
  consolidation: "Rachat de crédits",
  business: "Prêt entreprise",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
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
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { loanRequestId }: ApplicationConfirmationRequest = await req.json();

    console.log("Sending application confirmation for loan request:", loanRequestId);

    if (!loanRequestId) {
      throw new Error("loanRequestId is required");
    }

    // Allow only request owner or admin/manager to trigger email for a request
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "manager"])
      .maybeSingle();
    const isAdminOrManager = !!roleData;

    // Fetch the loan request details
    const { data: loanRequest, error: loanError } = await supabaseAdmin
      .from("loan_requests")
      .select("*")
      .eq("id", loanRequestId)
      .single();

    if (loanError || !loanRequest) {
      console.error("Error fetching loan request:", loanError);
      throw new Error("Demande introuvable");
    }

    if (!isAdminOrManager && loanRequest.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const loanTypeLabel = loanTypeLabels[loanRequest.loan_type] || loanRequest.loan_type;
    const formattedAmount = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(loanRequest.amount);
    const formattedDate = new Date(loanRequest.created_at).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [loanRequest.email],
      subject: "Votre demande de crédit a bien été reçue ✓",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { margin: 0; font-size: 26px; }
              .header .checkmark { font-size: 50px; margin-bottom: 15px; }
              .content { background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; }
              .summary-box { background: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0; }
              .summary-box h3 { margin: 0 0 20px; color: #1e3a5f; border-bottom: 2px solid #2d5a87; padding-bottom: 10px; }
              .summary-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
              .summary-row:last-child { border-bottom: none; }
              .summary-label { color: #666; }
              .summary-value { font-weight: 600; color: #1e3a5f; }
              .status-badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
              .timeline { margin: 30px 0; }
              .timeline-item { display: flex; margin: 15px 0; }
              .timeline-dot { width: 24px; height: 24px; background: #2d5a87; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; margin-right: 15px; flex-shrink: 0; }
              .timeline-dot.pending { background: #e2e8f0; color: #64748b; }
              .timeline-content { flex: 1; }
              .timeline-content strong { color: #1e3a5f; }
              .button { display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #2d5a87 0%, #1e3a5f 100%); color: white; text-decoration: none; border-radius: 6px; margin-top: 25px; font-weight: 600; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; padding: 20px; }
              .divider { height: 1px; background: #eee; margin: 25px 0; }
              .reference { background: #e0f2fe; color: #0369a1; padding: 8px 15px; border-radius: 5px; font-family: monospace; display: inline-block; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="checkmark">✓</div>
                <h1>Demande reçue avec succès</h1>
              </div>
              <div class="content">
                <p>Bonjour <strong>${escapeHtml(loanRequest.first_name)} ${escapeHtml(loanRequest.last_name)}</strong>,</p>
                
                <p>Nous avons bien reçu votre demande de crédit et nous vous remercions de votre confiance.</p>
                
                <p>Votre référence de dossier :<br>
                <span class="reference">${escapeHtml(loanRequest.id.substring(0, 8).toUpperCase())}</span></p>
                
                <div class="summary-box">
                  <h3>📋 Récapitulatif de votre demande</h3>
                  
                  <div class="summary-row">
                    <span class="summary-label">Type de crédit</span>
                    <span class="summary-value">${escapeHtml(loanTypeLabel)}</span>
                  </div>
                  
                  <div class="summary-row">
                    <span class="summary-label">Montant demandé</span>
                    <span class="summary-value">${formattedAmount}</span>
                  </div>
                  
                  <div class="summary-row">
                    <span class="summary-label">Durée souhaitée</span>
                    <span class="summary-value">${loanRequest.duration} mois</span>
                  </div>
                  
                  <div class="summary-row">
                    <span class="summary-label">Date de demande</span>
                    <span class="summary-value">${formattedDate}</span>
                  </div>
                  
                  <div class="summary-row">
                    <span class="summary-label">Statut</span>
                    <span class="summary-value"><span class="status-badge">En attente d'examen</span></span>
                  </div>
                </div>

                <h3 style="color: #1e3a5f;">📅 Prochaines étapes</h3>
                
                <div class="timeline">
                  <div class="timeline-item">
                    <div class="timeline-dot">✓</div>
                    <div class="timeline-content">
                      <strong>Demande reçue</strong><br>
                      <span style="color: #666;">Votre dossier est enregistré</span>
                    </div>
                  </div>
                  
                  <div class="timeline-item">
                    <div class="timeline-dot pending">2</div>
                    <div class="timeline-content">
                      <strong>Étude du dossier</strong><br>
                      <span style="color: #666;">Analyse par notre équipe (24-48h)</span>
                    </div>
                  </div>
                  
                  <div class="timeline-item">
                    <div class="timeline-dot pending">3</div>
                    <div class="timeline-content">
                      <strong>Réponse personnalisée</strong><br>
                      <span style="color: #666;">Vous recevrez notre décision par email</span>
                    </div>
                  </div>
                </div>

                <center>
                  <a href="${frontendUrl}/profile" class="button">
                    Suivre ma demande
                  </a>
                </center>

                <div class="divider"></div>

                <p style="color: #666; font-size: 14px;">
                  <strong>Besoin d'aide ?</strong><br>
                  Notre équipe est disponible pour répondre à vos questions. N'hésitez pas à nous contacter.
                </p>
                
                <p>Cordialement,<br><strong>L'équipe Privat Equity</strong></p>
              </div>
              <div class="footer">
                <p>© 2024 Privat Equity - Tous droits réservés</p>
                <p>5588 Rue Frontenac, Montréal, QC H2H 2L9, Canada</p>
                <p style="margin-top: 15px; color: #999;">Cet email a été envoyé automatiquement suite à votre demande de crédit.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    const emailResponseError = (emailResponse as { error?: { message?: string } }).error;
    if (emailResponseError) {
      throw new Error(emailResponseError.message || "Failed to send applicant confirmation email");
    }

    if (adminNotificationEmails.length > 0) {
      const adminEmailHtml = `
        <p>Nouvelle demande de credit recue:</p>
        <ul>
          <li>Reference: ${escapeHtml(loanRequest.id.substring(0, 8).toUpperCase())}</li>
          <li>Client: ${escapeHtml(loanRequest.first_name)} ${escapeHtml(loanRequest.last_name)}</li>
          <li>Email: ${escapeHtml(loanRequest.email)}</li>
          <li>Type: ${escapeHtml(loanTypeLabel)}</li>
          <li>Montant: ${formattedAmount}</li>
          <li>Duree: ${loanRequest.duration} mois</li>
        </ul>
        <p><a href="${frontendUrl}/admin/requests/${loanRequest.id}">Voir la demande dans l'admin</a></p>
      `;

      const adminEmailResponse = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: adminNotificationEmails,
        subject: `Nouvelle demande de credit - ${loanRequest.first_name} ${loanRequest.last_name}`,
        html: adminEmailHtml,
      });

      const adminEmailResponseError = (adminEmailResponse as { error?: { message?: string } }).error;
      if (adminEmailResponseError) {
        console.error("Admin notification email failed:", adminEmailResponseError.message);
      }
    }

    console.log("Application confirmation email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-application-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
