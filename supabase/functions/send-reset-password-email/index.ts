import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecoveryEmailData {
  user: {
    email: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("🔐 Reset password email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    console.log("📧 Processing reset password request");

    if (!hookSecret) {
      console.error("❌ SEND_EMAIL_HOOK_SECRET not configured");
      throw new Error("Webhook secret not configured");
    }

    const wh = new Webhook(hookSecret);
    let emailData: RecoveryEmailData;

    try {
      emailData = wh.verify(payload, headers) as RecoveryEmailData;
      console.log("✅ Webhook verified successfully");
    } catch (error) {
      console.error("❌ Webhook verification failed:", error);
      throw new Error("Invalid webhook signature");
    }

    const { user, email_data } = emailData;
    const { token_hash, redirect_to } = email_data;
    
    const resetUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${token_hash}&type=recovery&redirect_to=${redirect_to}`;
    
    console.log(`📨 Sending reset email to: ${user.email}`);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de votre mot de passe</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header avec gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                🔐 FinanceExpert
              </h1>
            </td>
          </tr>

          <!-- Corps du message -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                Réinitialisation de votre mot de passe
              </h2>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour,
              </p>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
              </p>

              <!-- Bouton CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: #ffffff; 
                              text-decoration: none; 
                              padding: 16px 40px; 
                              border-radius: 6px; 
                              font-size: 16px; 
                              font-weight: 600; 
                              display: inline-block;
                              box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                      Réinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 30px 0 20px 0;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              
              <p style="color: #667eea; font-size: 13px; word-break: break-all; background-color: #f7fafc; padding: 12px; border-radius: 4px; border-left: 3px solid #667eea;">
                ${resetUrl}
              </p>

              <!-- Informations de sécurité -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px; background-color: #fff5f5; border-radius: 6px; border: 1px solid #feb2b2;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #c53030; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
                      ⚠️ Informations importantes :
                    </p>
                    <ul style="color: #742a2a; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
                      <li>Ce lien est valide pendant <strong>1 heure</strong></li>
                      <li>Il ne peut être utilisé qu'<strong>une seule fois</strong></li>
                      <li>Si vous n'avez pas demandé cette réinitialisation, <strong>ignorez cet email</strong></li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #718096; font-size: 14px; margin: 0 0 10px 0;">
                Cet email a été envoyé par <strong>FinanceExpert</strong>
              </p>
              <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                Si vous avez des questions, n'hésitez pas à nous contacter.
              </p>
            </td>
          </tr>
        </table>

        <!-- Petit texte de sécurité en bas -->
        <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
          <tr>
            <td style="text-align: center; padding: 0 30px;">
              <p style="color: #a0aec0; font-size: 12px; line-height: 1.5; margin: 0;">
                Pour votre sécurité, ne partagez jamais ce lien avec qui que ce soit.<br>
                FinanceExpert ne vous demandera jamais votre mot de passe par email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: "FinanceExpert <noreply@privât-equity.com>",
      to: [user.email],
      subject: "Réinitialisation de votre mot de passe - FinanceExpert",
      html: html,
    });

    console.log("✅ Reset password email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in send-reset-password-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Failed to send reset password email"
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
