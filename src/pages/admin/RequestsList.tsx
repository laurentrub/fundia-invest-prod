import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Clock, CheckCircle, XCircle, Loader2, Eye, Search, Download, FileSpreadsheet, Trash2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { downloadCSV, downloadExcel, formatDateForExport, formatCurrencyForExport } from '@/lib/exportUtils';

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

export default function RequestsList() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<LoanRequest | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loanTypeFilter, setLoanTypeFilter] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('loan_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
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
      home: t('dashboard.loanTypes.home_improvement'),
      home_improvement: t('dashboard.loanTypes.home_improvement'),
      business: t('dashboard.loanTypes.business'),
      consolidation: t('dashboard.loanTypes.consolidation'),
      project: t('dashboard.loanTypes.project'),
    };
    return types[type] || type;
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      search === '' ||
      `${request.first_name} ${request.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      request.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    const matchesLoanType = loanTypeFilter === 'all' || request.loan_type === loanTypeFilter;

    const matchesMinAmount = minAmount === '' || request.amount >= parseFloat(minAmount);
    const matchesMaxAmount = maxAmount === '' || request.amount <= parseFloat(maxAmount);

    const matchesStartDate = startDate === '' || new Date(request.created_at) >= new Date(startDate);
    const matchesEndDate = endDate === '' || new Date(request.created_at) <= new Date(endDate);

    return matchesSearch && matchesStatus && matchesLoanType && matchesMinAmount && matchesMaxAmount && matchesStartDate && matchesEndDate;
  });

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('loan_requests')
        .delete()
        .eq('id', requestToDelete.id);

      if (error) throw error;
      toast.success('Demande supprimée avec succès');
      setRequests((prev) => prev.filter((r) => r.id !== requestToDelete.id));
    } catch (error: any) {
      toast.error('Erreur lors de la suppression de la demande');
      console.error(error);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredRequests.map(request => ({
      'ID': request.id,
      'Prénom': request.first_name,
      'Nom': request.last_name,
      'Email': request.email,
      'Téléphone': request.phone || '',
      'Type de crédit': getLoanTypeLabel(request.loan_type),
      'Montant (€)': formatCurrencyForExport(request.amount),
      'Durée (mois)': request.duration,
      'Statut': t(`admin.status.${request.status}`),
      'Date de création': formatDateForExport(request.created_at),
    }));

    downloadCSV(exportData, `demandes-credit-${new Date().toISOString().split('T')[0]}`);
    toast.success('Export CSV téléchargé');
  };

  const handleExportExcel = () => {
    const exportData = filteredRequests.map(request => ({
      'ID': request.id,
      'Prénom': request.first_name,
      'Nom': request.last_name,
      'Email': request.email,
      'Téléphone': request.phone || '',
      'Type de crédit': getLoanTypeLabel(request.loan_type),
      'Montant (€)': formatCurrencyForExport(request.amount),
      'Durée (mois)': request.duration,
      'Statut': t(`admin.status.${request.status}`),
      'Date de création': formatDateForExport(request.created_at),
    }));

    downloadExcel(exportData, `demandes-credit-${new Date().toISOString().split('T')[0]}`);
    toast.success('Export Excel téléchargé');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.requests.title')}</h1>
          <p className="text-muted-foreground">{t('admin.requests.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleExportExcel} variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Row 1: Search and Status */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('admin.requests.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('admin.requests.filterStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.requests.allStatuses')}</SelectItem>
                  <SelectItem value="pending">{t('admin.status.pending')}</SelectItem>
                  <SelectItem value="in_progress">{t('admin.status.in_progress')}</SelectItem>
                  <SelectItem value="approved">{t('admin.status.approved')}</SelectItem>
                  <SelectItem value="refused">{t('admin.status.refused')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={loanTypeFilter} onValueChange={setLoanTypeFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Type de crédit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="personal">{t('dashboard.loanTypes.personal')}</SelectItem>
                  <SelectItem value="auto">{t('dashboard.loanTypes.auto')}</SelectItem>
                  <SelectItem value="home">{t('dashboard.loanTypes.home_improvement')}</SelectItem>
                  <SelectItem value="home_improvement">{t('dashboard.loanTypes.home_improvement')}</SelectItem>
                  <SelectItem value="business">{t('dashboard.loanTypes.business')}</SelectItem>
                  <SelectItem value="consolidation">{t('dashboard.loanTypes.consolidation')}</SelectItem>
                  <SelectItem value="project">{t('dashboard.loanTypes.project')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 2: Amount Range and Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Montant min (€)</label>
                <Input
                  type="number"
                  placeholder="1 000"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Montant max (€)</label>
                <Input
                  type="number"
                  placeholder="75 000"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Date début</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Date fin</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
              {filteredRequests.length} résultat(s) sur {requests.length} demande(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.requests.columns.client')}</TableHead>
                <TableHead>{t('admin.requests.columns.type')}</TableHead>
                <TableHead>{t('admin.requests.columns.amount')}</TableHead>
                <TableHead>{t('admin.requests.columns.duration')}</TableHead>
                <TableHead>{t('admin.requests.columns.status')}</TableHead>
                <TableHead>{t('admin.requests.columns.date')}</TableHead>
                <TableHead className="text-right">{t('admin.requests.columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {t('admin.requests.noResults')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => {
                  const StatusIcon = statusIcons[request.status] || Clock;
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {request.first_name} {request.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{request.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getLoanTypeLabel(request.loan_type)}</TableCell>
                      <TableCell>{request.amount.toLocaleString('fr-FR')} €</TableCell>
                      <TableCell>{request.duration} mois</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('gap-1', statusColors[request.status])}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {t(`admin.status.${request.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/admin/requests/${request.id}`} className="gap-2">
                              <Eye className="h-4 w-4" />
                              {t('admin.requests.view')}
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                            onClick={() => {
                              setRequestToDelete(request);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
