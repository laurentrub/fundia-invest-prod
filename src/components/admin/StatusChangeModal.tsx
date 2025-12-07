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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface StatusChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: string;
  onSubmit: (newStatus: string, comment: string, sendEmail: boolean) => Promise<void>;
}

const statuses = [
  { value: 'pending', icon: Clock, color: 'text-yellow-600' },
  { value: 'in_progress', icon: Loader2, color: 'text-blue-600' },
  { value: 'approved', icon: CheckCircle, color: 'text-green-600' },
  { value: 'refused', icon: XCircle, color: 'text-red-600' },
];

export function StatusChangeModal({
  open,
  onOpenChange,
  currentStatus,
  onSubmit,
}: StatusChangeModalProps) {
  const { t } = useTranslation();
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [comment, setComment] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (newStatus === currentStatus) return;

    setIsSubmitting(true);
    try {
      await onSubmit(newStatus, comment, sendEmail);
      setComment('');
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('admin.statusModal.title')}</DialogTitle>
          <DialogDescription>
            {t('admin.statusModal.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('admin.statusModal.newStatus')}</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => {
                  const Icon = status.icon;
                  return (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${status.color}`} />
                        <span>{t(`admin.status.${status.value}`)}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('admin.statusModal.comment')}</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('admin.statusModal.commentPlaceholder')}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sendEmail"
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(checked as boolean)}
            />
            <Label htmlFor="sendEmail" className="text-sm font-normal cursor-pointer">
              {t('admin.statusModal.sendEmail')}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={newStatus === currentStatus || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('admin.statusModal.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
