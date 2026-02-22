import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Send, Eye } from 'lucide-react';
import { generateContractPdf, type ContractData } from '@/lib/contractTemplates';

interface ContractPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: ContractData;
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

  useEffect(() => {
    if (open && request) {
      setIsLoading(true);
      try {
        const label = getLoanTypeLabel(request.loan_type);
        const { blob, url } = generateContractPdf(request, label);
        setPdfBlob(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        setIsLoading(false);
      }
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
              name: `${request.first_name} ${request.last_name}`,
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
