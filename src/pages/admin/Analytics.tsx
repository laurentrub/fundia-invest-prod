import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, TrendingDown, Users, Euro, Calendar, FileCheck, Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { downloadCSV, downloadExcel, formatDateForExport, formatCurrencyForExport } from '@/lib/exportUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface LoanRequest {
  id: string;
  amount: number;
  status: string;
  loan_type: string;
  created_at: string;
}

interface Analytics {
  totalAmount: number;
  averageAmount: number;
  approvalRate: number;
  rejectionRate: number;
  averageProcessingTime: number;
  totalRequests: number;
  requestsByMonth: { month: string; count: number }[];
  requestsByStatus: { name: string; value: number; color: string }[];
  requestsByType: { type: string; count: number; amount: number }[];
  amountsByMonth: { month: string; amount: number }[];
}

const COLORS = {
  pending: '#eab308',
  in_progress: '#3b82f6',
  approved: '#22c55e',
  refused: '#ef4444',
};

export default function Analytics() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      // Fetch all loan requests within the time range
      const { data: requests, error } = await supabase
        .from('loan_requests')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calculate analytics
      const totalRequests = requests?.length || 0;
      const totalAmount = requests?.reduce((sum, r) => sum + r.amount, 0) || 0;
      const averageAmount = totalRequests > 0 ? totalAmount / totalRequests : 0;

      const approvedCount = requests?.filter(r => r.status === 'approved').length || 0;
      const refusedCount = requests?.filter(r => r.status === 'refused').length || 0;
      const completedCount = approvedCount + refusedCount;

      const approvalRate = completedCount > 0 ? (approvedCount / completedCount) * 100 : 0;
      const rejectionRate = completedCount > 0 ? (refusedCount / completedCount) * 100 : 0;

      // Requests by month
      const requestsByMonth: { [key: string]: number } = {};
      const amountsByMonth: { [key: string]: number } = {};

      requests?.forEach(request => {
        const date = new Date(request.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        requestsByMonth[monthKey] = (requestsByMonth[monthKey] || 0) + 1;
        amountsByMonth[monthKey] = (amountsByMonth[monthKey] || 0) + request.amount;
      });

      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const requestsByMonthArray = Object.entries(requestsByMonth).map(([month, count]) => {
        const [year, monthNum] = month.split('-');
        return {
          month: `${monthNames[parseInt(monthNum) - 1]} ${year}`,
          count,
        };
      });

      const amountsByMonthArray = Object.entries(amountsByMonth).map(([month, amount]) => {
        const [year, monthNum] = month.split('-');
        return {
          month: `${monthNames[parseInt(monthNum) - 1]} ${year}`,
          amount: Math.round(amount),
        };
      });

      // Requests by status
      const statusCounts: { [key: string]: number } = {};
      requests?.forEach(request => {
        statusCounts[request.status] = (statusCounts[request.status] || 0) + 1;
      });

      const requestsByStatus = Object.entries(statusCounts).map(([status, value]) => ({
        name: t(`admin.status.${status}`),
        value,
        color: COLORS[status as keyof typeof COLORS] || '#888',
      }));

      // Requests by type
      const typeCounts: { [key: string]: { count: number; amount: number } } = {};
      requests?.forEach(request => {
        if (!typeCounts[request.loan_type]) {
          typeCounts[request.loan_type] = { count: 0, amount: 0 };
        }
        typeCounts[request.loan_type].count++;
        typeCounts[request.loan_type].amount += request.amount;
      });

      const requestsByType = Object.entries(typeCounts).map(([type, data]) => ({
        type: getLoanTypeLabel(type),
        count: data.count,
        amount: Math.round(data.amount),
      }));

      setAnalytics({
        totalAmount,
        averageAmount,
        approvalRate,
        rejectionRate,
        averageProcessingTime: 0, // TODO: Calculate from status history
        totalRequests,
        requestsByMonth: requestsByMonthArray,
        requestsByStatus,
        requestsByType,
        amountsByMonth: amountsByMonthArray,
      });
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error('Erreur lors du chargement des statistiques');
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

  const handleExportAnalytics = (format: 'csv' | 'excel') => {
    if (!analytics) return;

    const exportData = [
      {
        'Métrique': 'Montant total',
        'Valeur': formatCurrencyForExport(analytics.totalAmount) + ' €',
      },
      {
        'Métrique': 'Montant moyen',
        'Valeur': formatCurrencyForExport(analytics.averageAmount) + ' €',
      },
      {
        'Métrique': 'Taux d\'approbation',
        'Valeur': analytics.approvalRate.toFixed(1) + '%',
      },
      {
        'Métrique': 'Taux de refus',
        'Valeur': analytics.rejectionRate.toFixed(1) + '%',
      },
      {
        'Métrique': 'Total demandes',
        'Valeur': String(analytics.totalRequests),
      },
      { 'Métrique': '', 'Valeur': '' }, // Empty row
      { 'Métrique': 'RÉPARTITION PAR TYPE', 'Valeur': '' },
      ...analytics.requestsByType.map(item => ({
        'Métrique': item.type,
        'Valeur': `${item.count} demandes - ${formatCurrencyForExport(item.amount)} €`,
      })),
    ];

    const filename = `analytics-${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      downloadCSV(exportData, filename);
      toast.success('Export CSV téléchargé');
    } else {
      downloadExcel(exportData, filename);
      toast.success('Export Excel téléchargé');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytiques</h1>
          <p className="text-muted-foreground">Vue d'ensemble des performances</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExportAnalytics('csv')} variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            CSV
          </Button>
          <Button onClick={() => handleExportAnalytics('excel')} variant="outline" size="sm" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">90 derniers jours</SelectItem>
              <SelectItem value="365">12 derniers mois</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAmount.toLocaleString('fr-FR')} €</div>
            <p className="text-xs text-muted-foreground">
              Moy: {Math.round(analytics.averageAmount).toLocaleString('fr-FR')} €
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'approbation</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.approvalRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.requestsByStatus.find(s => s.name.includes('approuvé'))?.value || 0} demandes approuvées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de refus</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.rejectionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.requestsByStatus.find(s => s.name.includes('refusé'))?.value || 0} demandes refusées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total demandes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              Sur {timeRange} jours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests by Month */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des demandes</CardTitle>
            <CardDescription>Nombre de demandes par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.requestsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Demandes" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Requests by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par statut</CardTitle>
            <CardDescription>Distribution des demandes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.requestsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.requestsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Amounts by Month */}
        <Card>
          <CardHeader>
            <CardTitle>Montants mensuels</CardTitle>
            <CardDescription>Volume de financement par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.amountsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString('fr-FR')} €`} />
                <Legend />
                <Bar dataKey="amount" fill="#22c55e" name="Montant (€)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Requests by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Types de crédits</CardTitle>
            <CardDescription>Distribution par type de prêt</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.requestsByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="type" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8b5cf6" name="Demandes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Détails par type de crédit</CardTitle>
          <CardDescription>Statistiques détaillées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Type de crédit</th>
                  <th className="text-right p-2">Nombre</th>
                  <th className="text-right p-2">Montant total</th>
                  <th className="text-right p-2">Montant moyen</th>
                </tr>
              </thead>
              <tbody>
                {analytics.requestsByType.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{item.type}</td>
                    <td className="text-right p-2">{item.count}</td>
                    <td className="text-right p-2">{item.amount.toLocaleString('fr-FR')} €</td>
                    <td className="text-right p-2">
                      {Math.round(item.amount / item.count).toLocaleString('fr-FR')} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
