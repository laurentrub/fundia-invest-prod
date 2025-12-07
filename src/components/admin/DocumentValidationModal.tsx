import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface DocumentValidationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: string;
  clientName: string;
  action: 'validate' | 'reject';
  onConfirm: (reason?: string) => Promise<void>;
}

export function DocumentValidationModal({
  open,
  onOpenChange,
  documentType,
  clientName,
  action,
  onConfirm,
}: DocumentValidationModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(action === 'reject' ? reason : undefined);
      setReason('');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const isValidate = action === 'validate';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isValidate ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Valider le document
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                Refuser le document
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isValidate
              ? `Confirmez la validation du document "${documentType}" de ${clientName}.`
              : `Indiquez la raison du refus pour le document "${documentType}" de ${clientName}.`}
          </DialogDescription>
        </DialogHeader>

        {!isValidate && (
          <div className="space-y-2">
            <Label htmlFor="reason">Raison du refus *</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Document illisible, document expiré, mauvais type de document..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant={isValidate ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={loading || (!isValidate && !reason.trim())}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isValidate ? 'Valider' : 'Refuser'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
