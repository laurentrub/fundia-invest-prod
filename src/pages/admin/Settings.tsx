import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.settings.title')}</h1>
        <p className="text-muted-foreground">{t('admin.settings.subtitle')}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <SettingsIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('admin.settings.comingSoon')}</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {t('admin.settings.comingSoonDesc')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
