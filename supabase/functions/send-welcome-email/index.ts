import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", email);

    // Validate inputs
    if (!email || !firstName) {
      throw new Error("Email and firstName are required");
    }

    const emailResponse = await resend.emails.send({
      from: "Privat Equity <noreply@privat-equity.com>",
      to: [email],
      subject: "Bienvenue chez Privat Equity ! 🎉",
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
              .header h1 { margin: 0; font-size: 28px; }
              .header p { margin: 10px 0 0; opacity: 0.9; }
              .content { background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; }
              .welcome-box { background: linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%); padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2d5a87; }
              .feature { display: flex; align-items: flex-start; margin: 15px 0; }
              .feature-icon { background: #2d5a87; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0; font-size: 14px; }
              .feature-text { flex: 1; }
              .feature-text strong { color: #1e3a5f; }
              .button { display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #2d5a87 0%, #1e3a5f 100%); color: white; text-decoration: none; border-radius: 6px; margin-top: 25px; font-weight: 600; }
              .button:hover { opacity: 0.9; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; padding: 20px; }
              .divider { height: 1px; background: #eee; margin: 25px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Bienvenue chez Privat Equity</h1>
                <p>Votre partenaire de confiance pour vos projets de financement</p>
              </div>
              <div class="content">
                <p>Bonjour <strong>${escapeHtml(firstName)} ${escapeHtml(lastName)}</strong>,</p>
                
                <p>Nous sommes ravis de vous accueillir sur Privat Equity ! Votre compte a été créé avec succès.</p>
                
                <div class="welcome-box">
                  <h3 style="margin: 0 0 15px; color: #1e3a5f;">Ce que vous pouvez faire maintenant :</h3>
                  
                  <div class="feature">
                    <div class="feature-icon">💰</div>
                    <div class="feature-text">
                      <strong>Demander un crédit</strong><br>
                      Prêt personnel, auto, travaux ou rachat de crédits
                    </div>
                  </div>
                  
                  <div class="feature">
                    <div class="feature-icon">🏢</div>
                    <div class="feature-text">
                      <strong>Financer votre projet</strong><br>
                      Solutions sur mesure pour entrepreneurs et entreprises
                    </div>
                  </div>
                  
                  <div class="feature">
                    <div class="feature-icon">📊</div>
                    <div class="feature-text">
                      <strong>Simuler votre prêt</strong><br>
                      Calculez vos mensualités en quelques clics
                    </div>
                  </div>
                  
                  <div class="feature">
                    <div class="feature-icon">📋</div>
                    <div class="feature-text">
                      <strong>Suivre vos demandes</strong><br>
                      Accédez à l'historique de toutes vos demandes
                    </div>
                  </div>
                </div>

                <center>
                  <a href="https://privat-equity.com" class="button">
                    Accéder à mon espace
                  </a>
                </center>

                <div class="divider"></div>

                <p>Si vous avez des questions, notre équipe est à votre disposition pour vous accompagner dans vos projets.</p>
                
                <p>À très bientôt,<br><strong>L'équipe Privat Equity</strong></p>
              </div>
              <div class="footer">
                <p>© 2024 Privat Equity - Tous droits réservés</p>
                <p>5588 Rue Frontenac, Montréal, QC H2H 2L9, Canada</p>
                <p style="margin-top: 15px; color: #999;">Cet email a été envoyé automatiquement suite à la création de votre compte.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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
