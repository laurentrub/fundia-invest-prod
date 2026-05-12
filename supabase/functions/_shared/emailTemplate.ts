// ─────────────────────────────────────────────
//  Fundia Invest – Shared Email Template
//  Charte graphique unifiée pour tous les emails
// ─────────────────────────────────────────────

export const BRAND = {
  name: "Fundia Invest",
  primaryColor: "#1B4F8C",       // bleu principal
  secondaryColor: "#2B7FD4",     // bleu clair
  accentColor: "#F59E0B",        // doré accent
  darkBg: "#0F2D52",             // footer
  address: "5588 Rue Frontenac, Montréal, QC H2H 2L9, Canada",
  email: "contact@fundia-invest.com",
  website: "https://www.fundia-invest.com",
};

// Status badge colors
export const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending:     { bg: "#FEF3C7", color: "#92400E", label: "En attente" },
  in_progress: { bg: "#DBEAFE", color: "#1E40AF", label: "En cours d'analyse" },
  approved:    { bg: "#D1FAE5", color: "#065F46", label: "Approuvée" },
  refused:     { bg: "#FEE2E2", color: "#991B1B", label: "Refusée" },
};

// Loan type labels
export const LOAN_TYPE_LABELS: Record<string, string> = {
  personal:     "Prêt personnel",
  auto:         "Crédit auto",
  home:         "Crédit travaux",
  home_improvement: "Crédit travaux",
  consolidation: "Rachat de crédits",
  business:     "Prêt entreprise",
  project:      "Financement de projet",
};

// HTML escape
export const escapeHtml = (str: string): string => {
  const map: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  };
  return str.replace(/[&<>"']/g, (c) => map[c]);
};

// Format currency
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);

