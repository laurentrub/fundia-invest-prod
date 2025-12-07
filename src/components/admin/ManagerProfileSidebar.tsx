import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  FileText,
  FileCheck,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Lock,
  Save,
  Loader2,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ManagerProfileSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { key: 'dashboard', path: '/admin', icon: LayoutDashboard },
  { key: 'requests', path: '/admin/requests', icon: FileText },
  { key: 'documents', path: '/admin/documents', icon: FileCheck },
  { key: 'team', path: '/admin/team', icon: Users },
  { key: 'settings', path: '/admin/settings', icon: Settings },
];

export function ManagerProfileSidebar({ collapsed, onToggle }: ManagerProfileSidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, signOut, updatePassword } = useAuth();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Profile data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Password data
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
        })
        .eq('id', user!.id);

      if (error) throw error;

      toast.success(t('profile.messages.updateSuccess'));
    } catch (error: any) {
      toast.error(t('profile.messages.updateError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t('profile.messages.passwordMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t('profile.messages.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(newPassword);

      if (error) throw error;

      toast.success(t('profile.messages.passwordSuccess'));
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(t('profile.messages.passwordError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = () => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  return (
    <aside
      className={cn(
        'bg-card border-r border-border h-screen flex flex-col transition-all duration-300 sticky top-0 overflow-y-auto',
        collapsed ? 'w-16' : 'w-80'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">PE</span>
            </div>
            <span className="font-semibold text-foreground">Admin</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn('h-8 w-8', collapsed && 'mx-auto')}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Profile Section */}
      {!collapsed && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{firstName} {lastName}</p>
              <p className="text-sm text-muted-foreground truncate">{email}</p>
            </div>
          </div>

          {/* Profile Edit */}
          <Collapsible open={profileOpen} onOpenChange={setProfileOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 mb-2">
                <User className="h-4 w-4" />
                {t('profile.tabs.info')}
                <ChevronRight className={cn('h-4 w-4 ml-auto transition-transform', profileOpen && 'rotate-90')} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <form onSubmit={handleProfileUpdate} className="space-y-3 p-3 bg-muted/50 rounded-lg mt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs">{t('profile.info.firstName')}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-8 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs">{t('profile.info.lastName')}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-8 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs">{t('profile.info.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-8 text-sm"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                <Button type="submit" size="sm" disabled={loading} className="w-full gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {t('profile.info.update')}
                </Button>
              </form>
            </CollapsibleContent>
          </Collapsible>

          {/* Password Edit */}
          <Collapsible open={passwordOpen} onOpenChange={setPasswordOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Lock className="h-4 w-4" />
                {t('profile.tabs.password')}
                <ChevronRight className={cn('h-4 w-4 ml-auto transition-transform', passwordOpen && 'rotate-90')} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-3 p-3 bg-muted/50 rounded-lg mt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs">{t('profile.password.newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-8 text-sm"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs">{t('profile.password.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-8 text-sm"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" size="sm" disabled={loading} className="w-full gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  {t('profile.password.change')}
                </Button>
              </form>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Collapsed Profile Avatar */}
      {collapsed && (
        <div className="p-2 border-b border-border flex justify-center">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.key}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">
                  {t(`admin.nav.${item.key}`)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-muted-foreground hover:text-destructive',
            collapsed && 'justify-center px-2'
          )}
          onClick={signOut}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="ml-3 text-sm">{t('admin.nav.logout')}</span>}
        </Button>
      </div>
    </aside>
  );
}
