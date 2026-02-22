import { useTranslation } from 'react-i18next';
import { Mail, Bell, FileText, Send, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EmailHistoryItem {
  id: string;
  email_type: string;
  recipient_email: string;
  subject: string | null;
  body: string | null;
  sent_at: string;
  sent_by_name?: string;
}

interface EmailHistoryProps {
  emails: EmailHistoryItem[];
}

const typeIcons: Record<string, typeof Mail> = {
  status_notification: Bell,
  custom: Mail,
  document_request: FileText,
  contract: Send,
};

const typeLabels: Record<string, string> = {
  status_notification: 'Notification de statut',
  custom: 'Email libre',
  document_request: 'Demande de documents',
  contract: 'Envoi de contrat',
};

const typeColors: Record<string, string> = {
  status_notification: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  custom: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  document_request: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  contract: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

export function EmailHistory({ emails }: EmailHistoryProps) {
  const { t } = useTranslation();

  if (emails.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Aucun email envoyé pour cette demande</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {emails.map((email, index) => {
        const TypeIcon = typeIcons[email.email_type] || Mail;
        return (
          <div
            key={email.id}
            className="relative pl-6 pb-4 last:pb-0"
          >
            {index < emails.length - 1 && (
              <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
            )}

            <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <TypeIcon className="w-3 h-3 text-primary" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={typeColors[email.email_type] || ''}>
                  {typeLabels[email.email_type] || email.email_type}
                </Badge>
              </div>

              {email.subject && (
                <p className="text-sm font-medium">{email.subject}</p>
              )}

              {email.body && (
                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded line-clamp-3">
                  {email.body}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{new Date(email.sent_at).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
                {email.sent_by_name && (
                  <>
                    <span>•</span>
                    <span>{email.sent_by_name}</span>
                  </>
                )}
                <span>•</span>
                <span>{email.recipient_email}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
