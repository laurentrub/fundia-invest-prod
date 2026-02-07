import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Banknote, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LoanConfig {
  minAmount: number;
  maxAmount: number;
  minDuration: number;
  maxDuration: number;
  defaultRate: number;
  minRate: number;
  maxRate: number;
  processingFee: number;
}

const DEFAULT_CONFIG: LoanConfig = {
  minAmount: 1000,
  maxAmount: 75000,
  minDuration: 12,
  maxDuration: 84,
  defaultRate: 4.9,
  minRate: 2.9,
  maxRate: 19.9,
  processingFee: 0,
};

export function LoanSettings() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<LoanConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const saved = localStorage.getItem('admin_loan_settings');
    if (saved) {
      try {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('admin_loan_settings', JSON.stringify(config));
      toast.success(t('admin.settings.saveSuccess'));
    } catch {
      toast.error(t('admin.settings.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key: keyof LoanConfig, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setConfig({ ...config, [key]: num });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5" />
          {t('admin.settings.loans.title')}
        </CardTitle>
        <CardDescription>{t('admin.settings.loans.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          {/* Amounts */}
          <div>
            <h4 className="text-sm font-medium mb-3">{t('admin.settings.loans.amounts')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAmount">{t('admin.settings.loans.minAmount')}</Label>
                <div className="relative">
                  <Input
                    id="minAmount"
                    type="number"
                    value={config.minAmount}
                    onChange={(e) => updateField('minAmount', e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAmount">{t('admin.settings.loans.maxAmount')}</Label>
                <div className="relative">
                  <Input
                    id="maxAmount"
                    type="number"
                    value={config.maxAmount}
                    onChange={(e) => updateField('maxAmount', e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Durations */}
          <div>
            <h4 className="text-sm font-medium mb-3">{t('admin.settings.loans.durations')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minDuration">{t('admin.settings.loans.minDuration')}</Label>
                <div className="relative">
                  <Input
                    id="minDuration"
                    type="number"
                    value={config.minDuration}
                    onChange={(e) => updateField('minDuration', e.target.value)}
                    className="pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {t('admin.settings.loans.months')}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDuration">{t('admin.settings.loans.maxDuration')}</Label>
                <div className="relative">
                  <Input
                    id="maxDuration"
                    type="number"
                    value={config.maxDuration}
                    onChange={(e) => updateField('maxDuration', e.target.value)}
                    className="pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {t('admin.settings.loans.months')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Rates */}
          <div>
            <h4 className="text-sm font-medium mb-3">{t('admin.settings.loans.rates')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minRate">{t('admin.settings.loans.minRate')}</Label>
                <div className="relative">
                  <Input
                    id="minRate"
                    type="number"
                    step="0.1"
                    value={config.minRate}
                    onChange={(e) => updateField('minRate', e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultRate">{t('admin.settings.loans.defaultRate')}</Label>
                <div className="relative">
                  <Input
                    id="defaultRate"
                    type="number"
                    step="0.1"
                    value={config.defaultRate}
                    onChange={(e) => updateField('defaultRate', e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxRate">{t('admin.settings.loans.maxRate')}</Label>
                <div className="relative">
                  <Input
                    id="maxRate"
                    type="number"
                    step="0.1"
                    value={config.maxRate}
                    onChange={(e) => updateField('maxRate', e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Fees */}
          <div>
            <h4 className="text-sm font-medium mb-3">{t('admin.settings.loans.fees')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="processingFee">{t('admin.settings.loans.processingFee')}</Label>
                <div className="relative">
                  <Input
                    id="processingFee"
                    type="number"
                    step="0.1"
                    value={config.processingFee}
                    onChange={(e) => updateField('processingFee', e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>
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
