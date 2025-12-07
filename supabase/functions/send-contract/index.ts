import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { decode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const payload: ContractPayload = await req.json();
    const { requestId, clientEmail, clientName, pdfBase64 } = payload;

    console.log("Sending contract to:", clientEmail);

    const pdfBuffer = decode(pdfBase64);

    const emailResponse = await resend.emails.send({
      from: "Privat Equity <noreply@privat-equity.com>",
      to: [clientEmail],
      subject: "Votre contrat de prêt - Privat Equity",
      html: `
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
            <h2 style="color: #1e3a5f; margin-top: 0;">Votre contrat de prêt</h2>
            
            <p>Bonjour ${escapeHtml(clientName)},</p>
            
            <p>Nous avons le plaisir de vous transmettre votre contrat de prêt en pièce jointe.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #1e3a5f; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">Prochaines étapes :</p>
              <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Lisez attentivement le contrat ci-joint</li>
                <li>Signez le document à l'emplacement prévu</li>
                <li>Retournez-nous le contrat signé par email ou via votre espace client</li>
              </ol>
            </div>
            
            <p>Si vous avez des questions concernant votre contrat, n'hésitez pas à nous contacter.</p>
            
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
      `,
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
      changed_by: user.id,
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
