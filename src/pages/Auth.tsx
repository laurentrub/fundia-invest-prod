import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function Auth() {
  const { t } = useTranslation();
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const redirectTo = searchParams.get('redirect');
  const isFromApplication = redirectTo === '/apply';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Redirect to the original destination or home
      navigate(redirectTo || '/');
    }
  }, [user, navigate, redirectTo]);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const [resetEmail, setResetEmail] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(loginData.email, loginData.password, redirectTo || undefined);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('auth.loginSuccess'));
    }

    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(
      signupData.email,
      signupData.password,
      signupData.firstName,
      signupData.lastName,
      redirectTo || undefined
    );

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('auth.signupSuccess'));
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await resetPassword(resetEmail);

    if (error) {
      toast.error(error.message);
    } else {
      setResetEmailSent(true);
      toast.success(t('auth.resetEmailSent'));
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>
              {isFromApplication ? t('auth.fromApplicationTitle') : t('auth.welcome')}
            </CardTitle>
            <CardDescription>
              {isFromApplication ? t('auth.fromApplicationDescription') : t('auth.description')}
            </CardDescription>
            {isFromApplication && (
              <Alert className="mt-4 bg-accent/10 border-accent">
                <FileText className="h-4 w-4 text-accent" />
                <AlertDescription className="text-sm">
                  {t('auth.fromApplicationDescription')}
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent>
            {!showResetPassword ? (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
                  <TabsTrigger value="signup">{t('auth.signup')}</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t('auth.email')}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        required
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t('auth.password')}</Label>
                      <Input
                        id="login-password"
                        type="password"
                        required
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({ ...loginData, password: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(true)}
                        className="text-sm text-primary hover:underline"
                      >
                        {t('auth.forgotPassword')}
                      </button>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? t('auth.loggingIn') : t('auth.loginButton')}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-firstname">{t('auth.firstName')}</Label>
                        <Input
                          id="signup-firstname"
                          type="text"
                          required
                          value={signupData.firstName}
                          onChange={(e) =>
                            setSignupData({ ...signupData, firstName: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-lastname">{t('auth.lastName')}</Label>
                        <Input
                          id="signup-lastname"
                          type="text"
                          required
                          value={signupData.lastName}
                          onChange={(e) =>
                            setSignupData({ ...signupData, lastName: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t('auth.email')}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        required
                        value={signupData.email}
                        onChange={(e) =>
                          setSignupData({ ...signupData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t('auth.password')}</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        required
                        minLength={6}
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData({ ...signupData, password: e.target.value })
                        }
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? t('auth.creatingAccount') : t('auth.signupButton')}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t('auth.resetPassword')}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetEmailSent(false);
                      setResetEmail('');
                    }}
                  >
                    {t('auth.back')}
                  </Button>
                </div>
                {!resetEmailSent ? (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">{t('auth.email')}</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder={t('auth.resetEmailPlaceholder')}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? t('auth.sending') : t('auth.sendResetLink')}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {t('auth.resetEmailSentTo', { email: resetEmail })}
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setResetEmailSent(false);
                        setResetEmail('');
                      }}
                    >
                      {t('auth.resendEmail')}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
