import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { StatCards } from '@/components/admin/StatCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LoanRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  loan_type: string;
  amount: number;
  duration: number;
  status: string;
  created_at: string;
}

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  in_progress: Loader2,
  approved: CheckCircle,
  refused: XCircle,
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  refused: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    approved: 0,
    refused: 0,
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('loan_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setRequests(data || []);

      // Calculate stats
      const { data: allRequests, error: statsError } = await supabase
        .from('loan_requests')
        .select('status');

      if (statsError) throw statsError;

      const newStats = {
        total: allRequests?.length || 0,
        pending: allRequests?.filter((r) => r.status === 'pending').length || 0,
        in_progress: allRequests?.filter((r) => r.status === 'in_progress').length || 0,
        approved: allRequests?.filter((r) => r.status === 'approved').length || 0,
        refused: allRequests?.filter((r) => r.status === 'refused').length || 0,
      };
      setStats(newStats);
    } catch (error: any) {
      toast.error(t('admin.messages.loadError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t('admin.dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('admin.dashboard.subtitle')}</p>
      </div>

      {/* Stats */}
      <StatCards stats={stats} />

      {/* Recent requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('admin.dashboard.recentRequests')}</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/requests" className="gap-2">
              {t('admin.dashboard.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t('admin.dashboard.noRequests')}
              </p>
            ) : (
              requests.map((request) => {
                const StatusIcon = statusIcons[request.status] || Clock;
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="min-w-0">
                        <p className="font-medium">
                          {request.first_name} {request.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getLoanTypeLabel(request.loan_type)} • {request.amount.toLocaleString('fr-FR')} €
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={cn('gap-1', statusColors[request.status])}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {t(`admin.status.${request.status}`)}
                      </Badge>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/requests/${request.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
