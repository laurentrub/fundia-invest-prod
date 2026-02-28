import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
const fromName = Deno.env.get("RESEND_FROM_NAME") || "Fundia Invest";

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
  console.log("send-document-request function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
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

    // Verify JWT claims
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.error("JWT verification failed:", claimsError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userId = claimsData.claims.sub as string;

    // Check admin or manager role using service role client
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

    const payload: DocumentRequestPayload = await req.json();
    const { requestId, clientEmail, clientName, documents, customMessage } = payload;

    console.log("=== Document Request Debug Info ===");
    console.log("Request ID:", requestId);
    console.log("Client Email:", clientEmail);
    console.log("Client Name:", clientName);
    console.log("Documents requested:", documents);
    console.log("Custom Message:", customMessage);
    console.log("User ID (admin):", userId);
    console.log("Has SUPABASE_SERVICE_ROLE_KEY:", !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

    // Get the loan request to get user_id
    const { data: loanRequest, error: loanError } = await supabaseAdmin
      .from("loan_requests")
      .select("user_id")
      .eq("id", requestId)
      .single();

    if (loanError || !loanRequest) {
      console.error("Loan request not found:", loanError);
      console.error("Full error details:", JSON.stringify(loanError));
      console.error("Request ID searched:", requestId);
      return new Response(JSON.stringify({ error: "Loan request not found", details: loanError }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Loan request found, user_id:", loanRequest.user_id);

    // Create document request records in the database
    const documentRequestRecords = documents.map((doc: string) => ({
      loan_request_id: requestId,
      user_id: loanRequest.user_id,
      document_type: doc,
      status: "pending",
      requested_by: userId,
      custom_message: customMessage || null,
    }));

    console.log("Creating document request records:", documentRequestRecords.length, "records");

    const { error: insertError } = await supabaseAdmin
      .from("document_requests")
      .insert(documentRequestRecords);

    if (insertError) {
      console.error("Error creating document requests:", insertError);
      console.error("Insert error details:", JSON.stringify(insertError));
      // Continue with email even if DB insert fails
    } else {
      console.log("Document requests created successfully");
    }

    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [clientEmail],
      subject: "Documents requis pour votre dossier 📄",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Demande de justificatifs</title>
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
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
                padding: 16px 20px;
                border-radius: 12px;
                margin: 24px 0;
                border-left: 4px solid #3b82f6;
              }
              .reference-label {
                font-size: 12px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
              }
              .reference-code {
                font-size: 18px;
                font-weight: 700;
                color: #1e40af;
                font-family: 'Courier New', monospace;
                letter-spacing: 1px;
              }
              .documents-card {
                background: linear-gradient(to right, #fef3c7 0%, #fde68a 100%);
                padding: 24px;
                border-radius: 12px;
                margin: 32px 0;
                border-left: 4px solid #f59e0b;
              }
              .documents-card h3 {
                font-size: 16px;
                font-weight: 700;
                color: #92400e;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
              }
              .documents-card ul {
                list-style: none;
                padding: 0;
                margin: 0;
              }
              .documents-card li {
                background: #fffbeb;
                padding: 12px 16px;
                margin-bottom: 8px;
                border-radius: 8px;
                color: #78350f;
                font-weight: 500;
                display: flex;
                align-items: center;
              }
              .documents-card li:last-child {
                margin-bottom: 0;
              }
              .documents-card li:before {
                content: "📄";
                margin-right: 12px;
                font-size: 18px;
              }
              .custom-message {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 12px;
                padding: 20px;
                margin: 24px 0;
                color: #0c4a6e;
              }
              .custom-message strong {
                display: block;
                margin-bottom: 8px;
                font-size: 15px;
              }
              .info-box {
                background: #f7fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 20px;
                margin: 32px 0;
              }
              .info-box p {
                color: #4a5568;
                font-size: 14px;
                margin: 8px 0;
              }
              .info-box strong {
                color: #2d3748;
              }
              .cta-section {
                text-align: center;
                margin: 32px 0;
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
                .documents-card, .info-box { padding: 20px; }
                .footer { padding: 24px 20px; }
              }
            </style>
          </head>
          <body>
            <div class="email-wrapper">
              <!-- Header -->
              <div class="header">
                <span class="header-icon">📄</span>
                <h1>Fundia Invest</h1>
                <p>Demande de justificatifs</p>
              </div>

              <!-- Content -->
              <div class="content">
                <div class="greeting">
                  Bonjour ${escapeHtml(clientName)},
                </div>

                <div class="message">
                  Nous progressons dans l'étude de votre demande de financement ! Pour finaliser l'analyse de votre dossier, nous aurions besoin de quelques documents complémentaires.
                </div>

                <!-- Reference Box -->
                <div class="reference-box">
                  <div class="reference-label">Référence de votre dossier</div>
                  <div class="reference-code">${escapeHtml(requestId.substring(0, 8).toUpperCase())}</div>
                </div>

                <!-- Documents Card -->
                <div class="documents-card">
                  <h3>📋 Documents requis</h3>
                  <ul>
                    ${documents.map((doc: string) => `<li>${escapeHtml(doc)}</li>`).join('')}
                  </ul>
                </div>

                ${customMessage ? `
                <div class="custom-message">
                  <strong>💬 Message de notre équipe</strong>
                  <p>${escapeHtml(customMessage)}</p>
                </div>
                ` : ''}

                <div class="info-box">
                  <p><strong>📤 Comment nous transmettre vos documents ?</strong></p>
                  <p>Vous pouvez :</p>
                  <ul style="margin: 12px 0 0 20px; color: #4a5568;">
                    <li>Répondre directement à cet email en joignant vos documents</li>
                    <li>Vous connecter à votre espace client pour les télécharger</li>
                  </ul>
                </div>

                <div class="message">
                  Ces documents nous permettront de finaliser l'analyse de votre dossier et de vous proposer la meilleure solution de financement adaptée à votre situation.
                </div>

                <!-- CTA Section -->
                <div class="cta-section">
                  <a href="${Deno.env.get("VITE_SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || '#'}/profile" class="cta-button">
                    📊 Accéder à mon espace
                  </a>
                </div>

                <!-- Signature -->
                <div class="signature">
                  Nous restons à votre disposition pour toute question.<br>
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
                    Cet email a été envoyé automatiquement concernant votre demande de financement.
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully");
    console.log("Email response:", JSON.stringify(emailResponse));

    // Log this action in status history
    console.log("Inserting status history...");
    const { error: historyError } = await supabaseAdmin.from("request_status_history").insert({
      loan_request_id: requestId,
      changed_by: userId,
      old_status: null,
      new_status: "document_requested",
      comment: `Demande de justificatifs envoyée: ${documents.join(", ")}`,
    });

    if (historyError) {
      console.error("Error inserting status history:", historyError);
      console.error("History error details:", JSON.stringify(historyError));
    } else {
      console.log("Status history inserted successfully");
    }

    console.log("Document request function completed successfully");
    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-document-request function:", error);
    console.error("Error stack:", error.stack);
    const errorMessage = error.message || "Une erreur s'est produite lors de l'envoi de la demande";
    return new Response(JSON.stringify({ error: errorMessage, details: error.stack }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
