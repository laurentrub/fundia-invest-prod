/**
 * Contract Generator - Generate personalized loan contracts as PDF
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface LoanData {
  requestId: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientCity: string;
  clientPostalCode: string;
  loanType: string;
  amount: number;
  duration: number; // in months
  monthlyPayment: number;
  interestRate: number; // annual percentage
  totalCost: number;
  startDate: Date;
}

export interface ContractTemplate {
  loanTypeLabel: string;
  introduction: string;
  specialConditions?: string[];
}

const LOAN_TYPE_TEMPLATES: Record<string, ContractTemplate> = {
  personal: {
    loanTypeLabel: 'Prêt Personnel',
    introduction: 'Le présent contrat concerne un prêt personnel destiné à financer des projets personnels.',
  },
  auto: {
    loanTypeLabel: 'Crédit Automobile',
    introduction: 'Le présent contrat concerne un crédit automobile destiné au financement d\'un véhicule.',
    specialConditions: [
      'Le véhicule financé servira de garantie pour ce prêt.',
      'Une assurance auto est obligatoire pendant toute la durée du prêt.',
    ],
  },
  home: {
    loanTypeLabel: 'Crédit Travaux',
    introduction: 'Le présent contrat concerne un crédit travaux destiné à financer des travaux d\'amélioration ou de rénovation.',
    specialConditions: [
      'Les travaux doivent être réalisés par des professionnels qualifiés.',
      'Des justificatifs de dépenses pourront être demandés.',
    ],
  },
  home_improvement: {
    loanTypeLabel: 'Crédit Travaux',
    introduction: 'Le présent contrat concerne un crédit travaux destiné à financer des travaux d\'amélioration ou de rénovation.',
    specialConditions: [
      'Les travaux doivent être réalisés par des professionnels qualifiés.',
      'Des justificatifs de dépenses pourront être demandés.',
    ],
  },
  business: {
    loanTypeLabel: 'Prêt Entreprise',
    introduction: 'Le présent contrat concerne un prêt professionnel destiné à financer des besoins d\'entreprise.',
    specialConditions: [
      'Ce prêt est destiné exclusivement à un usage professionnel.',
      'Des documents comptables pourront être demandés annuellement.',
    ],
  },
  consolidation: {
    loanTypeLabel: 'Rachat de Crédit',
    introduction: 'Le présent contrat concerne un rachat de crédit destiné à regrouper plusieurs crédits existants.',
    specialConditions: [
      'Les crédits consolidés seront remboursés par le montant de ce prêt.',
      'L\'emprunteur s\'engage à ne pas contracter de nouveau crédit sans en informer le prêteur.',
    ],
  },
  project: {
    loanTypeLabel: 'Financement de Projet',
    introduction: 'Le présent contrat concerne le financement d\'un projet spécifique.',
  },
};

/**
 * Generate loan contract PDF
 */
