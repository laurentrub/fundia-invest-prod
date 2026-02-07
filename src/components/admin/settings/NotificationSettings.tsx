import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Save, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface NotificationPrefs {
  emailOnNewRequest: boolean;
  emailOnStatusChange: boolean;
  emailOnDocumentSubmit: boolean;
  emailOnContractSigned: boolean;
  emailOnNewMessage: boolean;
  autoConfirmEmails: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  emailOnNewRequest: true,
  emailOnStatusChange: true,
  emailOnDocumentSubmit: true,
  emailOnContractSigned: true,
  emailOnNewMessage: false,
  autoConfirmEmails: false,
};

export function NotificationSettings() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    const saved = localStorage.getItem('admin_notification_settings');
    if (saved) {
      try {
        setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(saved) });
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('admin_notification_settings', JSON.stringify(prefs));
      toast.success(t('admin.settings.saveSuccess'));
    } catch {
      toast.error(t('admin.settings.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const toggleItems: { key: keyof NotificationPrefs; separator?: boolean }[] = [
    { key: 'emailOnNewRequest' },
    { key: 'emailOnStatusChange' },
    { key: 'emailOnDocumentSubmit' },
    { key: 'emailOnContractSigned' },
    { key: 'emailOnNewMessage', separator: true },
    { key: 'autoConfirmEmails' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t('admin.settings.notifications.title')}
        </CardTitle>
        <CardDescription>{t('admin.settings.notifications.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {toggleItems.map((item, idx) => (
          <div key={item.key}>
            {item.separator && <Separator className="my-4" />}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={item.key} className="text-sm font-medium">
                  {t(`admin.settings.notifications.${item.key}`)}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t(`admin.settings.notifications.${item.key}Desc`)}
                </p>
              </div>
              <Switch
                id={item.key}
                checked={prefs[item.key]}
                onCheckedChange={(checked) => setPrefs({ ...prefs, [item.key]: checked })}
              />
            </div>
          </div>
        ))}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t('admin.settings.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
