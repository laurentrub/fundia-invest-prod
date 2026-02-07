import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Monitor, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DisplayPrefs {
  language: string;
  itemsPerPage: string;
  dateFormat: string;
  currency: string;
}

const DEFAULT_DISPLAY: DisplayPrefs = {
  language: 'fr',
  itemsPerPage: '10',
  dateFormat: 'dd/MM/yyyy',
  currency: 'EUR',
};

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'pt', label: 'Português' },
  { value: 'hr', label: 'Hrvatski' },
];

const ITEMS_PER_PAGE = ['5', '10', '20', '50'];

const DATE_FORMATS = [
  { value: 'dd/MM/yyyy', label: '31/12/2025' },
  { value: 'MM/dd/yyyy', label: '12/31/2025' },
  { value: 'yyyy-MM-dd', label: '2025-12-31' },
];

const CURRENCIES = [
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'USD', label: 'Dollar ($)' },
  { value: 'GBP', label: 'Livre (£)' },
  { value: 'CHF', label: 'Franc suisse (CHF)' },
];

export function DisplaySettings() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState<DisplayPrefs>(DEFAULT_DISPLAY);

  useEffect(() => {
    const saved = localStorage.getItem('admin_display_settings');
    if (saved) {
      try {
        setPrefs({ ...DEFAULT_DISPLAY, ...JSON.parse(saved) });
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('admin_display_settings', JSON.stringify(prefs));
      // Apply language change
      if (prefs.language !== i18n.language) {
        await i18n.changeLanguage(prefs.language);
      }
      toast.success(t('admin.settings.saveSuccess'));
    } catch {
      toast.error(t('admin.settings.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          {t('admin.settings.display.title')}
        </CardTitle>
        <CardDescription>{t('admin.settings.display.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('admin.settings.display.language')}</Label>
              <Select value={prefs.language} onValueChange={(v) => setPrefs({ ...prefs, language: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.settings.display.itemsPerPage')}</Label>
              <Select value={prefs.itemsPerPage} onValueChange={(v) => setPrefs({ ...prefs, itemsPerPage: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n} {t('admin.settings.display.items')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.settings.display.dateFormat')}</Label>
              <Select value={prefs.dateFormat} onValueChange={(v) => setPrefs({ ...prefs, dateFormat: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('admin.settings.display.currency')}</Label>
              <Select value={prefs.currency} onValueChange={(v) => setPrefs({ ...prefs, currency: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t('admin.settings.save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
