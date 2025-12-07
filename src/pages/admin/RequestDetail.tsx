import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { StatusHistory } from '@/components/admin/StatusHistory';
import { RequestNotes } from '@/components/admin/RequestNotes';
import { QuickActions } from '@/components/admin/QuickActions';
import { StatusChangeModal } from '@/components/admin/StatusChangeModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Euro,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LoanRequest {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  loan_type: string;
  amount: number;
  duration: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface StatusHistoryItem {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_at: string;
  comment: string | null;
  changed_by_name?: string;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_name?: string;
}

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  in_progress: Loader2,
  approved: CheckCircle,
  refused: XCircle,
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  refused: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState<LoanRequest | null>(null);
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRequest();
      fetchHistory();
      fetchNotes();
    }
  }, [id]);

  const fetchRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('loan_requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        navigate('/admin/requests');
        return;
      }
      setRequest(data);
    } catch (error: any) {
      toast.error(t('admin.messages.loadError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data, error } = await (supabase
        .from('request_status_history' as any)
        .select('*')
        .eq('loan_request_id', id)
        .order('changed_at', { ascending: false }) as any);

      if (error) throw error;

      const historyWithNames = await Promise.all(
        ((data || []) as any[]).map(async (item: any) => {
          if (item.changed_by) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', item.changed_by)
              .maybeSingle();
            return {
              ...item,
              changed_by_name: profile ? `${profile.first_name} ${profile.last_name}` : undefined,
            };
          }
          return item;
        })
      );

      setHistory(historyWithNames);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchNotes = async () => {
    try {
      const { data, error } = await (supabase
        .from('request_notes' as any)
        .select('*')
        .eq('loan_request_id', id)
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;

      const notesWithNames = await Promise.all(
        ((data || []) as any[]).map(async (note: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', note.author_id)
            .maybeSingle();
          return {
            ...note,
            author_name: profile ? `${profile.first_name} ${profile.last_name}` : undefined,
          };
        })
      );

      setNotes(notesWithNames);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (newStatus: string, comment: string, sendEmail: boolean) => {
    if (!request || !user) return;

    try {
      // Update loan request status
      const { error: updateError } = await supabase
        .from('loan_requests')
        .update({ status: newStatus })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // Add to history
      const { error: historyError } = await (supabase
        .from('request_status_history' as any)
        .insert({
          loan_request_id: request.id,
          old_status: request.status,
          new_status: newStatus,
          changed_by: user.id,
          comment: comment || null,
        }) as any);

      if (historyError) throw historyError;

      // Send email notification if requested
      if (sendEmail) {
        try {
          await supabase.functions.invoke('send-status-notification', {
            body: {
              requestId: request.id,
              newStatus,
              email: request.email,
              firstName: request.first_name,
            },
          });
        } catch (emailError) {
          console.error('Email error:', emailError);
        }
      }

      toast.success(t('admin.messages.statusUpdated'));
      fetchRequest();
      fetchHistory();
    } catch (error: any) {
      toast.error(t('admin.messages.updateError'));
      console.error(error);
    }
  };

  const handleAddNote = async (content: string) => {
    if (!user || !id) return;

    try {
      const { error } = await (supabase.from('request_notes' as any).insert({
        loan_request_id: id,
        author_id: user.id,
        content,
      }) as any);

      if (error) throw error;
      toast.success(t('admin.messages.noteAdded'));
      fetchNotes();
    } catch (error: any) {
      toast.error(t('admin.messages.noteError'));
      console.error(error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await (supabase.from('request_notes' as any).delete().eq('id', noteId) as any);

      if (error) throw error;
      toast.success(t('admin.messages.noteDeleted'));
      fetchNotes();
    } catch (error: any) {
      toast.error(t('admin.messages.noteError'));
      console.error(error);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const StatusIcon = statusIcons[request.status] || Clock;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/requests">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {request.first_name} {request.last_name}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.request.id')}: {request.id.slice(0, 8)}...
          </p>
        </div>
        <Badge variant="outline" className={cn('gap-1 px-3 py-1', statusColors[request.status])}>
          <StatusIcon className="h-4 w-4" />
          {t(`admin.status.${request.status}`)}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('admin.request.clientInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('admin.request.name')}</p>
                    <p className="font-medium">
                      {request.first_name} {request.last_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('admin.request.email')}</p>
                    <p className="font-medium">{request.email}</p>
                  </div>
                </div>
                {request.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('admin.request.phone')}</p>
                      <p className="font-medium">{request.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Request details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('admin.request.requestDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('admin.request.type')}</p>
                    <p className="font-medium">{getLoanTypeLabel(request.loan_type)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('admin.request.amount')}</p>
                    <p className="font-medium">{request.amount.toLocaleString('fr-FR')} €</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('admin.request.duration')}</p>
                    <p className="font-medium">{request.duration} {t('common.months')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('admin.request.date')}</p>
                    <p className="font-medium">
                      {new Date(request.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for history and notes */}
          <Card>
            <Tabs defaultValue="history">
              <CardHeader className="pb-0">
                <TabsList>
                  <TabsTrigger value="history">{t('admin.request.historyTab')}</TabsTrigger>
                  <TabsTrigger value="notes">{t('admin.request.notesTab')}</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-4">
                <TabsContent value="history" className="mt-0">
                  <StatusHistory history={history} />
                </TabsContent>
                <TabsContent value="notes" className="mt-0">
                  <RequestNotes
                    notes={notes}
                    onAddNote={handleAddNote}
                    onDeleteNote={handleDeleteNote}
                  />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickActions
            status={request.status}
            onChangeStatus={() => setStatusModalOpen(true)}
            onSendEmail={() => {
              toast.info(t('admin.messages.emailFeature'));
            }}
            onRequestDocuments={() => {
              toast.info(t('admin.messages.requestDocumentsFeature'));
            }}
            onGenerateContract={() => {
              toast.info(t('admin.messages.generateContractFeature'));
            }}
          />
        </div>
      </div>

      {/* Status change modal */}
      <StatusChangeModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        currentStatus={request.status}
        onSubmit={handleStatusChange}
      />
    </div>
  );
}
