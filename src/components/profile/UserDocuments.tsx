import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  Loader2,
  File,
  Image,
  FileSpreadsheet,
  FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UserDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: string;
  created_at: string;
}

const documentCategories = [
  { value: 'identity', label: "Pièce d'identité" },
  { value: 'income', label: 'Justificatif de revenus' },
  { value: 'address', label: 'Justificatif de domicile' },
  { value: 'bank', label: 'Relevé bancaire' },
  { value: 'tax', label: 'Document fiscal' },
  { value: 'other', label: 'Autre' },
];

const identityTypes = [
  { value: 'id_card', label: 'Carte d\'identité' },
  { value: 'passport', label: 'Passeport' },
  { value: 'driving_license', label: 'Permis de conduire' },
  { value: 'residence_permit', label: 'Titre de séjour' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function UserDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [selectedIdentityType, setSelectedIdentityType] = useState('id_card');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<UserDocument | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRectoRef = useRef<HTMLInputElement>(null);
  const fileInputVersoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast.error('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const uploadSingleFile = async (file: File, suffix: string = '') => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${suffix}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('user-documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Save metadata to database
    const { error: dbError } = await supabase
      .from('user_documents')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        category: selectedCategory === 'identity' ? `identity_${selectedIdentityType}${suffix}` : selectedCategory,
      });

    if (dbError) throw dbError;
    return true;
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;

    const file = files[0];

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Le fichier est trop volumineux (max 10MB)');
      return;
    }

    setUploading(true);

    try {
      await uploadSingleFile(file);
      toast.success('Document uploadé avec succès');
      fetchDocuments();

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error("Erreur lors de l'upload du document");
    } finally {
      setUploading(false);
    }
  };

  const handleIDCardUpload = async (rectoFiles: FileList | null, versoFiles: FileList | null) => {
    if (!user) return;

    const recto = rectoFiles?.[0];
    const verso = versoFiles?.[0];

    if (!recto || !verso) {
      toast.error('Veuillez sélectionner les deux faces de la carte');
      return;
    }

    if (recto.size > MAX_FILE_SIZE || verso.size > MAX_FILE_SIZE) {
      toast.error('Un fichier est trop volumineux (max 10MB)');
      return;
    }

    setUploading(true);

    try {
      await uploadSingleFile(recto, '_recto');
      await uploadSingleFile(verso, '_verso');

      toast.success('Carte d\'identité uploadée avec succès (recto + verso)');
      fetchDocuments();

      // Reset file inputs
      if (fileInputRectoRef.current) fileInputRectoRef.current.value = '';
      if (fileInputVersoRef.current) fileInputVersoRef.current.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error("Erreur lors de l'upload de la carte d'identité");
    } finally {
      setUploading(false);
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
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user-documents')
        .remove([documentToDelete.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentToDelete.id);

      if (dbError) throw dbError;

      toast.success('Document supprimé');
      fetchDocuments();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
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
          <FolderOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Mes documents</h2>
          <p className="text-muted-foreground">Gérez vos documents personnels</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ajouter un document</CardTitle>
          <CardDescription>
            Formats acceptés: PDF, images, documents Office (max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Catégorie du document</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
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

            {selectedCategory === 'identity' && (
              <div className="space-y-2">
                <Label>Type de pièce d'identité</Label>
                <Select value={selectedIdentityType} onValueChange={setSelectedIdentityType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {identityTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Upload zone - Conditionnel selon le type d'identité */}
          {selectedCategory === 'identity' && selectedIdentityType === 'id_card' ? (
            // Upload Recto/Verso pour carte d'identité
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recto */}
              <div className="space-y-2">
                <Label>Face avant (Recto)</Label>
                <div className={cn(
                  'relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 text-center',
                  'border-border hover:border-primary/50 hover:bg-muted/50',
                  uploading && 'opacity-50 pointer-events-none'
                )}>
                  <input
                    ref={fileInputRectoRef}
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".jpg,.jpeg,.png,.pdf"
                    disabled={uploading}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Recto</p>
                    <p className="text-xs text-muted-foreground">Cliquez pour sélectionner</p>
                  </div>
                </div>
              </div>

              {/* Verso */}
              <div className="space-y-2">
                <Label>Face arrière (Verso)</Label>
                <div className={cn(
                  'relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 text-center',
                  'border-border hover:border-primary/50 hover:bg-muted/50',
                  uploading && 'opacity-50 pointer-events-none'
                )}>
                  <input
                    ref={fileInputVersoRef}
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".jpg,.jpeg,.png,.pdf"
                    disabled={uploading}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Verso</p>
                    <p className="text-xs text-muted-foreground">Cliquez pour sélectionner</p>
                  </div>
                </div>
              </div>

              {/* Bouton Upload */}
              <div className="md:col-span-2">
                <Button
                  onClick={() => handleIDCardUpload(
                    fileInputRectoRef.current?.files || null,
                    fileInputVersoRef.current?.files || null
                  )}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Upload en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Uploader la carte (Recto + Verso)
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            // Upload normal pour les autres documents
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                'relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center',
                dragActive
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50',
                uploading && 'opacity-50 pointer-events-none'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => handleFileUpload(e.target.files)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                disabled={uploading}
              />

              <div className="flex flex-col items-center gap-3">
                {uploading ? (
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                ) : (
                  <div className="p-4 rounded-full bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {uploading ? 'Upload en cours...' : 'Glissez-déposez un fichier ici'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ou cliquez pour sélectionner
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vos documents ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-4 rounded-full bg-muted inline-block mb-3">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Aucun document uploadé pour le moment
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const FileIcon = getFileIcon(doc.file_type);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors group"
                  >
                    <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                      <FileIcon className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.file_name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
                          {getCategoryLabel(doc.category)}
                        </span>
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>
                          {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(doc)}
                        className="h-9 w-9"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDocumentToDelete(doc);
                          setDeleteDialogOpen(true);
                        }}
                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le document "{documentToDelete?.file_name}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
