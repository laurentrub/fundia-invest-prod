import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Types ──────────────────────────────────────────────

export interface ContractData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  loan_type: string;
  amount: number;
  duration: number;
  created_at: string;
}

type ContractType = 'civil' | 'pro' | 'rachat';

interface ContractMeta {
  type: ContractType;
  addReconnaissanceDette: boolean;
  addGarantieRenforcee: boolean;
  addCautionDirigeant: boolean;
}

// ── Helpers ────────────────────────────────────────────

const MARGIN = 20;
const RATE = 0.035;

function monthlyPayment(amount: number, duration: number, rate = RATE) {
  const r = rate / 12;
  return (amount * r * Math.pow(1 + r, duration)) / (Math.pow(1 + r, duration) - 1);
}

function formatEur(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function today() {
  return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function checkPageBreak(doc: jsPDF, yPos: number, needed = 30): number {
  if (yPos + needed > doc.internal.pageSize.getHeight() - 25) {
    doc.addPage();
    return 20;
  }
  return yPos;
}

function writeArticle(doc: jsPDF, title: string, body: string, yPos: number): number {
  const pw = doc.internal.pageSize.getWidth();
  yPos = checkPageBreak(doc, yPos, 25);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 95);
  doc.text(title, MARGIN, yPos);
  yPos += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const lines = doc.splitTextToSize(body, pw - 2 * MARGIN);
  for (const line of lines) {
    yPos = checkPageBreak(doc, yPos, 6);
    doc.text(line, MARGIN, yPos);
    yPos += 4.5;
  }
  yPos += 4;
  return yPos;
}

// ── Shared sections ────────────────────────────────────

function writeHeader(doc: jsPDF, title: string, refId: string) {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pw, 48, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FUNDIA INVEST', pw / 2, 18, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.text(title, pw / 2, 30, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Référence : ${refId.slice(0, 8).toUpperCase()}`, pw / 2, 42, { align: 'center' });
}

function writeParties(doc: jsPDF, data: ContractData, yPos: number, preterLabel: string, emprunteurLabel: string): number {
  const pw = doc.internal.pageSize.getWidth();

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`Établi le ${today()}`, pw - MARGIN, yPos, { align: 'right' });
  yPos += 12;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 95);
  doc.text('ENTRE LES SOUSSIGNÉS', MARGIN, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  doc.text(`${preterLabel} :`, MARGIN, yPos);
  yPos += 5;
  doc.text('(Identité complète à renseigner)', MARGIN + 5, yPos);
  yPos += 10;

  doc.text(`${emprunteurLabel} :`, MARGIN, yPos);
  yPos += 5;
  doc.text(`${data.first_name} ${data.last_name}`, MARGIN + 5, yPos);
  yPos += 5;
  doc.text(`Email : ${data.email}`, MARGIN + 5, yPos);
  if (data.phone) {
    yPos += 5;
    doc.text(`Téléphone : ${data.phone}`, MARGIN + 5, yPos);
  }
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Il est convenu ce qui suit :', MARGIN, yPos);
  yPos += 10;

  return yPos;
}

function writeSummaryTable(doc: jsPDF, data: ContractData, loanTypeLabel: string, yPos: number): number {
  const mp = monthlyPayment(data.amount, data.duration);
  const total = mp * data.duration;
  const interest = total - data.amount;

  autoTable(doc, {
    startY: yPos,
    head: [['Désignation', 'Valeur']],
    body: [
      ['Type de prêt', loanTypeLabel],
      ['Montant emprunté', formatEur(data.amount)],
      ['Durée du prêt', `${data.duration} mois`],
      ['Taux annuel (TAEG)', '3,50 %'],
      ['Mensualité', formatEur(mp)],
      ['Total des intérêts', formatEur(interest)],
      ['Montant total dû', formatEur(total)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 95] },
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 10 },
  });

  return (doc as any).lastAutoTable.finalY + 12;
}

