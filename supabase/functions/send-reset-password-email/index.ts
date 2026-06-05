import { Resend } from "https://esm.sh/resend@4.0.0";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { BRAND } from "../_shared/emailTemplate.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
const fromName = Deno.env.get("RESEND_FROM_NAME") || BRAND.name;
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

const isRecoveryEmailData = (value: unknown): value is RecoveryEmailData => {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  const user = data.user as Record<string, unknown> | undefined;
  const emailData = data.email_data as Record<string, unknown> | undefined;

  return Boolean(
    user &&
    emailData &&
    typeof user.email === "string" &&
    typeof emailData.token_hash === "string" &&
    typeof emailData.redirect_to === "string",
  );
};

const handler = async (req: Request): Promise<Response> => {
  console.log("🔐 Reset password email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    
    console.log("📧 Processing reset password request");

    if (!hookSecret) {
      console.error("❌ SEND_EMAIL_HOOK_SECRET not configured");
      throw new Error("Webhook secret not configured");
    }

    const wh = new Webhook(hookSecret);
    let emailData: RecoveryEmailData;

    try {
      const verifiedPayload = await wh.verify(payload, headers);
      if (!isRecoveryEmailData(verifiedPayload)) {
        throw new Error("Invalid recovery payload shape");
      }
      emailData = verifiedPayload;
      console.log("✅ Webhook verified successfully");
    } catch (error) {
      console.error("❌ Webhook verification failed:", error);
      throw new Error("Invalid webhook signature");
    }

    const { user, email_data } = emailData;
    const { token_hash, redirect_to } = email_data;
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL not configured");
    }
    
    const resetUrl = `${supabaseUrl}/auth/v1/verify?token=${encodeURIComponent(token_hash)}&type=recovery&redirect_to=${encodeURIComponent(redirect_to)}`;
    
    console.log(`Sending reset email to: ${user.email}`);

    const { buildEmail, escapeHtml } = await import("../_shared/emailTemplate.ts");

    const body = `
      <p class="greeting">Bonjour,</p>

      <p class="message">
        Vous avez demandé la réinitialisation de votre mot de passe.
        Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
      </p>

      <div class="alert-box">
        <strong>⚠️ Informations importantes</strong>
        <p>Ce lien est valide pendant <strong>1 heure</strong> et ne peut être utilisé qu'<strong>une seule fois</strong>.<br>
        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      </div>

      <p style="font-size:13px;color:#718096;margin-top:24px;">
        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
        <span style="color:#1B4F8C;word-break:break-all;font-size:12px;">${resetUrl}</span>
      </p>
    `;

    const html = buildEmail({
      headerIcon: "🔐",
      headerTitle: "Réinitialisation du mot de passe",
      headerSubtitle: "Créez un nouveau mot de passe sécurisé",
      body,
      ctaLabel: "Réinitialiser mon mot de passe",
      ctaUrl: resetUrl,
      footerNote: "Pour votre sécurité, ne partagez jamais ce lien. Fundia Invest ne vous demandera jamais votre mot de passe par email.",
    });

    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [user.email],
      subject: "Réinitialisation de votre mot de passe - Fundia Invest",
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error in send-reset-password-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: message,
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

Deno.serve(handler);
