// Edge Function to send custom emails - Updated to use environment secrets
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

interface CustomEmailRequest {
  loanRequestId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // Verify admin/manager role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "manager"])
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin or manager access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { recipientEmail, recipientName, subject, body }: CustomEmailRequest = await req.json();

    if (!recipientEmail || !subject || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Convert newlines to <br> for HTML display
    const htmlBody = escapeHtml(body).replace(/\n/g, '<br>');
    const safeName = escapeHtml(recipientName);
    const safeSubject = escapeHtml(subject);

    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [recipientEmail],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>${safeSubject}</title>
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
                margin: 0;
                letter-spacing: -0.5px;
              }
              .content {
                padding: 40px;
                background: #ffffff;
              }
              .greeting {
                font-size: 18px;
                font-weight: 600;
                color: #2d3748;
                margin-bottom: 24px;
              }
              .message {
                font-size: 16px;
                color: #4a5568;
                line-height: 1.8;
                margin-bottom: 32px;
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
                .footer { padding: 24px 20px; }
              }
            </style>
          </head>
          <body>
            <div class="email-wrapper">
              <!-- Header -->
              <div class="header">
                <h1>Fundia Invest</h1>
              </div>

              <!-- Content -->
              <div class="content">
                <div class="greeting">
                  Bonjour ${safeName},
                </div>

                <div class="message">
                  ${htmlBody}
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

    console.log("Custom email sent to:", recipientEmail, "Response:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending custom email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
