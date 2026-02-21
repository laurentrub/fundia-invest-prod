import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const fromName = process.env.RESEND_FROM_NAME || "Fundia Invest";

export default async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { to, firstName } = req.body || {};

    if (!to || typeof to !== "string") {
      return res.status(400).json({ error: "`to` is required (string)" });
    }

    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: "Test Fundia Invest",
      html: `<p>Bienvenue ${firstName ? String(firstName) : ""}</p><p>Email test Resend – Fundia Invest</p>`,
    });

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json({ data: result.data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};
