import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface Note {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_name?: string;
}

interface RequestNotesProps {
  notes: Note[];
  onAddNote: (content: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
}

export function RequestNotes({ notes, onAddNote, onDeleteNote }: RequestNotesProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddNote(newNote.trim());
      setNewNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add note form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={t('admin.notes.placeholder')}
          rows={3}
          className="resize-none"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!newNote.trim() || isSubmitting}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          {t('admin.notes.add')}
        </Button>
      </form>

      {/* Notes list */}
      <div className="space-y-3 mt-6">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{t('admin.notes.empty')}</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                'p-3 rounded-lg border',
                note.author_id === user?.id
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-muted/50 border-border'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="font-medium">{note.author_name || t('admin.notes.anonymous')}</span>
                    <span>•</span>
                    <span>
                      {new Date(note.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                {note.author_id === user?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDeleteNote(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
