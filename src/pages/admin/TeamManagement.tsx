import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Users, UserPlus, Shield, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

export default function TeamManagement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('manager');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect managers to dashboard
  useEffect(() => {
    if (isAdmin === false) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchTeamMembers();
    }
  }, [isAdmin]);

  const fetchTeamMembers = async () => {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      const filteredRoles = (roles || []).filter((r) => (r.role as string) === 'admin' || (r.role as string) === 'manager');

      if (error) throw error;

      const membersWithInfo = await Promise.all(
        filteredRoles.map(async (role) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, first_name, last_name')
            .eq('id', role.user_id)
            .maybeSingle();

          return {
            ...role,
            email: profile?.email,
            first_name: profile?.first_name,
            last_name: profile?.last_name,
          };
        })
      );

      setMembers(membersWithInfo);
    } catch (error: any) {
      toast.error(t('admin.team.loadError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;

    setIsSubmitting(true);
    try {
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newMemberEmail.trim().toLowerCase())
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        toast.error(t('admin.team.userNotFound'));
        return;
      }

      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profile.id);

      const existingRole = existingRoles?.find((r) => (r.role as string) === 'admin' || (r.role as string) === 'manager');

      if (existingRole) {
        toast.error(t('admin.team.alreadyMember'));
        return;
      }

      const { error: insertError } = await (supabase.from('user_roles').insert({
        user_id: profile.id,
        role: newMemberRole as any,
      }) as any);

      if (insertError) throw insertError;

      toast.success(t('admin.team.memberAdded'));
      setNewMemberEmail('');
      setAddDialogOpen(false);
      fetchTeamMembers();
    } catch (error: any) {
      toast.error(t('admin.team.addError'));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    if (memberUserId === user?.id) {
      toast.error(t('admin.team.cantRemoveSelf'));
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success(t('admin.team.memberRemoved'));
      fetchTeamMembers();
    } catch (error: any) {
      toast.error(t('admin.team.removeError'));
      console.error(error);
    }
  };

  const handleRoleChange = async (memberId: string, memberUserId: string, newRole: string) => {
    if (memberUserId === user?.id) {
      toast.error(t('admin.team.cantChangeSelf'));
      return;
    }

    try {
      const { error } = await (supabase
        .from('user_roles')
        .update({ role: newRole as any })
        .eq('id', memberId) as any);

      if (error) throw error;

      toast.success(t('admin.team.roleUpdated'));
      fetchTeamMembers();
    } catch (error: any) {
      toast.error(t('admin.team.updateError'));
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.team.title')}</h1>
          <p className="text-muted-foreground">{t('admin.team.subtitle')}</p>
        </div>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              {t('admin.team.addMember')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('admin.team.addMemberTitle')}</DialogTitle>
              <DialogDescription>
                {t('admin.team.addMemberDesc')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('admin.team.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder={t('admin.team.emailPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('admin.team.role')}</Label>
                <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">{t('admin.team.roleManager')}</SelectItem>
                    <SelectItem value="admin">{t('admin.team.roleAdmin')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleAddMember} disabled={isSubmitting || !newMemberEmail.trim()}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('admin.team.addButton')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('admin.team.members')}
          </CardTitle>
          <CardDescription>
            {t('admin.team.membersCount', { count: members.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.team.columns.member')}</TableHead>
                <TableHead>{t('admin.team.columns.role')}</TableHead>
                <TableHead>{t('admin.team.columns.since')}</TableHead>
                <TableHead className="text-right">{t('admin.team.columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {t('admin.team.noMembers')}
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {member.first_name && member.last_name
                            ? `${member.first_name} ${member.last_name}`
                            : t('admin.team.noName')}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.user_id === user?.id ? (
                        <Badge variant="outline" className={cn(roleColors[member.role])}>
                          {t(`admin.team.role${member.role.charAt(0).toUpperCase() + member.role.slice(1)}`)}
                        </Badge>
                      ) : (
                        <Select
                          value={member.role}
                          onValueChange={(value) => handleRoleChange(member.id, member.user_id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">{t('admin.team.roleManager')}</SelectItem>
                            <SelectItem value="admin">{t('admin.team.roleAdmin')}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(member.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      {member.user_id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveMember(member.id, member.user_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
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
