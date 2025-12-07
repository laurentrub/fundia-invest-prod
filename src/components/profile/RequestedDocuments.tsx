import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Loader2,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DocumentRequest {
  id: string;
  loan_request_id: string;
  document_type: string;
  status: string;
  requested_at: string;
  submitted_at: string | null;
  validated_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  file_path: string | null;
  custom_message: string | null;
  loan_request?: {
    loan_type: string;
    amount: number;
  };
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: {
    label: 'En attente',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  submitted: {
    label: 'Soumis',
    icon: AlertCircle,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  validated: {
    label: 'Validé',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  rejected: {
    label: 'Refusé',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function RequestedDocuments() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('document_requests')
        .select(`
          *,
          loan_request:loan_requests(loan_type, amount)
        `)
        .eq('user_id', user!.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setRequests((data as any[]) || []);
    } catch (error: any) {
      console.error('Error fetching document requests:', error);
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = (request: DocumentRequest) => {
    setSelectedRequest(request);
    setUploadDialogOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedRequest || !user) return;

    const file = files[0];

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Le fichier est trop volumineux (max 10MB)');
      return;
    }

    setUploading(selectedRequest.id);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/requested/${selectedRequest.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Update document request status
      const { error: updateError } = await supabase
        .from('document_requests')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          file_path: filePath,
        })
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      toast.success('Document soumis avec succès');
      setUploadDialogOpen(false);
      fetchRequests();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error("Erreur lors de l'envoi du document");
    } finally {
      setUploading(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleViewDocument = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('user-documents')
        .createSignedUrl(filePath, 3600);

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (error: any) {
      console.error('View error:', error);
      toast.error('Erreur lors de la visualisation');
    }
  };

  const getLoanTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      personal: 'Prêt personnel',
      auto: 'Crédit auto',
      home_improvement: 'Crédit travaux',
      business: 'Prêt entreprise',
      consolidation: 'Rachat de crédit',
      project: 'Financement de projet',
    };
    return types[type] || type;
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const otherRequests = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Documents demandés</h2>
          <p className="text-muted-foreground">Documents requis pour vos demandes de financement</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="p-4 rounded-full bg-muted inline-block mb-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="font-medium text-lg">Aucun document en attente</p>
              <p className="text-muted-foreground mt-1">
                Vous n'avez pas de documents à fournir pour le moment.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pending requests - highlighted */}
          {pendingRequests.length > 0 && (
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <AlertCircle className="h-5 w-5" />
                  Documents à fournir ({pendingRequests.length})
                </CardTitle>
                <CardDescription>
                  Veuillez fournir ces documents pour que nous puissions traiter votre demande
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
                  >
                    <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 shrink-0">
                      <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{request.document_type}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Pour: {request.loan_request ? getLoanTypeLabel(request.loan_request.loan_type) : 'Demande de crédit'}
                        {request.loan_request && ` - ${request.loan_request.amount.toLocaleString()} €`}
                      </p>
                      {request.custom_message && (
                        <p className="text-sm text-muted-foreground mt-1 italic">
                          "{request.custom_message}"
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Demandé le {new Date(request.requested_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleUploadClick(request)}
                      disabled={uploading === request.id}
                      className="gap-2"
                    >
                      {uploading === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Envoyer
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Other requests */}
          {otherRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historique des demandes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {otherRequests.map((request) => {
                  const config = statusConfig[request.status] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  
                  return (
                    <div
                      key={request.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30"
                    >
                      <div className="p-3 rounded-lg bg-muted shrink-0">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{request.document_type}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {request.loan_request ? getLoanTypeLabel(request.loan_request.loan_type) : 'Demande de crédit'}
                        </p>
                        {request.status === 'rejected' && request.rejection_reason && (
                          <p className="text-sm text-destructive mt-1">
                            Raison: {request.rejection_reason}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {request.file_path && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDocument(request.file_path!)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Badge className={cn('gap-1', config.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un document</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>Envoyez le document demandé: <strong>{selectedRequest.document_type}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <input
              ref={fileInputRef}
              type="file"
              className="w-full"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              disabled={uploading !== null}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Formats acceptés: PDF, Word, images (max 10MB)
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
