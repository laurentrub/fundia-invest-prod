import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FileText,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Download,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Contract {
  id: string;
  loan_request_id: string;
  status: string;
  created_at: string;
  signed_at: string | null;
  verified_at: string | null;
  signed_document_path: string | null;
  rejection_reason: string | null;
  loan_request?: {
    loan_type: string;
    amount: number;
    duration: number;
  };
}

const statusConfig: Record<string, { icon: typeof Clock; color: string; labelKey: string }> = {
  pending_signature: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    labelKey: 'profile.contracts.status.pendingSignature',
  },
  signed: {
    icon: CheckCircle,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    labelKey: 'profile.contracts.status.signed',
  },
  verified: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    labelKey: 'profile.contracts.status.verified',
  },
  rejected: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    labelKey: 'profile.contracts.status.rejected',
  },
};

export function UserContracts() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchContracts();
    }
  }, [user]);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          loan_request:loan_requests(loan_type, amount, duration)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (contractId: string, file: File) => {
    if (!user) return;

    if (file.type !== 'application/pdf') {
      toast.error(t('profile.contracts.pdfOnly'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('profile.contracts.fileTooLarge'));
      return;
    }

    setUploading(contractId);

    try {
      const fileName = `${user.id}/${contractId}/signed-contract-${Date.now()}.pdf`;
      
      const { error: uploadError } = await supabase.storage
        .from('signed-contracts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('contracts')
        .update({
          signed_document_path: fileName,
          signed_at: new Date().toISOString(),
          status: 'signed',
        })
        .eq('id', contractId);

      if (updateError) throw updateError;

      toast.success(t('profile.contracts.uploadSuccess'));
      fetchContracts();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(t('profile.contracts.uploadError'));
    } finally {
      setUploading(null);
    }
  };

  const handleDownloadSigned = async (path: string) => {
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
      toast.error(t('profile.contracts.downloadError'));
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
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('profile.contracts.noContracts')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {contracts.map((contract) => {
        const config = statusConfig[contract.status] || statusConfig.pending_signature;
        const StatusIcon = config.icon;
        const loanRequest = contract.loan_request;

        return (
          <Card key={contract.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {loanRequest ? getLoanTypeLabel(loanRequest.loan_type) : t('profile.contracts.contract')}
                </CardTitle>
                <Badge className={cn('gap-1', config.color)}>
                  <StatusIcon className="h-3 w-3" />
                  {t(config.labelKey)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loanRequest && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('profile.contracts.amount')}:</span>
                    <span className="ml-2 font-medium">{loanRequest.amount.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('profile.contracts.duration')}:</span>
                    <span className="ml-2 font-medium">{loanRequest.duration} {t('common.months')}</span>
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                {t('profile.contracts.receivedOn')}: {new Date(contract.created_at).toLocaleDateString('fr-FR')}
              </div>

              {contract.status === 'rejected' && contract.rejection_reason && (
                <div className="p-3 bg-destructive/10 rounded-md text-sm text-destructive">
                  <strong>{t('profile.contracts.rejectionReason')}:</strong> {contract.rejection_reason}
                </div>
              )}

              {contract.status === 'pending_signature' && (
                <div className="space-y-2">
                  <Label htmlFor={`upload-${contract.id}`} className="text-sm font-medium">
                    {t('profile.contracts.uploadSigned')}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={`upload-${contract.id}`}
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(contract.id, file);
                      }}
                      disabled={uploading === contract.id}
                      className="flex-1"
                    />
                    {uploading === contract.id && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary self-center" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('profile.contracts.uploadHint')}
                  </p>
                </div>
              )}

              {contract.signed_document_path && (
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadSigned(contract.signed_document_path!)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t('profile.contracts.downloadSigned')}
                  </Button>
                  {contract.signed_at && (
                    <span className="text-sm text-muted-foreground">
                      {t('profile.contracts.signedOn')}: {new Date(contract.signed_at).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              )}

              {contract.status === 'verified' && contract.verified_at && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  {t('profile.contracts.verifiedOn')}: {new Date(contract.verified_at).toLocaleDateString('fr-FR')}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