function writeSignatures(doc: jsPDF, data: ContractData, yPos: number, leftLabel: string, rightLabel: string): number {
  const pw = doc.internal.pageSize.getWidth();
  yPos = checkPageBreak(doc, yPos, 70);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 95);
  doc.text('SIGNATURES', MARGIN, yPos);
  yPos += 12;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  doc.rect(MARGIN, yPos, 75, 40);
  doc.text(leftLabel, MARGIN + 5, yPos + 8);
  doc.text('Date : _______________', MARGIN + 5, yPos + 32);

  doc.rect(pw - MARGIN - 75, yPos, 75, 40);
  doc.text(rightLabel, pw - MARGIN - 70, yPos + 8);
  doc.text(`${data.first_name} ${data.last_name}`, pw - MARGIN - 70, yPos + 16);
  doc.text('Date : _______________', pw - MARGIN - 70, yPos + 32);

  return yPos + 50;
}

function writeAmortizationTable(doc: jsPDF, data: ContractData, yPos: number): number {
  doc.addPage();
  yPos = 20;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 95);
  doc.text("ANNEXE – TABLEAU D'AMORTISSEMENT", MARGIN, yPos);
  yPos += 10;

  const r = RATE / 12;
  const mp = monthlyPayment(data.amount, data.duration);
  let remaining = data.amount;

  const rows: string[][] = [];
  for (let i = 1; i <= data.duration; i++) {
    const interestPart = remaining * r;
    const capitalPart = mp - interestPart;
    remaining = Math.max(remaining - capitalPart, 0);
    rows.push([
      String(i),
      formatEur(mp),
      formatEur(capitalPart),
      formatEur(interestPart),
      formatEur(remaining),
    ]);
  }

  autoTable(doc, {
    startY: yPos,
    head: [['Mois', 'Mensualité', 'Capital', 'Intérêts', 'Capital restant dû']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 95], fontSize: 8 },
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 7, cellPadding: 2 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

function writeFooter(doc: jsPDF) {
  const pw = doc.internal.pageSize.getWidth();
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const footerY = doc.internal.pageSize.getHeight() - 12;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Fundia Invest – 5588 Rue Frontenac, Montréal, QC H2H 2L9, Canada', pw / 2, footerY, { align: 'center' });
    doc.text(`www.fundia-invest.com – Page ${i}/${pages}`, pw / 2, footerY + 4, { align: 'center' });
  }
}

// ── Contract Type: Civil ───────────────────────────────

