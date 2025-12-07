import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  User, 
  Lock, 
  FileText,
  Clock, 
  CheckCircle, 
  XCircle,
  Euro,
  Calendar
} from 'lucide-react';
import { UserContracts } from '@/components/profile/UserContracts';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { UserDocuments } from '@/components/profile/UserDocuments';
import { RequestedDocuments } from '@/components/profile/RequestedDocuments';

interface LoanRequest {
  id: string;
  loan_type: string;
  amount: number;
  duration: number;
  status: string;
  created_at: string;
}

export default function Profile() {
  const { t } = useTranslation();
  const { user, updatePassword, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [activeSection, setActiveSection] = useState('info');
  
  // Profile form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Password form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchRequests();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
      }
    } catch (error: any) {
      toast.error(t('profile.messages.profileLoadError'));
      console.error(error);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('loan_requests')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast.error(t('profile.messages.requestsLoadError'));
      console.error(error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
        })
        .eq('id', user!.id);

      if (error) throw error;

      toast.success(t('profile.messages.updateSuccess'));
    } catch (error: any) {
      toast.error(t('profile.messages.updateError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t('profile.messages.passwordMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t('profile.messages.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(newPassword);

      if (error) throw error;

      toast.success(t('profile.messages.passwordSuccess'));
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(t('profile.messages.passwordError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: t('dashboard.status.pending'), variant: 'secondary' as const, icon: Clock },
      approved: { label: t('dashboard.status.approved'), variant: 'default' as const, icon: CheckCircle },
      rejected: { label: t('dashboard.status.rejected'), variant: 'destructive' as const, icon: XCircle },
    };

    const { label, variant, icon: Icon } = config[status as keyof typeof config] || config.pending;

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>{t('common.loading')}</p>
        </main>
        <Footer />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'info':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('profile.info.title')}
              </CardTitle>
              <CardDescription>
                {t('profile.info.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('profile.info.firstName')}</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('profile.info.lastName')}</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('profile.info.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    {t('profile.info.emailDisabled')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('profile.info.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? t('profile.info.updating') : t('profile.info.update')}
                </Button>
              </form>
            </CardContent>
          </Card>
        );

      case 'password':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {t('profile.password.title')}
              </CardTitle>
              <CardDescription>
                {t('profile.password.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('profile.password.newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('profile.password.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? t('profile.password.changing') : t('profile.password.change')}
                </Button>
              </form>
            </CardContent>
          </Card>
        );

      case 'requests':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Mes demandes de crédit
            </h2>
            {requests.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    {t('profile.requests.noRequests')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {getLoanTypeLabel(request.loan_type)}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {getStatusBadge(request.status)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">{t('profile.requests.amount')}</p>
                          <p className="font-medium">{request.amount.toLocaleString()} €</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">{t('profile.requests.duration')}</p>
                          <p className="font-medium">{request.duration} {t('common.months')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">{t('profile.requests.date')}</p>
                          <p className="font-medium">
                            {new Date(request.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        );

      case 'contracts':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Mes contrats</h2>
            <UserContracts />
          </div>
        );

      case 'documents':
        return <UserDocuments />;

      case 'requested-docs':
        return <RequestedDocuments />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <ProfileSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          userName={`${firstName} ${lastName}`.trim() || undefined}
          userEmail={email}
        />
        <main className="flex-1 p-8 bg-muted/30">
          <div className="max-w-4xl">
            {renderContent()}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
