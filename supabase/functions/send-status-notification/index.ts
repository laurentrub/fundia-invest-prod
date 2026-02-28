// Edge Function to send status notification emails - Updated to use environment secrets
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
const fromName = Deno.env.get("RESEND_FROM_NAME") || "Fundia Invest";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationRequest {
  loanRequestId: string;
  newStatus: string;
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

const statusMessages = {
  pending: {
    subject: "Votre dossier est en attente d'examen",
    title: "Dossier en attente",
    message: "Votre demande de crédit est actuellement en attente d'examen. Notre équipe va prochainement étudier votre dossier et vous contactera très rapidement.",
  },
  approved: {
    subject: "Demande de crédit approuvée ✅",
    title: "Félicitations ! Votre demande est approuvée",
    message: "Nous sommes heureux de vous informer que votre demande de crédit a été approuvée. Un conseiller vous contactera sous peu pour finaliser le dossier et mettre en place votre financement.",
  },
  rejected: {
    subject: "Mise à jour de votre demande de crédit",
    title: "Réponse concernant votre demande",
    message: "Après étude approfondie de votre dossier, nous ne sommes malheureusement pas en mesure de donner une suite favorable à votre demande pour le moment. N'hésitez pas à nous recontacter ultérieurement si votre situation évolue.",
  },
  in_progress: {
    subject: "Votre dossier est en cours d'analyse 🔍",
    title: "Analyse en cours",
    message: "Bonne nouvelle ! Notre équipe a commencé l'analyse détaillée de votre demande de crédit. Nous étudions actuellement tous les éléments de votre dossier pour vous proposer la meilleure solution de financement. Vous recevrez une réponse définitive très prochainement.",
  },
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create client with service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Extract and verify the JWT token from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing authentication token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Create a client with the user's token to verify their identity
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // Verify the JWT claims
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.error("Failed to verify JWT claims:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid authentication token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // Verify the user has admin or manager role using the service role client
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "manager"])
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("User is not an admin or manager:", userId);
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin or manager access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Admin/manager user verified:", userId);

    const { loanRequestId, newStatus }: NotificationRequest = await req.json();

    console.log("Sending notification for loan request:", loanRequestId, "with status:", newStatus);
    console.log("Supabase URL:", Deno.env.get("SUPABASE_URL"));
    console.log("Has service role key:", !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

    // Récupérer les détails de la demande
    const { data: loanRequest, error: loanError } = await supabaseAdmin
      .from("loan_requests")
      .select("*")
      .eq("id", loanRequestId)
      .single();

    if (loanError || !loanRequest) {
      console.error("Error fetching loan request:", loanError);
      console.error("Full error details:", JSON.stringify(loanError));
      console.error("Loan request ID searched:", loanRequestId);
      console.error("Data returned:", loanRequest);
      throw new Error("Demande introuvable");
    }

    const statusInfo = statusMessages[newStatus as keyof typeof statusMessages] || statusMessages.pending;

    // Envoyer l'email
    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [loanRequest.email],
      subject: statusInfo.subject,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>${statusInfo.subject}</title>
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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 48px 40px;
                text-align: center;
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
                margin-bottom: 32px;
                line-height: 1.7;
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
              }
              .status-approved {
                background: #c6f6d5;
                color: #22543d;
              }
              .status-rejected {
                background: #fed7d7;
                color: #742a2a;
              }
              .status-pending {
                background: #feebc8;
                color: #7c2d12;
              }
              .status-in_progress {
                background: #bee3f8;
                color: #2c5282;
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
              }
            </style>
          </head>
          <body>
            <div class="email-wrapper">
              <!-- Header -->
              <div class="header">
                <h1>Fundia Invest</h1>
                <p>${statusInfo.title}</p>
              </div>

              <!-- Content -->
              <div class="content">
                <div class="greeting">
                  Bonjour ${escapeHtml(loanRequest.first_name)} ${escapeHtml(loanRequest.last_name)},
                </div>

                <div class="message">
                  ${statusInfo.message}
                </div>

                <!-- Info Card -->
                <div class="info-card">
                  <h3>📋 Détails de votre demande</h3>
                  <div class="info-row">
                    <span class="info-label">Type de crédit</span>
                    <span class="info-value">${escapeHtml(loanRequest.loan_type)}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Montant</span>
                    <span class="info-value">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(loanRequest.amount)}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Durée</span>
                    <span class="info-value">${loanRequest.duration} mois</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Statut actuel</span>
                    <span class="info-value">
                      <span class="status-badge status-${newStatus}">${newStatus}</span>
                    </span>
                  </div>
                </div>

                <!-- CTA Section -->
                <div class="cta-section">
                  <a href="${Deno.env.get("VITE_SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || '#'}/dashboard" class="cta-button">
                    📊 Voir mon tableau de bord
                  </a>
                </div>

                <div class="message" style="margin-top: 32px; font-size: 15px;">
                  Vous pouvez consulter l'état de votre demande à tout moment depuis votre espace personnel.
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
                    Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-status-notification function:", error);
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
