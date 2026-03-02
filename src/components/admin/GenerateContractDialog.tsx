import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  generateContractPDF,
  calculateMonthlyPayment,
  calculateTotalCost,
  type LoanData,
} from '@/lib/contractGenerator';
import { supabase } from '@/integrations/supabase/client';

interface GenerateContractDialogProps {
  loanRequest: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    loan_type: string;
    amount: number;
    duration: number;
  };
}

export function GenerateContractDialog({ loanRequest }: GenerateContractDialogProps) {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [interestRate, setInterestRate] = useState('3.5');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  ); // 7 days from now

  const handleGenerateContract = async () => {
    try {
      setGenerating(true);

      const rate = parseFloat(interestRate);
      if (isNaN(rate) || rate < 0 || rate > 20) {
        toast.error('Taux d\'intérêt invalide (0-20%)');
        return;
      }

      const monthlyPayment = calculateMonthlyPayment(
        loanRequest.amount,
        rate,
        loanRequest.duration
      );

      const totalCost = calculateTotalCost(
        monthlyPayment,
        loanRequest.duration,
        loanRequest.amount
      );

      const loanData: LoanData = {
        requestId: loanRequest.id,
        clientFirstName: loanRequest.first_name,
        clientLastName: loanRequest.last_name,
        clientEmail: loanRequest.email,
        clientPhone: loanRequest.phone || '',
        clientAddress: loanRequest.address || 'Adresse non fournie',
        clientCity: loanRequest.city || '',
        clientPostalCode: loanRequest.postal_code || '',
        loanType: loanRequest.loan_type,
        amount: loanRequest.amount,
        duration: loanRequest.duration,
        monthlyPayment,
        interestRate: rate,
        totalCost,
        startDate: new Date(startDate),
      };

      // Generate PDF
      const pdfBlob = await generateContractPDF(loanData);

      // Upload to Supabase Storage
      const fileName = `contract-${loanRequest.id}-${Date.now()}.pdf`;
      const filePath = `contracts/${loanRequest.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('signed-contracts')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Erreur lors de l\'upload du contrat');
      }

      // Create contract record in database
      const { error: dbError } = await supabase.from('contracts').insert({
        loan_request_id: loanRequest.id,
        contract_path: filePath,
        status: 'pending_signature',
        interest_rate: rate,
        monthly_payment: monthlyPayment,
        total_cost: totalCost,
        start_date: startDate,
      });

      if (dbError) {
        console.error('DB error:', dbError);
        throw new Error('Erreur lors de la création du contrat');
      }

      // Also download the PDF for admin
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Contrat-${loanRequest.last_name}-${loanRequest.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Contrat généré et sauvegardé avec succès !');
      setOpen(false);
    } catch (error: any) {
      console.error('Error generating contract:', error);
      toast.error(error.message || 'Erreur lors de la génération du contrat');
    } finally {
      setGenerating(false);
    }
  };

  const previewPayment = () => {
    const rate = parseFloat(interestRate);
    if (isNaN(rate)) return '—';
    const monthlyPayment = calculateMonthlyPayment(
      loanRequest.amount,
      rate,
      loanRequest.duration
    );
    return monthlyPayment.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const previewTotalCost = () => {
    const rate = parseFloat(interestRate);
    if (isNaN(rate)) return '—';
    const monthlyPayment = calculateMonthlyPayment(
      loanRequest.amount,
      rate,
      loanRequest.duration
    );
    const totalCost = calculateTotalCost(
      monthlyPayment,
      loanRequest.duration,
      loanRequest.amount
    );
    return totalCost.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Générer contrat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Générer un contrat de prêt</DialogTitle>
          <DialogDescription>
            Configurez les paramètres du contrat pour {loanRequest.first_name} {loanRequest.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Loan Summary */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Montant:</span>
              <span className="font-medium">{loanRequest.amount.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Durée:</span>
              <span className="font-medium">{loanRequest.duration} mois</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <Label htmlFor="interestRate">Taux d'intérêt annuel (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="3.5"
            />
            <p className="text-xs text-muted-foreground">
              Exemple: 3.5 pour 3,5% par an
            </p>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Date de début du prêt</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* Preview */}
          <div className="rounded-lg border p-4 space-y-2 bg-blue-50/50 dark:bg-blue-950/20">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Aperçu du contrat
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mensualité:</span>
              <span className="font-medium">{previewPayment()} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Coût total du crédit:</span>
              <span className="font-medium">{previewTotalCost()} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Montant total à rembourser:</span>
              <span className="font-medium">
                {(
                  loanRequest.amount + (parseFloat(previewTotalCost().replace(/\s/g, '').replace(',', '.')) || 0)
                ).toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} €
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={generating}>
            Annuler
          </Button>
          <Button onClick={handleGenerateContract} disabled={generating} className="gap-2">
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Générer et télécharger
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
