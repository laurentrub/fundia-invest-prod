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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Bell, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LoanRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  loan_type: string;
  amount: number;
  duration: number;
  status: string;
}

interface SendEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: LoanRequest;
  onEmailSent?: () => void;
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  in_progress: 'En cours de traitement',
  approved: 'Approuvée',
  rejected: 'Refusée',
};

export function SendEmailModal({ open, onOpenChange, request, onEmailSent }: SendEmailModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('notification');
  const [isSending, setIsSending] = useState(false);

  // Custom email state
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSendNotification = async () => {
    setIsSending(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke('send-status-notification', {
        body: {
          loanRequestId: request.id,
          newStatus: request.status,
        },
        headers: {
          Authorization: `Bearer ${session.session?.access_token}`,
        },
      });

      if (error) throw error;

      // Log email in history
      await supabase.from('email_history').insert({
        loan_request_id: request.id,
        sent_by: (await supabase.auth.getUser()).data.user?.id ?? '',
        recipient_email: request.email,
        email_type: 'status_notification',
        subject: `Mise à jour de votre demande - ${statusLabels[request.status] || request.status}`,
      });

      toast.success('Notification de statut envoyée avec succès');
      onEmailSent?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast.error("Erreur lors de l'envoi de la notification");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendCustomEmail = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Veuillez remplir l\'objet et le message');
      return;
    }

    setIsSending(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke('send-custom-email', {
        body: {
          loanRequestId: request.id,
          recipientEmail: request.email,
          recipientName: `${request.first_name} ${request.last_name}`,
          subject: subject.trim(),
          body: body.trim(),
        },
        headers: {
          Authorization: `Bearer ${session.session?.access_token}`,
        },
      });

      if (error) throw error;

      // Log email in history
      await supabase.from('email_history').insert({
        loan_request_id: request.id,
        sent_by: (await supabase.auth.getUser()).data.user?.id ?? '',
        recipient_email: request.email,
        email_type: 'custom',
        subject: subject.trim(),
        body: body.trim(),
      });

      toast.success('Email envoyé avec succès');
      setSubject('');
      setBody('');
      onEmailSent?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending custom email:', error);
      toast.error("Erreur lors de l'envoi de l'email");
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Envoyer un email
          </DialogTitle>
          <DialogDescription>
            Envoyer un email à {request.first_name} {request.last_name} ({request.email})
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notification" className="gap-2">
              <Bell className="h-4 w-4" />
              Notification de statut
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-2">
              <Mail className="h-4 w-4" />
              Email libre
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notification" className="space-y-4 mt-4">
            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Un email automatique sera envoyé au client pour l'informer du statut actuel de sa demande.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Statut actuel :</span>
                <Badge variant="outline">
                  {statusLabels[request.status] || request.status}
                </Badge>
              </div>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Destinataire :</span> {request.email}</p>
                <p><span className="font-medium">Type :</span> Notification de changement de statut</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isSending}>
                Annuler
              </Button>
              <Button onClick={handleSendNotification} disabled={isSending}>
                {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="mr-2 h-4 w-4" />
                Envoyer la notification
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email-subject">Objet</Label>
                <Input
                  id="email-subject"
                  placeholder="Objet de l'email..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isSending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-body">Message</Label>
                <Textarea
                  id="email-body"
                  placeholder="Rédigez votre message..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  disabled={isSending}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                L'email sera envoyé depuis contact@fundia-invest.com au nom de Fundia Invest.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isSending}>
                Annuler
              </Button>
              <Button
                onClick={handleSendCustomEmail}
                disabled={isSending || !subject.trim() || !body.trim()}
              >
                {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="mr-2 h-4 w-4" />
                Envoyer l'email
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
