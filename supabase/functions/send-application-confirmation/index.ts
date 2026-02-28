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
      subject: "Confirmation de réception de votre demande ✓",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Confirmation de réception</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1a202c;
                background-color: #f7fafc;
                padding: 20px;
              }
              .email-wrapper {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 48px 40px;
                text-align: center;
              }
              .header-icon {
                font-size: 56px;
                margin-bottom: 16px;
                display: block;
              }
              .header h1 {
                font-size: 28px;
                font-weight: 700;
                margin: 0 0 8px 0;
                letter-spacing: -0.5px;
              }
              .header p {
                font-size: 16px;
                opacity: 0.95;
                margin: 0;
              }
              .content {
                padding: 40px;
                background: #ffffff;
              }
              .greeting {
                font-size: 18px;
                font-weight: 600;
                color: #2d3748;
                margin-bottom: 16px;
              }
              .message {
                font-size: 16px;
                color: #4a5568;
                margin-bottom: 24px;
                line-height: 1.7;
              }
              .reference-box {
                background: linear-gradient(to right, #eff6ff 0%, #dbeafe 100%);
                padding: 20px;
                border-radius: 12px;
                margin: 24px 0;
                border-left: 4px solid #3b82f6;
                text-align: center;
              }
              .reference-label {
                font-size: 13px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
              }
              .reference-code {
                font-size: 24px;
                font-weight: 700;
                color: #1e40af;
                font-family: 'Courier New', monospace;
                letter-spacing: 2px;
              }
              .info-card {
                background: linear-gradient(to right, #f7fafc 0%, #edf2f7 100%);
                padding: 24px;
                border-radius: 12px;
                margin: 32px 0;
                border-left: 4px solid #667eea;
              }
              .info-card h3 {
                font-size: 14px;
                font-weight: 700;
                color: #2d3748;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 16px;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid #e2e8f0;
              }
              .info-row:last-child {
                border-bottom: none;
              }
              .info-label {
                font-size: 14px;
                color: #718096;
                font-weight: 500;
              }
              .info-value {
                font-size: 14px;
                color: #2d3748;
                font-weight: 600;
                text-align: right;
              }
              .status-badge {
                display: inline-block;
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                background: #fef3c7;
                color: #92400e;
              }
              .timeline {
                margin: 32px 0;
              }
              .timeline-item {
                display: flex;
                margin: 20px 0;
                align-items: flex-start;
              }
              .timeline-dot {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: 600;
                flex-shrink: 0;
                margin-right: 16px;
              }
              .timeline-dot.active {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
              }
              .timeline-dot.pending {
                background: #e2e8f0;
                color: #94a3b8;
              }
              .timeline-content {
                flex: 1;
                padding-top: 4px;
              }
              .timeline-content strong {
                font-size: 15px;
                color: #2d3748;
                display: block;
                margin-bottom: 4px;
              }
              .timeline-content span {
                font-size: 14px;
                color: #64748b;
              }
              .cta-section {
                text-align: center;
                margin: 40px 0;
              }
              .cta-button {
                display: inline-block;
                padding: 16px 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white !important;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
                transition: transform 0.2s, box-shadow 0.2s;
              }
              .help-box {
                background: #fef9f3;
                border: 1px solid #fed7aa;
                border-radius: 12px;
                padding: 20px;
                margin: 32px 0;
              }
              .help-box strong {
                color: #92400e;
                display: block;
                margin-bottom: 8px;
                font-size: 15px;
              }
              .help-box p {
                color: #78350f;
                font-size: 14px;
                margin: 0;
              }
              .signature {
                margin-top: 40px;
                padding-top: 32px;
                border-top: 2px solid #e2e8f0;
                font-size: 15px;
                color: #4a5568;
              }
              .signature strong {
                color: #2d3748;
                display: block;
                margin-top: 8px;
              }
              .footer {
                background: #2d3748;
                color: #a0aec0;
                padding: 32px 40px;
                text-align: center;
              }
              .footer-content {
                font-size: 13px;
                line-height: 1.8;
              }
              .footer-brand {
                font-size: 18px;
                font-weight: 700;
                color: #ffffff;
                margin-bottom: 12px;
                display: block;
              }
              .footer-address {
                margin: 16px 0 8px 0;
              }
              .footer-links {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #4a5568;
              }
              .footer-link {
                color: #a0aec0;
                text-decoration: none;
                margin: 0 12px;
                font-size: 13px;
              }
              @media only screen and (max-width: 600px) {
                body { padding: 0; }
                .email-wrapper { border-radius: 0; }
                .header { padding: 32px 24px; }
                .header h1 { font-size: 24px; }
                .content { padding: 24px; }
                .info-card { padding: 20px; }
                .info-row { flex-direction: column; }
                .info-value { text-align: left; margin-top: 4px; }
                .footer { padding: 24px 20px; }
                .timeline-item { margin: 16px 0; }
              }
            </style>
          </head>
          <body>
            <div class="email-wrapper">
              <!-- Header -->
              <div class="header">
                <span class="header-icon">✓</span>
                <h1>Demande enregistrée</h1>
                <p>Nous avons bien reçu votre dossier</p>
              </div>

              <!-- Content -->
              <div class="content">
                <div class="greeting">
                  Bonjour ${escapeHtml(loanRequest.first_name)} ${escapeHtml(loanRequest.last_name)},
                </div>

                <div class="message">
                  Merci d'avoir choisi Fundia Invest pour votre projet de financement. Nous avons bien reçu votre demande et nous vous confirmons son enregistrement.
                </div>

                <!-- Reference Box -->
                <div class="reference-box">
                  <div class="reference-label">Référence de votre dossier</div>
                  <div class="reference-code">${escapeHtml(loanRequest.id.substring(0, 8).toUpperCase())}</div>
                </div>

                <!-- Info Card -->
                <div class="info-card">
                  <h3>📋 Récapitulatif de votre demande</h3>
                  <div class="info-row">
                    <span class="info-label">Type de crédit</span>
                    <span class="info-value">${escapeHtml(loanTypeLabel)}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Montant demandé</span>
                    <span class="info-value">${formattedAmount}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Durée souhaitée</span>
                    <span class="info-value">${loanRequest.duration} mois</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Date de dépôt</span>
                    <span class="info-value">${formattedDate}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Statut actuel</span>
                    <span class="info-value">
                      <span class="status-badge">Dossier reçu</span>
                    </span>
                  </div>
                </div>

                <h3 style="color: #2d3748; margin-bottom: 24px; font-size: 18px;">📅 Les prochaines étapes</h3>

                <div class="timeline">
                  <div class="timeline-item">
                    <div class="timeline-dot active">✓</div>
                    <div class="timeline-content">
                      <strong>Réception de votre demande</strong>
                      <span>Votre dossier a été enregistré dans notre système</span>
                    </div>
                  </div>

                  <div class="timeline-item">
                    <div class="timeline-dot pending">2</div>
                    <div class="timeline-content">
                      <strong>Analyse de votre dossier</strong>
                      <span>Notre équipe va examiner votre demande sous 24-48h</span>
                    </div>
                  </div>

                  <div class="timeline-item">
                    <div class="timeline-dot pending">3</div>
                    <div class="timeline-content">
                      <strong>Réponse et accompagnement</strong>
                      <span>Vous serez informé par email de notre décision</span>
                    </div>
                  </div>
                </div>

                <!-- CTA Section -->
                <div class="cta-section">
                  <a href="${frontendUrl}/profile" class="cta-button">
                    📊 Suivre ma demande
                  </a>
                </div>

                <!-- Help Box -->
                <div class="help-box">
                  <strong>💡 Besoin d'aide ?</strong>
                  <p>Notre équipe est à votre disposition pour répondre à toutes vos questions. N'hésitez pas à nous contacter à contact@fundia-invest.com</p>
                </div>

                <!-- Signature -->
                <div class="signature">
                  Cordialement,
                  <strong>L'équipe Fundia Invest</strong>
                </div>
              </div>

              <!-- Footer -->
              <div class="footer">
                <span class="footer-brand">Fundia Invest</span>
                <div class="footer-content">
                  <div class="footer-address">
                    5588 Rue Frontenac, Montréal, QC H2H 2L9, Canada
                  </div>
                  <div style="margin-top: 12px;">
                    📞 Support client : contact@fundia-invest.com
                  </div>
                  <div class="footer-links">
                    <a href="https://www.fundia-invest.com" class="footer-link">Site web</a>
                    <a href="https://www.fundia-invest.com/terms" class="footer-link">CGU</a>
                    <a href="https://www.fundia-invest.com/privacy" class="footer-link">Confidentialité</a>
                  </div>
                  <div style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                    Cet email a été envoyé automatiquement suite à votre demande de crédit.
                  </div>
                </div>
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
