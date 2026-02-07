import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Bell, Banknote, Monitor } from 'lucide-react';
import { CompanySettings } from '@/components/admin/settings/CompanySettings';
import { NotificationSettings } from '@/components/admin/settings/NotificationSettings';
import { LoanSettings } from '@/components/admin/settings/LoanSettings';
import { DisplaySettings } from '@/components/admin/settings/DisplaySettings';

export default function Settings() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.settings.title')}</h1>
        <p className="text-muted-foreground">{t('admin.settings.subtitle')}</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4 hidden sm:inline" />
            {t('admin.settings.tabs.company')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4 hidden sm:inline" />
            {t('admin.settings.tabs.notifications')}
          </TabsTrigger>
          <TabsTrigger value="loans" className="gap-2">
            <Banknote className="h-4 w-4 hidden sm:inline" />
            {t('admin.settings.tabs.loans')}
          </TabsTrigger>
          <TabsTrigger value="display" className="gap-2">
            <Monitor className="h-4 w-4 hidden sm:inline" />
            {t('admin.settings.tabs.display')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <CompanySettings />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
        <TabsContent value="loans">
          <LoanSettings />
        </TabsContent>
        <TabsContent value="display">
          <DisplaySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
