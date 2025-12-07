import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Download, Send, Eye } from 'lucide-react';

interface LoanRequest {
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

interface ContractPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: LoanRequest;
  onSendContract: (pdfBlob: Blob) => Promise<void>;
}

export function ContractPreviewModal({
  open,
  onOpenChange,
  request,
  onSendContract,
}: ContractPreviewModalProps) {
  const { t } = useTranslation();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const getLoanTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      personal: t('dashboard.loanTypes.personal'),
      auto: t('dashboard.loanTypes.auto'),
      home_improvement: t('dashboard.loanTypes.home_improvement'),
      business: t('dashboard.loanTypes.business'),
      consolidation: t('dashboard.loanTypes.consolidation'),
      project: t('dashboard.loanTypes.project'),
    };
    return types[type] || type;
  };

  const calculateMonthlyPayment = (amount: number, duration: number, rate: number = 0.035) => {
    const monthlyRate = rate / 12;
    const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) / 
                   (Math.pow(1 + monthlyRate, duration) - 1);
    return payment.toFixed(2);
  };

  const generatePdf = () => {
    setIsLoading(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      // Header
      doc.setFillColor(30, 58, 95);
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('PRIVAT EQUITY', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('CONTRAT DE PRÊT', pageWidth / 2, 32, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Référence: ${request.id.slice(0, 8).toUpperCase()}`, pageWidth / 2, 40, { align: 'center' });

      yPos = 60;
      doc.setTextColor(0, 0, 0);

      // Contract date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const today = new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      doc.text(`Établi le ${today}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 15;

      // Section: Parties
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 95);
      doc.text('ENTRE LES PARTIES', margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      doc.text('Le Prêteur:', margin, yPos);
      yPos += 5;
      doc.text('Privat Equity', margin + 5, yPos);
      yPos += 5;
      doc.text('5588 Rue Frontenac, Montréal, QC H2H 2L9, Canada', margin + 5, yPos);
      yPos += 10;

      doc.text("L'Emprunteur:", margin, yPos);
      yPos += 5;
      doc.text(`${request.first_name} ${request.last_name}`, margin + 5, yPos);
      yPos += 5;
      doc.text(`Email: ${request.email}`, margin + 5, yPos);
      if (request.phone) {
        yPos += 5;
        doc.text(`Téléphone: ${request.phone}`, margin + 5, yPos);
      }
      yPos += 15;

      // Section: Loan details
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 95);
      doc.text('CONDITIONS DU PRÊT', margin, yPos);
      yPos += 8;

      const monthlyPayment = calculateMonthlyPayment(request.amount, request.duration);
      const totalAmount = (parseFloat(monthlyPayment) * request.duration).toFixed(2);
      const totalInterest = (parseFloat(totalAmount) - request.amount).toFixed(2);

      autoTable(doc, {
        startY: yPos,
        head: [['Désignation', 'Valeur']],
        body: [
          ['Type de prêt', getLoanTypeLabel(request.loan_type)],
          ['Montant emprunté', `${request.amount.toLocaleString('fr-FR')} €`],
          ['Durée du prêt', `${request.duration} mois`],
          ['Taux annuel (TAEG)', '3,50 %'],
          ['Mensualité', `${parseFloat(monthlyPayment).toLocaleString('fr-FR')} €`],
          ['Total des intérêts', `${parseFloat(totalInterest).toLocaleString('fr-FR')} €`],
          ['Montant total dû', `${parseFloat(totalAmount).toLocaleString('fr-FR')} €`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 95] },
        margin: { left: margin, right: margin },
        styles: { fontSize: 10 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;

      // Section: Terms
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 95);
      doc.text('CONDITIONS GÉNÉRALES', margin, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      const terms = [
        "1. Le prêt sera versé sur le compte bancaire de l'Emprunteur dans un délai de 48 heures suivant la signature du présent contrat.",
        "2. Les mensualités seront prélevées automatiquement le 5 de chaque mois sur le compte bancaire de l'Emprunteur.",
        "3. L'Emprunteur peut rembourser par anticipation tout ou partie du capital restant dû sans pénalités.",
        "4. En cas de retard de paiement, des pénalités de retard seront appliquées conformément à la réglementation en vigueur.",
        "5. Le présent contrat est soumis au droit français et tout litige sera porté devant les tribunaux compétents.",
      ];

      terms.forEach((term) => {
        const lines = doc.splitTextToSize(term, pageWidth - 2 * margin);
        doc.text(lines, margin, yPos);
        yPos += lines.length * 5 + 3;
      });

      yPos += 10;

      // Signatures
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 95);
      doc.text('SIGNATURES', margin, yPos);
      yPos += 15;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);

      // Left signature box
      doc.rect(margin, yPos, 75, 40);
      doc.text('Le Prêteur', margin + 5, yPos + 8);
      doc.text('Privat Equity', margin + 5, yPos + 16);
      doc.text('Date: _______________', margin + 5, yPos + 32);

      // Right signature box
      doc.rect(pageWidth - margin - 75, yPos, 75, 40);
      doc.text("L'Emprunteur", pageWidth - margin - 70, yPos + 8);
      doc.text(`${request.first_name} ${request.last_name}`, pageWidth - margin - 70, yPos + 16);
      doc.text('Date: _______________', pageWidth - margin - 70, yPos + 32);

      // Footer
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Privat Equity - 5588 Rue Frontenac, Montréal, QC H2H 2L9, Canada', pageWidth / 2, footerY, { align: 'center' });
      doc.text('www.privat-equity.com', pageWidth / 2, footerY + 5, { align: 'center' });

      // Generate blob and URL
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      
      setPdfBlob(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && request) {
      generatePdf();
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [open, request]);

  const handleDownload = () => {
    if (pdfBlob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(pdfBlob);
      link.download = `contrat-${request.id.slice(0, 8)}.pdf`;
      link.click();
    }
  };

  const handleSend = async () => {
    if (!pdfBlob) return;
    
    setIsSending(true);
    try {
      await onSendContract(pdfBlob);
      onOpenChange(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {t('admin.contract.previewTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('admin.contract.previewDescription', { 
              name: `${request.first_name} ${request.last_name}` 
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border rounded-md"
              title="Contract Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {t('admin.contract.errorGenerating')}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSending}>
            {t('common.cancel')}
          </Button>
          <Button variant="outline" onClick={handleDownload} disabled={!pdfBlob || isSending}>
            <Download className="mr-2 h-4 w-4" />
            {t('admin.contract.download')}
          </Button>
          <Button onClick={handleSend} disabled={!pdfBlob || isSending}>
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="mr-2 h-4 w-4" />
            {t('admin.contract.sendForSignature')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
