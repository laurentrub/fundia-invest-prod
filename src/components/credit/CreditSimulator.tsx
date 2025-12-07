import { useState, useEffect } from "react";
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

const CreditSimulator = ({
  minAmount = 1000,
  maxAmount = 75000,
  minDuration = 12,
  maxDuration = 84,
  defaultAmount = 10000,
  defaultDuration = 48,
  interestRate = 4.9,
}: CreditSimulatorProps) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(defaultAmount);
  const [duration, setDuration] = useState(defaultDuration);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    calculateLoan();
  }, [amount, duration]);

  const calculateLoan = () => {
    const monthlyRate = interestRate / 100 / 12;
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
            <span className="text-lg font-semibold text-foreground">{interestRate}%</span>
          </div>
        </div>

        <Button variant="accent" size="lg" className="w-full mt-6">
          {t('simulator.getApproval')}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          {t('simulator.disclaimer')}
        </p>
      </div>
    </Card>
  );
};

export default CreditSimulator;
