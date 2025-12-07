import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FolderOpen,
  Download,
  Eye,
  Loader2,
  Search,
  Filter,
  File,
  FileText,
  Image,
  FileSpreadsheet,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DocumentValidationModal } from '@/components/admin/DocumentValidationModal';

interface UserDocument {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: string;
  created_at: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

interface DocumentRequest {
  id: string;
  loan_request_id: string;
  user_id: string;
  document_type: string;
  status: string;
  requested_at: string;
  submitted_at: string | null;
  validated_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  file_path: string | null;
  custom_message: string | null;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  loan_request?: {
    loan_type: string;
    amount: number;
  };
}

const documentCategories = [
  { value: 'all', label: 'Toutes les catégories' },
  { value: 'identity', label: "Pièce d'identité" },
  { value: 'income', label: 'Justificatif de revenus' },
  { value: 'address', label: 'Justificatif de domicile' },
  { value: 'bank', label: 'Relevé bancaire' },
  { value: 'tax', label: 'Document fiscal' },
  { value: 'other', label: 'Autre' },
];

const requestStatusOptions = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'submitted', label: 'Soumis' },
  { value: 'validated', label: 'Validé' },
  { value: 'rejected', label: 'Refusé' },
];

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

export default function ClientDocuments() {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('requests');
  
  // Validation modal state
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);
  const [validationAction, setValidationAction] = useState<'validate' | 'reject'>('validate');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchDocuments(), fetchDocumentRequests()]);
    setLoading(false);
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select(`
          *,
          profile:profiles(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Erreur lors du chargement des documents');
    }
  };

  const fetchDocumentRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('document_requests')
        .select(`
          *,
          profile:profiles!document_requests_user_id_fkey(first_name, last_name, email),
          loan_request:loan_requests(loan_type, amount)
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setDocumentRequests((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching document requests:', error);
      toast.error('Erreur lors du chargement des demandes de documents');
    }
  };

  const handleDownload = async (doc: UserDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('user-documents')
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleView = async (doc: UserDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('user-documents')
        .createSignedUrl(doc.file_path, 3600);

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('View error:', error);
      toast.error('Erreur lors de la visualisation');
    }
  };

  const handleViewRequest = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('user-documents')
        .createSignedUrl(filePath, 3600);

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('View error:', error);
      toast.error('Erreur lors de la visualisation');
    }
  };

  const openValidationModal = (request: DocumentRequest, action: 'validate' | 'reject') => {
    setSelectedRequest(request);
    setValidationAction(action);
    setValidationModalOpen(true);
  };

  const handleValidation = async (reason?: string) => {
    if (!selectedRequest) return;

    const isValidate = validationAction === 'validate';
    const updateData = isValidate
      ? {
          status: 'validated',
          validated_at: new Date().toISOString(),
        }
      : {
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: reason,
        };

    try {
      const { error } = await supabase
        .from('document_requests')
        .update(updateData)
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast.success(isValidate ? 'Document validé avec succès' : 'Document refusé');
      fetchDocumentRequests();
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Erreur lors de la mise à jour');
      throw error;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return FileSpreadsheet;
    if (fileType.includes('pdf')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getCategoryLabel = (category: string) => {
    return documentCategories.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      identity: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      income: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      address: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      bank: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      tax: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colors[category] || colors.other;
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

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      !searchQuery ||
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.profile?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.profile?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const filteredRequests = documentRequests.filter((req) => {
    const matchesSearch =
      !searchQuery ||
      req.document_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.profile?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.profile?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const submittedRequests = filteredRequests.filter(r => r.status === 'submitted');
  const totalDocuments = documents.length;
  const pendingValidation = documentRequests.filter(r => r.status === 'submitted').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Documents clients</h1>
        <p className="text-muted-foreground">Gérez les documents uploadés et les demandes de justificatifs</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total documents</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
          </CardContent>
        </Card>
        <Card className={cn(pendingValidation > 0 && "border-blue-200 dark:border-blue-800")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente de validation</CardTitle>
            <AlertCircle className={cn("h-4 w-4", pendingValidation > 0 ? "text-blue-500" : "text-muted-foreground")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", pendingValidation > 0 && "text-blue-600")}>{pendingValidation}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandes totales</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentRequests.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests" className="gap-2">
            <FileText className="h-4 w-4" />
            Demandes de documents
            {pendingValidation > 0 && (
              <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
                {pendingValidation}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="uploaded" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            Documents uploadés
          </TabsTrigger>
        </TabsList>

        {/* Document Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          {/* Filters for requests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, email ou type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestStatusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Submitted documents requiring validation - highlighted */}
          {submittedRequests.length > 0 && statusFilter !== 'validated' && statusFilter !== 'rejected' && statusFilter !== 'pending' && (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <AlertCircle className="h-5 w-5" />
                  Documents à valider ({submittedRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead>Demande liée</TableHead>
                      <TableHead>Soumis le</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submittedRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {req.profile?.first_name} {req.profile?.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {req.profile?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{req.document_type}</p>
                        </TableCell>
                        <TableCell>
                          {req.loan_request && (
                            <span className="text-sm text-muted-foreground">
                              {getLoanTypeLabel(req.loan_request.loan_type)} - {req.loan_request.amount.toLocaleString()} €
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {req.submitted_at && new Date(req.submitted_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            {req.file_path && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewRequest(req.file_path!)}
                                className="gap-1"
                              >
                                <Eye className="h-4 w-4" />
                                Voir
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => openValidationModal(req, 'validate')}
                              className="gap-1 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Valider
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openValidationModal(req, 'reject')}
                              className="gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              Refuser
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* All document requests */}
          <Card>
            <CardHeader>
              <CardTitle>Toutes les demandes</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Aucune demande de document trouvée</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead>Demande liée</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((req) => {
                      const config = statusConfig[req.status] || statusConfig.pending;
                      const StatusIcon = config.icon;
                      
                      return (
                        <TableRow key={req.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {req.profile?.first_name} {req.profile?.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {req.profile?.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{req.document_type}</p>
                            {req.rejection_reason && (
                              <p className="text-xs text-destructive mt-1">
                                Refusé: {req.rejection_reason}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            {req.loan_request && (
                              <span className="text-sm text-muted-foreground">
                                {getLoanTypeLabel(req.loan_request.loan_type)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('gap-1', config.color)}>
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(req.requested_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              {req.file_path && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewRequest(req.file_path!)}
                                  className="gap-1"
                                >
                                  <Eye className="h-4 w-4" />
                                  Voir
                                </Button>
                              )}
                              {req.status === 'submitted' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => openValidationModal(req, 'validate')}
                                    className="gap-1 bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => openValidationModal(req, 'reject')}
                                    className="gap-1"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Uploaded Documents Tab */}
        <TabsContent value="uploaded" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, email ou fichier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Documents Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tous les documents</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Aucun document trouvé</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Document</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Taille</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => {
                      const FileIcon = getFileIcon(doc.file_type);
                      return (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {doc.profile?.first_name} {doc.profile?.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {doc.profile?.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-lg bg-muted">
                                <FileIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="font-medium truncate max-w-[200px]" title={doc.file_name}>
                                {doc.file_name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('text-xs', getCategoryColor(doc.category))}>
                              {getCategoryLabel(doc.category)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatFileSize(doc.file_size)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(doc)}
                                className="gap-1"
                              >
                                <Eye className="h-4 w-4" />
                                Voir
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(doc)}
                                className="gap-1"
                              >
                                <Download className="h-4 w-4" />
                                Télécharger
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Validation Modal */}
      {selectedRequest && (
        <DocumentValidationModal
          open={validationModalOpen}
          onOpenChange={setValidationModalOpen}
          documentType={selectedRequest.document_type}
          clientName={`${selectedRequest.profile?.first_name || ''} ${selectedRequest.profile?.last_name || ''}`}
          action={validationAction}
          onConfirm={handleValidation}
        />
      )}
    </div>
  );
}
