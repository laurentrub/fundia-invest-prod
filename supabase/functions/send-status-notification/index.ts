import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  loanRequestId: string;
  newStatus: string;
}

const statusMessages = {
  pending: {
    subject: "Demande de crédit reçue",
    title: "Votre demande est en cours d'examen",
    message: "Nous avons bien reçu votre demande de crédit. Notre équipe l'examine actuellement et vous contactera très prochainement.",
  },
  approved: {
    subject: "Demande de crédit approuvée ✅",
    title: "Félicitations ! Votre demande est approuvée",
    message: "Nous sommes heureux de vous informer que votre demande de crédit a été approuvée. Un conseiller vous contactera sous peu pour finaliser le dossier.",
  },
  rejected: {
    subject: "Mise à jour de votre demande de crédit",
    title: "Réponse concernant votre demande",
    message: "Après étude de votre dossier, nous ne sommes malheureusement pas en mesure de donner une suite favorable à votre demande pour le moment. N'hésitez pas à nous recontacter.",
  },
  in_progress: {
    subject: "Votre dossier est en cours de traitement",
    title: "Traitement en cours",
    message: "Votre demande de crédit est actuellement en cours de traitement par nos services. Nous vous tiendrons informé de son avancement.",
  },
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { loanRequestId, newStatus }: NotificationRequest = await req.json();

    console.log("Sending notification for loan request:", loanRequestId, "with status:", newStatus);

    // Récupérer les détails de la demande
    const { data: loanRequest, error: loanError } = await supabase
      .from("loan_requests")
      .select("*")
      .eq("id", loanRequestId)
      .single();

    if (loanError || !loanRequest) {
      console.error("Error fetching loan request:", loanError);
      throw new Error("Demande introuvable");
    }

    const statusInfo = statusMessages[newStatus as keyof typeof statusMessages] || statusMessages.pending;

    // Envoyer l'email
    const emailResponse = await resend.emails.send({
      from: "FinanceExpert <onboarding@resend.dev>",
      to: [loanRequest.email],
      subject: statusInfo.subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              .info-box { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${statusInfo.title}</h1>
              </div>
              <div class="content">
                <p>Bonjour ${loanRequest.first_name} ${loanRequest.last_name},</p>
                <p>${statusInfo.message}</p>
                
                <div class="info-box">
                  <strong>Détails de votre demande :</strong><br>
                  Type de crédit : ${loanRequest.loan_type}<br>
                  Montant : ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(loanRequest.amount)}<br>
                  Durée : ${loanRequest.duration} mois<br>
                  Statut : <strong>${newStatus}</strong>
                </div>

                <p>Vous pouvez consulter l'état de votre demande à tout moment sur votre tableau de bord.</p>
                
                <center>
                  <a href="${Deno.env.get("VITE_SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || '#'}/dashboard" class="button">
                    Voir mon tableau de bord
                  </a>
                </center>

                <p>Cordialement,<br>L'équipe FinanceExpert</p>
              </div>
              <div class="footer">
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
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