// ─────────────────────────────────────────────
//  Base CSS — inlined in every email
// ─────────────────────────────────────────────
const BASE_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #1a202c;
    background-color: #EFF4FB;
    padding: 24px 16px;
  }
  .email-wrapper {
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(27, 79, 140, 0.12);
  }
  /* ── Header ── */
  .header {
    background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%);
    color: white;
    padding: 44px 40px 36px;
    text-align: center;
  }
  .header-logo {
    display: inline-block;
    background: rgba(255,255,255,0.15);
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 12px;
    padding: 10px 20px;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.5px;
    margin-bottom: 20px;
    color: white;
    text-decoration: none;
  }
  .header-icon {
    font-size: 48px;
    margin-bottom: 12px;
    display: block;
  }
  .header h1 {
    font-size: 26px;
    font-weight: 700;
    margin: 0 0 8px;
    letter-spacing: -0.3px;
  }
  .header p {
    font-size: 15px;
    opacity: 0.9;
    margin: 0;
  }
  /* ── Content ── */
  .content {
    padding: 40px;
    background: #ffffff;
  }
  .greeting {
    font-size: 17px;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 14px;
  }
  .message {
    font-size: 15px;
    color: #4a5568;
    margin-bottom: 24px;
    line-height: 1.8;
  }
  /* ── Info card ── */
  .info-card {
    background: #F8FAFD;
    border: 1px solid #E2ECF8;
    border-left: 4px solid ${BRAND.primaryColor};
    padding: 24px;
    border-radius: 10px;
    margin: 28px 0;
  }
  .info-card-title {
    font-size: 12px;
    font-weight: 700;
    color: ${BRAND.primaryColor};
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 16px;
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #E2ECF8;
  }
  .info-row:last-child { border-bottom: none; }
  .info-label { font-size: 13px; color: #718096; }
  .info-value { font-size: 13px; color: #1a202c; font-weight: 600; text-align: right; }
  /* ── Status badge ── */
  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  /* ── Reference box ── */
  .reference-box {
    background: linear-gradient(135deg, #EFF4FB 0%, #DBEAFE 100%);
    border: 1px solid #BFDBFE;
    padding: 20px;
    border-radius: 10px;
    margin: 24px 0;
    text-align: center;
  }
  .reference-label {
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }
  .reference-code {
    font-size: 22px;
    font-weight: 800;
    color: ${BRAND.primaryColor};
    font-family: 'Courier New', monospace;
    letter-spacing: 3px;
  }
  /* ── CTA button ── */
  .cta-section { text-align: center; margin: 36px 0; }
  .cta-button {
    display: inline-block;
    padding: 14px 36px;
    background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.secondaryColor} 100%);
    color: white !important;
    text-decoration: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    box-shadow: 0 4px 14px rgba(27, 79, 140, 0.35);
  }
  /* ── Alert box ── */
  .alert-box {
    background: #FFFBEB;
    border: 1px solid #FDE68A;
    border-left: 4px solid ${BRAND.accentColor};
    border-radius: 10px;
    padding: 18px 20px;
    margin: 24px 0;
  }
  .alert-box strong { color: #92400E; display: block; margin-bottom: 6px; font-size: 14px; }
  .alert-box p { color: #78350F; font-size: 13px; margin: 0; }
  /* ── Timeline ── */
  .timeline { margin: 28px 0; }
  .timeline-item { display: flex; align-items: flex-start; margin: 16px 0; }
  .timeline-dot {
    width: 30px; height: 30px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700;
    flex-shrink: 0; margin-right: 14px;
  }
  .timeline-dot.done {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    box-shadow: 0 3px 10px rgba(16,185,129,0.4);
  }
  .timeline-dot.todo { background: #e2e8f0; color: #94a3b8; }
  .timeline-content strong { font-size: 14px; color: #1a202c; display: block; margin-bottom: 3px; }
  .timeline-content span { font-size: 13px; color: #64748b; }
  /* ── Divider ── */
  .divider { height: 1px; background: #E2ECF8; margin: 28px 0; }
  /* ── Signature ── */
  .signature {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 2px solid #E2ECF8;
    font-size: 14px;
    color: #4a5568;
  }
  .signature strong { color: #1a202c; display: block; margin-top: 6px; font-size: 15px; }
  /* ── Footer ── */
  .footer {
    background: ${BRAND.darkBg};
    color: #94a3b8;
    padding: 28px 40px;
    text-align: center;
  }
  .footer-brand {
    font-size: 17px;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 10px;
    display: block;
    letter-spacing: 0.3px;
  }
  .footer-content { font-size: 12px; line-height: 1.9; }
  .footer-links { margin-top: 16px; padding-top: 16px; border-top: 1px solid #1e3a5f; }
  .footer-link { color: #94a3b8; text-decoration: none; margin: 0 10px; font-size: 12px; }
  /* ── Responsive ── */
  @media only screen and (max-width: 600px) {
    body { padding: 0; }
    .email-wrapper { border-radius: 0; }
    .header { padding: 28px 20px; }
    .header h1 { font-size: 22px; }
    .content { padding: 24px 20px; }
    .info-row { flex-direction: column; align-items: flex-start; }
    .info-value { text-align: left; margin-top: 2px; }
    .footer { padding: 24px 20px; }
  }
`;

// ─────────────────────────────────────────────
//  buildEmail — fonction principale
//  Génère un email HTML complet
// ─────────────────────────────────────────────
export interface EmailOptions {
  headerIcon?: string;       // emoji ou vide
  headerTitle: string;
  headerSubtitle?: string;
  body: string;              // HTML du contenu principal (entre greeting et signature)
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}

export function buildEmail(opts: EmailOptions): string {
  const {
    headerIcon = "",
    headerTitle,
    headerSubtitle = "",
    body,
    ctaLabel,
    ctaUrl,
    footerNote = "Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.",
  } = opts;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(headerTitle)}</title>
  <style>${BASE_CSS}</style>
</head>
<body>
  <div class="email-wrapper">

    <!-- Header -->
    <div class="header">
      <a class="header-logo" href="${BRAND.website}">${BRAND.name}</a>
      ${headerIcon ? `<span class="header-icon">${headerIcon}</span>` : ""}
      <h1>${escapeHtml(headerTitle)}</h1>
      ${headerSubtitle ? `<p>${escapeHtml(headerSubtitle)}</p>` : ""}
    </div>

    <!-- Content -->
    <div class="content">
      ${body}

      ${ctaLabel && ctaUrl ? `
      <div class="cta-section">
        <a href="${ctaUrl}" class="cta-button">${ctaLabel}</a>
      </div>` : ""}

      <div class="signature">
        Cordialement,
        <strong>L'équipe ${BRAND.name}</strong>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <span class="footer-brand">${BRAND.name}</span>
      <div class="footer-content">
        <div>${BRAND.address}</div>
        <div style="margin-top:8px;">✉️ ${BRAND.email}</div>
        <div class="footer-links">
          <a href="${BRAND.website}" class="footer-link">Site web</a>
          <a href="${BRAND.website}/terms" class="footer-link">CGU</a>
          <a href="${BRAND.website}/privacy" class="footer-link">Confidentialité</a>
        </div>
        <div style="margin-top:16px; opacity:0.6;">${footerNote}</div>
        <div style="margin-top:16px; padding-top:16px; border-top:1px solid #1e3a5f; font-size:11px; color:#64748b; font-style:italic;">
          Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.
        </div>
      </div>
    </div>

  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────
//  Helper : info-card
// ─────────────────────────────────────────────
export function infoCard(title: string, rows: { label: string; value: string }[]): string {
  const rowsHtml = rows
    .map((r) => `
      <div class="info-row">
        <span class="info-label">${escapeHtml(r.label)}</span>
        <span class="info-value">${r.value}</span>
      </div>`)
    .join("");
  return `
    <div class="info-card">
      <div class="info-card-title">${escapeHtml(title)}</div>
      ${rowsHtml}
    </div>`;
}

// ─────────────────────────────────────────────
//  Helper : status badge
// ─────────────────────────────────────────────
export function statusBadge(status: string): string {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES["pending"];
  return `<span class="status-badge" style="background:${s.bg};color:${s.color};">${s.label}</span>`;
}

// ─────────────────────────────────────────────
//  Helper : reference box
// ─────────────────────────────────────────────
export function referenceBox(ref: string): string {
  return `
    <div class="reference-box">
      <div class="reference-label">Référence de votre dossier</div>
      <div class="reference-code">${escapeHtml(ref)}</div>
    </div>`;
}
