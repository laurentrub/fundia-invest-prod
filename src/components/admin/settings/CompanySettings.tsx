import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CompanyData {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  description: string;
}

const DEFAULT_COMPANY: CompanyData = {
  name: 'Fundia Invest',
  email: 'contact@fundia-invest.com',
  phone: '+33 1 23 45 67 89',
  address: '12 Rue de la Finance, 75008 Paris, France',
  website: 'https://fundia-invest.com',
  description: '',
};

export function CompanySettings() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CompanyData>(DEFAULT_COMPANY);

  useEffect(() => {
    const saved = localStorage.getItem('admin_company_settings');
    if (saved) {
      try {
        setData({ ...DEFAULT_COMPANY, ...JSON.parse(saved) });
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('admin_company_settings', JSON.stringify(data));
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
          <Building2 className="h-5 w-5" />
          {t('admin.settings.company.title')}
        </CardTitle>
        <CardDescription>{t('admin.settings.company.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">{t('admin.settings.company.name')}</Label>
              <Input
                id="companyName"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyEmail">{t('admin.settings.company.email')}</Label>
              <Input
                id="companyEmail"
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyPhone">{t('admin.settings.company.phone')}</Label>
              <Input
                id="companyPhone"
                type="tel"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyWebsite">{t('admin.settings.company.website')}</Label>
              <Input
                id="companyWebsite"
                type="url"
                value={data.website}
                onChange={(e) => setData({ ...data, website: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyAddress">{t('admin.settings.company.address')}</Label>
            <Input
              id="companyAddress"
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyDescription">{t('admin.settings.company.descriptionField')}</Label>
            <Textarea
              id="companyDescription"
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              placeholder={t('admin.settings.company.descriptionPlaceholder')}
              rows={3}
            />
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
