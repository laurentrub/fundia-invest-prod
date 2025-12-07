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
import { Clock, CheckCircle, XCircle, Loader2, Eye, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

    return matchesSearch && matchesStatus;
  });

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
        <h1 className="text-2xl font-bold">{t('admin.requests.title')}</h1>
        <p className="text-muted-foreground">{t('admin.requests.subtitle')}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
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
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/requests/${request.id}`} className="gap-2">
                            <Eye className="h-4 w-4" />
                            {t('admin.requests.view')}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
