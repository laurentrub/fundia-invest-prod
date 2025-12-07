import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  Loader2,
  Search,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface Contract {
  id: string;
  loan_request_id: string;
  user_id: string;
  status: string;
  created_at: string;
  signed_at: string | null;
  verified_at: string | null;
  signed_document_path: string | null;
  rejection_reason: string | null;
  loan_request?: {
    first_name: string;
    last_name: string;
    email: string;
    loan_type: string;
    amount: number;
  };
}

const statusConfig: Record<string, { icon: typeof Clock; color: string }> = {
  pending_signature: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  signed: {
    icon: CheckCircle,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  verified: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  rejected: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
};

export default function Documents() {
  const { t } = useTranslation();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'verify' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          loan_request:loan_requests(first_name, last_name, email, loan_type, amount)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error(t('admin.documents.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('signed-contracts')
        .download(path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'contrat-signe.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error(t('admin.documents.downloadError'));
    }
  };

  const handleViewDocument = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('signed-contracts')
        .createSignedUrl(path, 3600);

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('View error:', error);
      toast.error(t('admin.documents.viewError'));
    }
  };

  const openActionModal = (contract: Contract, action: 'verify' | 'reject') => {
    setSelectedContract(contract);
    setActionType(action);
    setRejectionReason('');
    setActionModalOpen(true);
  };

  const handleAction = async () => {
    if (!selectedContract || !actionType) return;

    setProcessing(true);
    try {
      const updateData: any = {};

      if (actionType === 'verify') {
        updateData.status = 'verified';
        updateData.verified_at = new Date().toISOString();
      } else {
        updateData.status = 'rejected';
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('contracts')
        .update(updateData)
        .eq('id', selectedContract.id);

      if (error) throw error;

      // Send email notification to client
      if (selectedContract.loan_request) {
        try {
          await supabase.functions.invoke('send-contract-notification', {
            body: {
              contractId: selectedContract.id,
              clientEmail: selectedContract.loan_request.email,
              clientName: `${selectedContract.loan_request.first_name} ${selectedContract.loan_request.last_name}`,
              action: actionType === 'verify' ? 'verified' : 'rejected',
              rejectionReason: actionType === 'reject' ? rejectionReason : undefined,
              loanType: selectedContract.loan_request.loan_type,
              amount: selectedContract.loan_request.amount,
            },
          });
        } catch (emailError) {
          console.error('Email notification error:', emailError);
          // Don't fail the whole operation if email fails
        }
      }

      toast.success(
        actionType === 'verify'
          ? t('admin.documents.verifySuccess')
          : t('admin.documents.rejectSuccess')
      );

      setActionModalOpen(false);
      fetchContracts();
    } catch (error) {
      console.error('Action error:', error);
      toast.error(t('admin.documents.actionError'));
    } finally {
      setProcessing(false);
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

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      !searchQuery ||
      contract.loan_request?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.loan_request?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.loan_request?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const signedContracts = filteredContracts.filter((c) => c.status === 'signed');
  const pendingCount = contracts.filter((c) => c.status === 'pending_signature').length;
  const signedCount = contracts.filter((c) => c.status === 'signed').length;
  const verifiedCount = contracts.filter((c) => c.status === 'verified').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.documents.title')}</h1>
        <p className="text-muted-foreground">{t('admin.documents.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.documents.pendingSignature')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.documents.awaitingValidation')}</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{signedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.documents.verified')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('admin.documents.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('admin.documents.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t('admin.documents.filterStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.documents.allStatuses')}</SelectItem>
                <SelectItem value="pending_signature">{t('admin.documents.statusPending')}</SelectItem>
                <SelectItem value="signed">{t('admin.documents.statusSigned')}</SelectItem>
                <SelectItem value="verified">{t('admin.documents.statusVerified')}</SelectItem>
                <SelectItem value="rejected">{t('admin.documents.statusRejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts awaiting validation */}
      {signedContracts.length > 0 && statusFilter !== 'pending_signature' && statusFilter !== 'verified' && statusFilter !== 'rejected' && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <FileText className="h-5 w-5" />
              {t('admin.documents.contractsToValidate')} ({signedContracts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.documents.client')}</TableHead>
                  <TableHead>{t('admin.documents.loanType')}</TableHead>
                  <TableHead>{t('admin.documents.amount')}</TableHead>
                  <TableHead>{t('admin.documents.signedDate')}</TableHead>
                  <TableHead className="text-right">{t('admin.documents.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signedContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {contract.loan_request?.first_name} {contract.loan_request?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {contract.loan_request?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {contract.loan_request && getLoanTypeLabel(contract.loan_request.loan_type)}
                    </TableCell>
                    <TableCell>
                      {contract.loan_request?.amount.toLocaleString('fr-FR')} €
                    </TableCell>
                    <TableCell>
                      {contract.signed_at &&
                        new Date(contract.signed_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {contract.signed_document_path && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDocument(contract.signed_document_path!)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadDocument(contract.signed_document_path!)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => openActionModal(contract, 'verify')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t('admin.documents.validate')}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openActionModal(contract, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {t('admin.documents.reject')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All contracts */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.documents.allContracts')}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredContracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('admin.documents.noContracts')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.documents.client')}</TableHead>
                  <TableHead>{t('admin.documents.loanType')}</TableHead>
                  <TableHead>{t('admin.documents.amount')}</TableHead>
                  <TableHead>{t('admin.documents.status')}</TableHead>
                  <TableHead>{t('admin.documents.date')}</TableHead>
                  <TableHead className="text-right">{t('admin.documents.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => {
                  const config = statusConfig[contract.status] || statusConfig.pending_signature;
                  const StatusIcon = config.icon;

                  return (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {contract.loan_request?.first_name} {contract.loan_request?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {contract.loan_request?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {contract.loan_request && getLoanTypeLabel(contract.loan_request.loan_type)}
                      </TableCell>
                      <TableCell>
                        {contract.loan_request?.amount.toLocaleString('fr-FR')} €
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('gap-1', config.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {t(`admin.documents.status${contract.status.charAt(0).toUpperCase() + contract.status.slice(1).replace('_', '')}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(contract.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {contract.signed_document_path && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDocument(contract.signed_document_path!)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadDocument(contract.signed_document_path!)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {contract.status === 'signed' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActionModal(contract, 'verify')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActionModal(contract, 'reject')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action modal */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'verify'
                ? t('admin.documents.confirmValidation')
                : t('admin.documents.confirmRejection')}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'verify'
                ? t('admin.documents.confirmValidationDesc')
                : t('admin.documents.confirmRejectionDesc')}
            </DialogDescription>
          </DialogHeader>

          {actionType === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">{t('admin.documents.rejectionReason')}</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t('admin.documents.rejectionReasonPlaceholder')}
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModalOpen(false)} disabled={processing}>
              {t('common.cancel')}
            </Button>
            <Button
              variant={actionType === 'verify' ? 'default' : 'destructive'}
              onClick={handleAction}
              disabled={processing || (actionType === 'reject' && !rejectionReason)}
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionType === 'verify' ? t('admin.documents.validate') : t('admin.documents.reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
