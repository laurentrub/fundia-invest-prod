import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CreditSimulatorProps {
  minAmount?: number;
  maxAmount?: number;
  minDuration?: number;
  maxDuration?: number;
  defaultAmount?: number;
  defaultDuration?: number;
  interestRate?: number;
}

const CreditSimulator = (props: CreditSimulatorProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Read admin loan settings from localStorage, fallback to props then defaults
  const adminSettings = (() => {
    try {
      const saved = localStorage.getItem('admin_loan_settings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  })();

  const minAmount = props.minAmount ?? adminSettings.minAmount ?? 1000;
  const maxAmount = props.maxAmount ?? adminSettings.maxAmount ?? 75000;
  const minDuration = props.minDuration ?? adminSettings.minDuration ?? 12;
  const maxDuration = props.maxDuration ?? adminSettings.maxDuration ?? 84;
  const defaultAmount = props.defaultAmount ?? Math.min(10000, maxAmount);
  const defaultDuration = props.defaultDuration ?? Math.min(48, maxDuration);
  const rate = props.interestRate ?? adminSettings.defaultRate ?? 4.9;

  const [amount, setAmount] = useState(defaultAmount);
  const [duration, setDuration] = useState(defaultDuration);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    calculateLoan();
  }, [amount, duration, rate]);

  const calculateLoan = () => {
    const monthlyRate = rate / 100 / 12;
    const payment =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) /
      (Math.pow(1 + monthlyRate, duration) - 1);
    
    setMonthlyPayment(payment);
    setTotalCost(payment * duration);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="p-6 md:p-8 bg-gradient-card shadow-xl border-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-accent rounded-lg">
          <Calculator className="h-6 w-6 text-accent-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{t('simulator.title')}</h2>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <Label className="text-sm font-semibold text-foreground">{t('simulator.amount')}</Label>
            <span className="text-2xl font-bold text-accent">{formatCurrency(amount)}</span>
          </div>
          <Slider
            value={[amount]}
            onValueChange={(value) => setAmount(value[0])}
            min={minAmount}
            max={maxAmount}
            step={500}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{formatCurrency(minAmount)}</span>
            <span>{formatCurrency(maxAmount)}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <Label className="text-sm font-semibold text-foreground">{t('simulator.duration')}</Label>
            <span className="text-2xl font-bold text-accent">{duration} {t('simulator.months')}</span>
          </div>
          <Slider
            value={[duration]}
            onValueChange={(value) => setDuration(value[0])}
            min={minDuration}
            max={maxDuration}
            step={6}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{minDuration} {t('simulator.months')}</span>
            <span>{maxDuration} {t('simulator.months')}</span>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">{t('simulator.monthlyPayment')}</span>
            <span className="text-3xl font-bold text-success">{formatCurrency(monthlyPayment)}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <span className="text-sm font-medium text-muted-foreground">{t('simulator.totalCost')}</span>
            <span className="text-lg font-semibold text-foreground">{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">{t('simulator.interestRate')}</span>
            <span className="text-lg font-semibold text-foreground">{rate}%</span>
          </div>
        </div>

        <Button
          variant="accent"
          size="lg"
          className="w-full mt-6"
          onClick={() => navigate('/apply')}
        >
          {t('simulator.getApproval')}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          {t('simulator.disclaimer')}
        </p>
        <p className="text-xs text-center text-muted-foreground/80 italic mt-1">
          Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.
        </p>
      </div>
    </Card>
  );
};

export default CreditSimulator;