function generateCivilContract(doc: jsPDF, data: ContractData, loanTypeLabel: string, meta: ContractMeta): void {
  writeHeader(doc, 'CONTRAT DE CRÉDIT ENTRE PARTICULIERS', data.id);
  let y = 58;
  y = writeParties(doc, data, y, 'Le Prêteur', "L'Emprunteur");
  y = writeSummaryTable(doc, data, loanTypeLabel, y);

  // 10 articles
  y = writeArticle(doc, 'Article 1 – Nature juridique',
    "Le présent contrat constitue un prêt d'argent à titre civil régi par les articles 1892 et suivants du Code civil. Les parties déclarent agir à titre strictement personnel et non professionnel.", y);

  y = writeArticle(doc, 'Article 2 – Montant et remise des fonds',
    `Montant : ${formatEur(data.amount)}. Remise par virement bancaire nominatif. La preuve du virement vaut preuve irréfragable de la remise des fonds.`, y);

  y = writeArticle(doc, 'Article 3 – Durée',
    `Durée : ${data.duration} mois. La date d'exigibilité finale sera calculée à compter de la date de signature du présent contrat.`, y);

  y = writeArticle(doc, 'Article 4 – Modalités de remboursement',
    `Calendrier de remboursement annexé. Mensualité : ${formatEur(monthlyPayment(data.amount, data.duration))}. Tout paiement s'impute d'abord sur les intérêts puis sur le capital.`, y);

  y = writeArticle(doc, 'Article 5 – Intérêts',
    "Taux annuel fixe : 3,50 % (dans la limite du taux d'usure applicable).", y);

  y = writeArticle(doc, 'Article 6 – Déchéance du terme',
    "En cas de défaut de paiement supérieur à 30 jours après mise en demeure, la totalité du capital restant dû devient immédiatement exigible.", y);

  y = writeArticle(doc, 'Article 7 – Clause pénale',
    "En cas d'inexécution, une indemnité forfaitaire de 5 % du solde restant dû pourra être due, sous contrôle du juge.", y);

  y = writeArticle(doc, 'Article 8 – Garanties',
    "Reconnaissance de dette annexée. Le cas échéant : caution solidaire / nantissement détaillé en annexe.", y);

  y = writeArticle(doc, 'Article 9 – Indépendance des parties',
    "Les parties reconnaissent que la plateforme Fundia Invest n'est pas partie au présent contrat. Fundia Invest agit en qualité de facilitateur technologique et ne participe pas à la décision d'octroi du prêt.", y);

  y = writeArticle(doc, 'Article 10 – Droit applicable et juridiction',
    "Le présent contrat est soumis au droit français. Tout litige sera porté devant les tribunaux français compétents.", y);

  // Conditional annexes
  if (meta.addReconnaissanceDette) {
    y = checkPageBreak(doc, y, 40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text('ANNEXE – RECONNAISSANCE DE DETTE', MARGIN, y);
    y += 8;
    y = writeArticle(doc, '', 
      `Le soussigné, ${data.first_name} ${data.last_name}, reconnaît devoir la somme de ${formatEur(data.amount)} au Prêteur, remboursable selon les modalités définies au présent contrat. Cette reconnaissance de dette est établie conformément à l'article 1376 du Code civil.`, y);
  }

  if (meta.addGarantieRenforcee) {
    y = checkPageBreak(doc, y, 40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text('ANNEXE – GARANTIE RENFORCÉE', MARGIN, y);
    y += 8;
    y = writeArticle(doc, '',
      `Compte tenu du montant du prêt (${formatEur(data.amount)}), l'Emprunteur s'engage à fournir une garantie complémentaire sous forme de caution solidaire ou de nantissement d'actifs, dont les modalités seront précisées dans un avenant au présent contrat.`, y);
  }

  y = writeSignatures(doc, data, y, 'Le Prêteur', "L'Emprunteur");
  writeAmortizationTable(doc, data, y);
}

// ── Contract Type: Professional ────────────────────────

function generateProContract(doc: jsPDF, data: ContractData, loanTypeLabel: string, meta: ContractMeta): void {
  writeHeader(doc, 'CONTRAT DE FINANCEMENT PROFESSIONNEL', data.id);
  let y = 58;
  y = writeParties(doc, data, y, "L'Investisseur", 'Le Bénéficiaire professionnel');
  y = writeSummaryTable(doc, data, loanTypeLabel, y);

  y = writeArticle(doc, 'Article 1 – Objet',
    "Financement destiné exclusivement à l'activité professionnelle décrite en annexe.", y);

  y = writeArticle(doc, 'Article 2 – Déclaration professionnelle',
    "Le Bénéficiaire déclare agir dans le cadre de son activité professionnelle et fournir des informations exactes sur sa situation financière.", y);

  y = writeArticle(doc, 'Article 3 – Montant',
    `${formatEur(data.amount)} versés par virement bancaire.`, y);

  y = writeArticle(doc, 'Article 4 – Affectation des fonds',
    "Les fonds doivent être affectés au projet décrit en annexe. Toute modification substantielle de l'affectation doit être notifiée préalablement à l'Investisseur.", y);

  y = writeArticle(doc, 'Article 5 – Rémunération',
    "Taux annuel fixe : 3,50 %.", y);

  y = writeArticle(doc, 'Article 6 – Garanties',
    "Les garanties applicables sont détaillées en annexe, incluant le cas échéant une caution personnelle du dirigeant.", y);

  y = writeArticle(doc, "Article 7 – Clause d'autonomie",
    "L'Investisseur agit de manière indépendante et sans conseil personnalisé. La plateforme Fundia Invest ne fournit aucune recommandation d'investissement.", y);

  y = writeArticle(doc, 'Article 8 – Déchéance du terme',
    "Exigibilité immédiate de la totalité du capital restant dû en cas de défaut de paiement ou de manquement aux obligations contractuelles.", y);

  y = writeArticle(doc, 'Article 9 – Clause résolutoire',
    "En cas d'inexactitude avérée des déclarations financières du Bénéficiaire, le présent contrat sera résolu de plein droit.", y);

  y = writeArticle(doc, 'Article 10 – Droit applicable',
    "Le présent contrat est soumis au droit français. Tout litige sera porté devant les tribunaux compétents.", y);

  // Conditional: caution dirigeant
  if (meta.addCautionDirigeant) {
    y = checkPageBreak(doc, y, 40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text('ANNEXE – CAUTION DU DIRIGEANT', MARGIN, y);
    y += 8;
    y = writeArticle(doc, '',
      `Compte tenu du montant du financement (${formatEur(data.amount)}), le dirigeant de la société bénéficiaire se porte caution solidaire et indivisible du remboursement intégral du prêt, en principal, intérêts et accessoires.`, y);
  }

  y = writeSignatures(doc, data, y, "L'Investisseur", 'Le Bénéficiaire');
  writeAmortizationTable(doc, data, y);
}

// ── Contract Type: Rachat de crédit ────────────────────

function generateRachatContract(doc: jsPDF, data: ContractData, loanTypeLabel: string): void {
  writeHeader(doc, 'CONTRAT DE RACHAT DE CRÉDIT', data.id);
  let y = 58;
  y = writeParties(doc, data, y, 'Le Prêteur', 'Le Bénéficiaire');
  y = writeSummaryTable(doc, data, loanTypeLabel, y);

  y = writeArticle(doc, 'Article 1 – Objet',
    "Le présent contrat a pour objet le regroupement et le remboursement anticipé des crédits listés en annexe, par la mise en place d'un nouveau financement unique.", y);

  y = writeArticle(doc, 'Article 2 – Déclarations',
    "Le Bénéficiaire certifie l'exactitude des dettes déclarées et s'engage à fournir tout justificatif nécessaire. Toute inexactitude pourra entraîner la résolution du contrat.", y);

  y = writeArticle(doc, 'Article 3 – Nouveau financement',
    `Montant global du nouveau financement : ${formatEur(data.amount)}. Ce montant inclut le remboursement des crédits existants et les frais associés.`, y);

  y = writeArticle(doc, 'Article 4 – Modalités',
    `Durée : ${data.duration} mois. Mensualité : ${formatEur(monthlyPayment(data.amount, data.duration))}. Les échéances sont prélevées mensuellement par virement automatique.`, y);

  y = writeArticle(doc, 'Article 5 – Garanties',
    "Les garanties applicables (caution, sûretés) sont détaillées en annexe au présent contrat.", y);

  y = writeArticle(doc, "Article 6 – Clause d'absence d'intermédiation",
    "Le présent contrat est conclu directement entre les parties. La plateforme Fundia Invest intervient uniquement en qualité de facilitateur technologique.", y);

  y = writeArticle(doc, 'Article 7 – Droit applicable',
    "Le présent contrat est soumis au droit français. Tout litige sera porté devant les tribunaux compétents.", y);

  y = writeSignatures(doc, data, y, 'Le Prêteur', 'Le Bénéficiaire');
  writeAmortizationTable(doc, data, y);
}

// ── Conditional Engine ─────────────────────────────────

function selectContractMeta(loanType: string, amount: number): ContractMeta {
  if (loanType === 'consolidation') {
    return { type: 'rachat', addReconnaissanceDette: false, addGarantieRenforcee: false, addCautionDirigeant: false };
  }
  if (loanType === 'business' || loanType === 'project') {
    return { type: 'pro', addReconnaissanceDette: false, addGarantieRenforcee: false, addCautionDirigeant: amount > 30000 };
  }
  // personal, auto, home_improvement → civil
  return {
    type: 'civil',
    addReconnaissanceDette: amount > 15000,
    addGarantieRenforcee: amount > 40000,
    addCautionDirigeant: false,
  };
}

// ── Public API ─────────────────────────────────────────

export function generateContractPdf(data: ContractData, loanTypeLabel: string): { blob: Blob; url: string } {
  const doc = new jsPDF();
  const meta = selectContractMeta(data.loan_type, data.amount);

  switch (meta.type) {
    case 'civil':
      generateCivilContract(doc, data, loanTypeLabel, meta);
      break;
    case 'pro':
      generateProContract(doc, data, loanTypeLabel, meta);
      break;
    case 'rachat':
      generateRachatContract(doc, data, loanTypeLabel);
      break;
  }

  writeFooter(doc);

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  return { blob, url };
}
