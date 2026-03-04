import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, RefreshCw, Download, FileText, FileSignature, Trash2 } from 'lucide-react';

interface QuickActionsProps {
  onChangeStatus: () => void;
  onSendEmail: () => void;
  onDownloadPdf?: () => void;
  onRequestDocuments?: () => void;
  onGenerateContract?: () => void;
  onDeleteRequest?: () => void;
  status: string;
}

export function QuickActions({
  onChangeStatus,
  onSendEmail,
  onDownloadPdf,
  onRequestDocuments,
  onGenerateContract,
  onDeleteRequest,
}: QuickActionsProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('admin.quickActions.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onChangeStatus}
        >
          <RefreshCw className="h-4 w-4" />
          {t('admin.quickActions.changeStatus')}
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onSendEmail}
        >
          <Mail className="h-4 w-4" />
          {t('admin.quickActions.sendEmail')}
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onRequestDocuments}
        >
          <FileText className="h-4 w-4" />
          {t('admin.quickActions.requestDocuments')}
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onGenerateContract}
        >
          <FileSignature className="h-4 w-4" />
          {t('admin.quickActions.generateContract')}
        </Button>

        {onDownloadPdf && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={onDownloadPdf}
          >
            <Download className="h-4 w-4" />
            {t('admin.quickActions.downloadPdf')}
          </Button>
        )}

        {onDeleteRequest && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 dark:text-red-400 dark:hover:bg-red-950/30 dark:border-red-900 mt-4"
            onClick={onDeleteRequest}
          >
            <Trash2 className="h-4 w-4" />
            {t('admin.quickActions.deleteRequest')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
