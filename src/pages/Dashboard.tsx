import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  Calendar,
  Euro
} from 'lucide-react';

interface LoanRequest {
  id: string;
  loan_type: string;
  amount: number;
  duration: number;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export default function Dashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user, isAdmin]);

  const fetchRequests = async () => {
    try {
      let query = supabase
        .from('loan_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isAdmin) {
        query = query.eq('user_id', user!.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des demandes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('loan_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success('Statut mis à jour');
      
      // Envoyer la notification par email
      try {
        const { error: emailError } = await supabase.functions.invoke('send-status-notification', {
          body: { loanRequestId: id, newStatus },
        });
        
        if (emailError) {
          console.error('Erreur lors de l\'envoi de l\'email:', emailError);
        } else {
          toast.success('Notification envoyée par email');
        }
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      }
      
      fetchRequests();
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      approved: { label: 'Approuvé', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Rejeté', variant: 'destructive' as const, icon: XCircle },
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
      personal: 'Prêt personnel',
      auto: 'Prêt auto',
      home_improvement: 'Travaux',
      business: 'Professionnel',
      consolidation: 'Rachat de crédits',
      project: 'Financement de projet',
    };
    return types[type] || type;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Chargement...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {isAdmin ? 'Gestion des demandes' : 'Mes demandes de crédit'}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin 
                ? 'Visualisez et gérez toutes les demandes de crédit'
                : 'Suivez l\'état de vos demandes de crédit'}
            </p>
          </div>

          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Aucune demande de crédit pour le moment
                </p>
                {!isAdmin && (
                  <Button onClick={() => navigate('/apply')}>
                    Faire une demande
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getLoanTypeLabel(request.loan_type)}
                          {getStatusBadge(request.status)}
                        </CardTitle>
                        <CardDescription>
                          {request.first_name} {request.last_name}
                        </CardDescription>
                      </div>
                      {isAdmin && request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateStatus(request.id, 'approved')}
                          >
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(request.id, 'rejected')}
                          >
                            Rejeter
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Montant</p>
                          <p className="font-medium">{request.amount.toLocaleString('fr-FR')} €</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Durée</p>
                          <p className="font-medium">{request.duration} mois</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {new Date(request.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contact</p>
                        <p className="font-medium text-sm">{request.email}</p>
                        {request.phone && (
                          <p className="text-sm">{request.phone}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
