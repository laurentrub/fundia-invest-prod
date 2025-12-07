import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface DocumentRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (documents: string[], customMessage: string) => Promise<void>;
  clientName: string;
}

const DOCUMENT_OPTIONS = [
  { id: 'id_card', labelKey: 'admin.documentRequest.documents.idCard' },
  { id: 'proof_of_income', labelKey: 'admin.documentRequest.documents.proofOfIncome' },
  { id: 'bank_statements', labelKey: 'admin.documentRequest.documents.bankStatements' },
  { id: 'tax_return', labelKey: 'admin.documentRequest.documents.taxReturn' },
  { id: 'proof_of_address', labelKey: 'admin.documentRequest.documents.proofOfAddress' },
  { id: 'employment_contract', labelKey: 'admin.documentRequest.documents.employmentContract' },
  { id: 'business_registration', labelKey: 'admin.documentRequest.documents.businessRegistration' },
  { id: 'other', labelKey: 'admin.documentRequest.documents.other' },
];

export function DocumentRequestModal({
  open,
  onOpenChange,
  onSubmit,
  clientName,
}: DocumentRequestModalProps) {
  const { t } = useTranslation();
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDocumentToggle = (documentId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSubmit = async () => {
    if (selectedDocuments.length === 0) return;

    setIsLoading(true);
    try {
      const documentLabels = selectedDocuments.map((id) => {
        const option = DOCUMENT_OPTIONS.find((opt) => opt.id === id);
        return option ? t(option.labelKey) : id;
      });
      await onSubmit(documentLabels, customMessage);
      setSelectedDocuments([]);
      setCustomMessage('');
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedDocuments([]);
      setCustomMessage('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('admin.documentRequest.title')}</DialogTitle>
          <DialogDescription>
            {t('admin.documentRequest.description', { name: clientName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>{t('admin.documentRequest.selectDocuments')}</Label>
            <div className="grid grid-cols-1 gap-3">
              {DOCUMENT_OPTIONS.map((option) => (
                <div key={option.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={option.id}
                    checked={selectedDocuments.includes(option.id)}
                    onCheckedChange={() => handleDocumentToggle(option.id)}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor={option.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {t(option.labelKey)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customMessage">
              {t('admin.documentRequest.customMessage')}
            </Label>
            <Textarea
              id="customMessage"
              placeholder={t('admin.documentRequest.customMessagePlaceholder')}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedDocuments.length === 0 || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('admin.documentRequest.send')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
