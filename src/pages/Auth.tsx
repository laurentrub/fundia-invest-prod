import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Auth() {
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

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

    const { error } = await signIn(loginData.email, loginData.password);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Connexion réussie !');
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
      signupData.lastName
    );

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Compte créé avec succès !');
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
      toast.success('Email de réinitialisation envoyé !');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Bienvenue</CardTitle>
            <CardDescription>
              Connectez-vous ou créez un compte pour gérer vos demandes de crédit
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showResetPassword ? (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Connexion</TabsTrigger>
                  <TabsTrigger value="signup">Inscription</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
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
                      <Label htmlFor="login-password">Mot de passe</Label>
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
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Connexion...' : 'Se connecter'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-firstname">Prénom</Label>
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
                        <Label htmlFor="signup-lastname">Nom</Label>
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
                      <Label htmlFor="signup-email">Email</Label>
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
                      <Label htmlFor="signup-password">Mot de passe</Label>
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
                      {loading ? 'Création...' : "S'inscrire"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Réinitialiser le mot de passe</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetEmailSent(false);
                      setResetEmail('');
                    }}
                  >
                    Retour
                  </Button>
                </div>
                {!resetEmailSent ? (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Entrez votre adresse email"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Un email de réinitialisation a été envoyé à <strong>{resetEmail}</strong>.
                      Veuillez vérifier votre boîte de réception et cliquer sur le lien pour réinitialiser votre mot de passe.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setResetEmailSent(false);
                        setResetEmail('');
                      }}
                    >
                      Renvoyer un email
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
