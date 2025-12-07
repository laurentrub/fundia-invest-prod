import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContractNotificationPayload {
  contractId: string;
  clientEmail: string;
  clientName: string;
  action: "verified" | "rejected";
  rejectionReason?: string;
  loanType: string;
  amount: number;
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
  console.log("send-contract-notification function called");

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
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User authentication failed:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "manager"])
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("User does not have admin/manager role:", roleError);
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const payload: ContractNotificationPayload = await req.json();
    const { contractId, clientEmail, clientName, action, rejectionReason, loanType, amount } = payload;

    console.log(`Sending contract ${action} notification to:`, clientEmail);

    const loanTypeLabels: Record<string, string> = {
      personal: "Prêt personnel",
      auto: "Crédit auto",
      home_improvement: "Crédit travaux",
      business: "Crédit professionnel",
      consolidation: "Rachat de crédit",
      project: "Financement de projet",
    };

    const loanTypeLabel = loanTypeLabels[loanType] || loanType;

    let subject: string;
    let contentHtml: string;

    if (action === "verified") {
      subject = "Votre contrat a été validé - Privat Equity";
      contentHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Privat Equity</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="display: inline-block; background: #10b981; border-radius: 50%; padding: 15px;">
                <span style="color: white; font-size: 32px;">✓</span>
              </div>
            </div>
            
            <h2 style="color: #10b981; margin-top: 0; text-align: center;">Contrat validé !</h2>
            
            <p>Bonjour ${escapeHtml(clientName)},</p>
            
            <p>Nous avons le plaisir de vous informer que votre contrat de prêt a été <strong>validé</strong> par nos services.</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
              <p style="margin: 0;"><strong>Type de prêt :</strong> ${loanTypeLabel}</p>
              <p style="margin: 10px 0 0 0;"><strong>Montant :</strong> ${amount.toLocaleString("fr-FR")} €</p>
            </div>
            
            <h3 style="color: #1e3a5f;">Prochaines étapes</h3>
            <ul style="padding-left: 20px;">
              <li>Les fonds seront versés sur votre compte bancaire dans les 48 heures ouvrées</li>
              <li>Vous recevrez un email de confirmation du virement</li>
              <li>Votre première mensualité sera prélevée le mois suivant</li>
            </ul>
            
            <p>Nous vous remercions de votre confiance.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #666;">Cordialement,</p>
              <p style="margin: 5px 0 0 0; font-weight: bold; color: #1e3a5f;">L'équipe Privat Equity</p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2024 Privat Equity. Tous droits réservés.</p>
            <p style="margin: 5px 0 0 0;">5588 Rue Frontenac, Montréal, QC H2H 2L9, Canada</p>
          </div>
        </body>
        </html>
      `;
    } else {
      subject = "Information concernant votre contrat - Privat Equity";
      contentHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Privat Equity</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1e3a5f; margin-top: 0;">Information importante concernant votre contrat</h2>
            
            <p>Bonjour ${escapeHtml(clientName)},</p>
            
            <p>Après examen de votre contrat signé, nous ne sommes malheureusement pas en mesure de valider votre dossier en l'état.</p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
              <p style="margin: 0;"><strong>Type de prêt :</strong> ${loanTypeLabel}</p>
              <p style="margin: 10px 0 0 0;"><strong>Montant :</strong> ${amount.toLocaleString("fr-FR")} €</p>
              ${rejectionReason ? `<p style="margin: 10px 0 0 0;"><strong>Motif :</strong> ${escapeHtml(rejectionReason)}</p>` : ""}
            </div>
            
            <h3 style="color: #1e3a5f;">Que faire maintenant ?</h3>
            <p>Vous pouvez nous contacter pour discuter de votre situation et des éventuelles solutions possibles :</p>
            <ul style="padding-left: 20px;">
              <li>Par email en répondant à ce message</li>
              <li>Via votre espace client sur notre site</li>
            </ul>
            
            <p>Notre équipe reste à votre disposition pour vous accompagner.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #666;">Cordialement,</p>
              <p style="margin: 5px 0 0 0; font-weight: bold; color: #1e3a5f;">L'équipe Privat Equity</p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2024 Privat Equity. Tous droits réservés.</p>
            <p style="margin: 5px 0 0 0;">5588 Rue Frontenac, Montréal, QC H2H 2L9, Canada</p>
          </div>
        </body>
        </html>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Privat Equity <noreply@privat-equity.com>",
      to: [clientEmail],
      subject,
      html: contentHtml,
    });

    console.log("Contract notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contract-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