export async function generateContractPDF(loanData: LoanData): Promise<Blob> {
  const doc = new jsPDF();
  const template = LOAN_TYPE_TEMPLATES[loanData.loanType] || LOAN_TYPE_TEMPLATES.personal;

  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Logo and Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(102, 126, 234); // Primary color
  doc.text('FUNDIA INVEST', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(`CONTRAT DE MISE EN RELATION - ${template.loanTypeLabel.toUpperCase()}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Référence: ${loanData.requestId}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;
  doc.text(`Date d'émission: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;

  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Parties
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('ENTRE LES SOUSSIGNÉS', margin, yPosition);
  yPosition += 10;

  // Platform
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('LA PLATEFORME (Fundia Invest):', margin, yPosition);
  yPosition += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('HEDGE FUNDS INVESTMENT MANAGEMENT LIMITED (Fundia Invest)', margin + 5, yPosition);
  yPosition += 5;
  doc.text('C/O WAYSTONE MANAGEMENT (UK) LIMITED, 3rd Floor, Central Square', margin + 5, yPosition);
  yPosition += 5;
  doc.text('29 Wellington Street, Leeds, LS1 4DL, Royaume-Uni', margin + 5, yPosition);
  yPosition += 10;

  // Borrower
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('L\'EMPRUNTEUR:', margin, yPosition);
  yPosition += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${loanData.clientFirstName} ${loanData.clientLastName}`, margin + 5, yPosition);
  yPosition += 5;
  doc.text(loanData.clientAddress, margin + 5, yPosition);
  yPosition += 5;
  doc.text(`${loanData.clientPostalCode} ${loanData.clientCity}`, margin + 5, yPosition);
  yPosition += 5;
  doc.text(`Email: ${loanData.clientEmail}`, margin + 5, yPosition);
  yPosition += 5;
  if (loanData.clientPhone) {
    doc.text(`Téléphone: ${loanData.clientPhone}`, margin + 5, yPosition);
    yPosition += 5;
  }

  yPosition += 10;

  // Introduction
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PRÉAMBULE', margin, yPosition);
  yPosition += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const preambleText = `${template.introduction} Fundia Invest agit exclusivement en tant que plateforme de mise en relation entre l'emprunteur et les organismes de crédit ou financeurs partenaires. Fundia Invest n'est pas un établissement de crédit, n'est pas prêteur, et le présent document ne constitue pas une offre de crédit ferme. Les caractéristiques ci-dessous sont fournies à titre indicatif ; le contrat de financement définitif sera conclu directement entre l'emprunteur et le financeur ayant accepté le dossier.`;
  const introLines = doc.splitTextToSize(preambleText, contentWidth);
  doc.text(introLines, margin, yPosition);
  yPosition += introLines.length * 5 + 10;

  // Loan Details Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('CARACTÉRISTIQUES DU PRÊT', margin, yPosition);
  yPosition += 10;

  const loanDetails = [
    ['Type de crédit', template.loanTypeLabel],
    ['Montant emprunté', `${loanData.amount.toLocaleString('fr-FR')} €`],
    ['Durée', `${loanData.duration} mois`],
    ['Taux d\'intérêt annuel', `${loanData.interestRate.toFixed(2)}%`],
    ['Mensualité', `${loanData.monthlyPayment.toLocaleString('fr-FR')} €`],
    ['Coût total du crédit', `${loanData.totalCost.toLocaleString('fr-FR')} €`],
    ['Date de début', loanData.startDate.toLocaleDateString('fr-FR')],
  ];

  (doc as any).autoTable({
    startY: yPosition,
    head: [['Élément', 'Valeur']],
    body: loanDetails,
    theme: 'grid',
    headStyles: {
      fillColor: [102, 126, 234],
      fontSize: 11,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Terms and Conditions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('ARTICLE 1 - OBJET DU CONTRAT', margin, yPosition);
  yPosition += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const article1 = `Le présent document formalise la demande de financement de l'emprunteur, d'un montant indicatif de ${loanData.amount.toLocaleString('fr-FR')} € (${numberToWords(loanData.amount)} euros), destinée à financer ${template.loanTypeLabel.toLowerCase()}. Fundia Invest s'engage à transmettre ce dossier aux organismes de crédit et financeurs partenaires susceptibles de l'étudier. L'octroi effectif du financement reste soumis à l'accord d'un financeur et à la signature d'un contrat de crédit distinct entre celui-ci et l'emprunteur.`;
  const article1Lines = doc.splitTextToSize(article1, contentWidth);
  doc.text(article1Lines, margin, yPosition);
  yPosition += article1Lines.length * 5 + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('ARTICLE 2 - DURÉE ET REMBOURSEMENT (INDICATIFS)', margin, yPosition);
  yPosition += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const article2 = `Sur la base des informations communiquées, la durée envisagée est de ${loanData.duration} mois, avec un échéancier indicatif de ${loanData.duration} mensualités de ${loanData.monthlyPayment.toLocaleString('fr-FR')} €, incluant capital et intérêts. Ces conditions sont fournies à titre de simulation et seront confirmées ou ajustées par le financeur dans le contrat de crédit définitif.`;
  const article2Lines = doc.splitTextToSize(article2, contentWidth);
  doc.text(article2Lines, margin, yPosition);
  yPosition += article2Lines.length * 5 + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('ARTICLE 3 - TAUX D\'INTÉRÊT (INDICATIF)', margin, yPosition);
  yPosition += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const article3 = `Le taux d'intérêt annuel indicatif (TAEG) est de ${loanData.interestRate.toFixed(2)}%, calculé sur la base des informations fournies par l'emprunteur. Ce taux est susceptible d'être ajusté par le financeur après examen complet du dossier et ne constitue pas un engagement ferme de Fundia Invest.`;
  const article3Lines = doc.splitTextToSize(article3, contentWidth);
  doc.text(article3Lines, margin, yPosition);
  yPosition += article3Lines.length * 5 + 10;

  // Check if we need a new page
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('ARTICLE 4 - MODALITÉS DE PAIEMENT (INDICATIVES)', margin, yPosition);
  yPosition += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const article4 = `Les modalités de prélèvement des mensualités (date, compte bancaire, premier prélèvement) seront définies par le financeur dans le contrat de crédit définitif conclu avec l'emprunteur.`;
  const article4Lines = doc.splitTextToSize(article4, contentWidth);
  doc.text(article4Lines, margin, yPosition);
  yPosition += article4Lines.length * 5 + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('ARTICLE 5 - REMBOURSEMENT ANTICIPÉ', margin, yPosition);
  yPosition += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const article5 = `Sauf disposition contraire du contrat de crédit définitif, l'emprunteur conserve généralement la faculté de rembourser par anticipation, en totalité ou en partie, le capital restant dû. Les conditions exactes (pénalités éventuelles, calcul des intérêts dus) sont fixées par le financeur dans le contrat de crédit définitif.`;
  const article5Lines = doc.splitTextToSize(article5, contentWidth);
  doc.text(article5Lines, margin, yPosition);
  yPosition += article5Lines.length * 5 + 10;

  // Special conditions if any
  if (template.specialConditions && template.specialConditions.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ARTICLE 6 - CONDITIONS SPÉCIFIQUES', margin, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    template.specialConditions.forEach((condition, index) => {
      const conditionLines = doc.splitTextToSize(`${index + 1}. ${condition}`, contentWidth - 5);
      doc.text(conditionLines, margin + 5, yPosition);
      yPosition += conditionLines.length * 5 + 5;
    });
    yPosition += 5;
  }

  // Check if we need a new page for signatures
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }

  // Signatures
  yPosition += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Fait en deux exemplaires originaux', margin, yPosition);
  yPosition += 7;
  doc.text(`À Leeds, le ${new Date().toLocaleDateString('fr-FR')}`, margin, yPosition);

  yPosition += 20;

  // Signature boxes
  const signatureBoxWidth = (contentWidth - 20) / 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);

  // Platform signature
  doc.text('La Plateforme', margin, yPosition);
  doc.rect(margin, yPosition + 5, signatureBoxWidth, 30);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Signature et cachet', margin + 5, yPosition + 25);

  // Borrower signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('L\'Emprunteur', pageWidth - margin - signatureBoxWidth, yPosition);
  doc.rect(pageWidth - margin - signatureBoxWidth, yPosition + 5, signatureBoxWidth, 30);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Signature précédée de', pageWidth - margin - signatureBoxWidth + 5, yPosition + 20);
  doc.text('"Lu et approuvé"', pageWidth - margin - signatureBoxWidth + 5, yPosition + 25);

  // Footer
  yPosition += 50;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Fundia Invest - HEDGE FUNDS INVESTMENT MANAGEMENT LIMITED - 29 Wellington Street, Leeds, LS1 4DL, Royaume-Uni', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 4;
  doc.text('contact@fundia-invest.com - www.fundia-invest.com', pageWidth / 2, yPosition, { align: 'center' });

  return doc.output('blob');
}

/**
 * Helper function to convert number to French words (simplified)
 */
function numberToWords(num: number): string {
  // Simplified version - only handles common loan amounts
  if (num >= 1000 && num < 100000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    let result = `${thousands} mille`;
    if (remainder > 0) {
      result += ` ${remainder}`;
    }
    return result;
  }
  return num.toString();
}

/**
 * Calculate monthly payment using loan formula
 */
export function calculateMonthlyPayment(
  amount: number,
  annualRate: number,
  durationMonths: number
): number {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return amount / durationMonths;

  const payment =
    (amount * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
    (Math.pow(1 + monthlyRate, durationMonths) - 1);

  return Math.round(payment * 100) / 100;
}

/**
 * Calculate total cost of loan
 */
export function calculateTotalCost(
  monthlyPayment: number,
  durationMonths: number,
  amount: number
): number {
  return Math.round((monthlyPayment * durationMonths - amount) * 100) / 100;
}
