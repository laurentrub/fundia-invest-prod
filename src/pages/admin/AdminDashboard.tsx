import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { StatCards } from '@/components/admin/StatCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, CheckCircle, XCircle, Loader2, Eye, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface LoanRequest {
  id: string;
  user_id: string;
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<LoanRequest | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [blockUser, setBlockUser] = useState(false);
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

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;
    setDeleting(true);
    try {
      if (blockUser) {
        await supabase
          .from('profiles')
          .update({ is_blocked: true })
          .eq('id', requestToDelete.user_id);
      }

      const { error } = await supabase
        .from('loan_requests')
        .delete()
        .eq('id', requestToDelete.id);

      if (error) throw error;
      toast.success('Demande supprimée avec succès');
      setRequests((prev) => prev.filter((r) => r.id !== requestToDelete.id));
      setStats((prev) => ({
        ...prev,
        total: prev.total - 1,
        [requestToDelete.status]: prev[requestToDelete.status as keyof typeof prev] - 1,
      }));
    } catch (error: any) {
      toast.error('Erreur lors de la suppression de la demande');
      console.error(error);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
      setBlockUser(false);
    }
  };

  const getLoanTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      personal: t('dashboard.loanTypes.personal'),
      auto: t('dashboard.loanTypes.auto'),
      home: t('dashboard.loanTypes.home_improvement'),
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        onClick={() => {
                          setRequestToDelete(request);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setBlockUser(false); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Supprimer la demande
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la demande de{' '}
              <strong>{requestToDelete?.first_name} {requestToDelete?.last_name}</strong> ?{' '}
              Cette action est irréversible et supprimera toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-2 py-2">
            <Checkbox
              id="blockUserDashboard"
              checked={blockUser}
              onCheckedChange={(checked) => setBlockUser(checked as boolean)}
            />
            <Label htmlFor="blockUserDashboard" className="text-sm font-normal cursor-pointer">
              Bloquer également ce demandeur (empêcher toute nouvelle demande)
            </Label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRequest}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
