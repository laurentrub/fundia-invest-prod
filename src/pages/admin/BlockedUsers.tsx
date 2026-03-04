import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, ShieldOff, ShieldCheck, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface BlockedUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  last_request_id?: string;
}

export default function BlockedUsers() {
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, created_at')
        .eq('is_blocked', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For each blocked user, get their most recent loan request id
      const usersWithRequest = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: request } = await supabase
            .from('loan_requests')
            .select('id')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return { ...profile, last_request_id: request?.id };
        })
      );

      setUsers(usersWithRequest);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des utilisateurs bloqués');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    setUnblocking(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: false })
        .eq('id', userId);

      if (error) throw error;
      toast.success('Demandeur débloqué avec succès');
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error: any) {
      toast.error('Erreur lors du déblocage');
      console.error(error);
    } finally {
      setUnblocking(null);
    }
  };

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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldOff className="h-6 w-6 text-red-500" />
          Demandeurs bloqués
        </h1>
        <p className="text-muted-foreground">
          {users.length} demandeur(s) ne peuvent plus soumettre de nouvelles demandes
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Demandeur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Membre depuis</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Aucun demandeur bloqué
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {user.last_request_id && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/admin/requests/${user.last_request_id}`} className="gap-2">
                              <Eye className="h-4 w-4" />
                              Voir la demande
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200 hover:border-green-300"
                          onClick={() => handleUnblock(user.id)}
                          disabled={unblocking === user.id}
                        >
                          {unblocking === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ShieldCheck className="h-4 w-4" />
                          )}
                          Débloquer
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
