import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated and has admin/manager role
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User authentication failed:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check admin or manager role using service role client
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

    const payload: DocumentRequestPayload = await req.json();
    const { requestId, clientEmail, clientName, documents, customMessage } = payload;

    console.log("Sending document request email to:", clientEmail);
    console.log("Documents requested:", documents);

    // Get the loan request to get user_id
    const { data: loanRequest, error: loanError } = await supabaseAdmin
      .from("loan_requests")
      .select("user_id")
      .eq("id", requestId)
      .single();

    if (loanError || !loanRequest) {
      console.error("Loan request not found:", loanError);
      return new Response(JSON.stringify({ error: "Loan request not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create document request records in the database
    const documentRequestRecords = documents.map((doc: string) => ({
      loan_request_id: requestId,
      user_id: loanRequest.user_id,
      document_type: doc,
      status: "pending",
      requested_by: user.id,
      custom_message: customMessage || null,
    }));

    const { error: insertError } = await supabaseAdmin
      .from("document_requests")
      .insert(documentRequestRecords);

    if (insertError) {
      console.error("Error creating document requests:", insertError);
      // Continue with email even if DB insert fails
    }

    // Build document list HTML with escaped content
    const documentListHtml = documents
      .map((doc: string) => `<li style="margin-bottom: 8px;">${escapeHtml(doc)}</li>`)
      .join("");

    const customMessageHtml = customMessage
      ? `<p style="margin: 20px 0; color: #333;">${escapeHtml(customMessage)}</p>`
      : "";

    const emailResponse = await resend.emails.send({
      from: "Privat Equity <noreply@privat-equity.com>",
      to: [clientEmail],
      subject: "Demande de justificatifs - Privat Equity",
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
            <h2 style="color: #1e3a5f; margin-top: 0;">Demande de justificatifs</h2>
            
            <p>Bonjour ${escapeHtml(clientName)},</p>
            
            <p>Dans le cadre de l'étude de votre demande de financement (référence: ${requestId.slice(0, 8)}), nous avons besoin des documents suivants :</p>
            
            <ul style="background: #f8f9fa; padding: 20px 20px 20px 40px; border-radius: 8px; border-left: 4px solid #1e3a5f;">
              ${documentListHtml}
            </ul>
            
            ${customMessageHtml}
            
            <p>Merci de nous transmettre ces documents dans les meilleurs délais afin que nous puissions poursuivre l'étude de votre dossier.</p>
            
            <p>Vous pouvez répondre directement à cet email ou vous connecter à votre espace client pour télécharger vos documents.</p>
            
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
    });

    console.log("Email sent successfully:", emailResponse);

    // Log this action in status history
    await supabaseAdmin.from("request_status_history").insert({
      loan_request_id: requestId,
      changed_by: user.id,
      old_status: null,
      new_status: "document_requested",
      comment: `Demande de justificatifs envoyée: ${documents.join(", ")}`,
    });

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
