import { useTranslation } from 'react-i18next';
import { Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusHistoryItem {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_at: string;
  comment: string | null;
  changed_by_name?: string;
}

interface StatusHistoryProps {
  history: StatusHistoryItem[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  refused: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function StatusHistory({ history }: StatusHistoryProps) {
  const { t } = useTranslation();

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>{t('admin.history.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item, index) => (
        <div
          key={item.id}
          className="relative pl-6 pb-4 last:pb-0"
        >
          {/* Timeline line */}
          {index < history.length - 1 && (
            <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
          )}
          
          {/* Timeline dot */}
          <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          </div>

          <div className="space-y-2">
            {/* Status change */}
            <div className="flex items-center gap-2 flex-wrap">
              {item.old_status && (
                <>
                  <Badge variant="outline" className={cn('text-xs', statusColors[item.old_status])}>
                    {t(`admin.status.${item.old_status}`)}
                  </Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </>
              )}
              <Badge variant="outline" className={cn('text-xs', statusColors[item.new_status])}>
                {t(`admin.status.${item.new_status}`)}
              </Badge>
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{new Date(item.changed_at).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
              {item.changed_by_name && (
                <>
                  <span>•</span>
                  <span>{item.changed_by_name}</span>
                </>
              )}
            </div>

            {/* Comment */}
            {item.comment && (
              <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                {item.comment}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
