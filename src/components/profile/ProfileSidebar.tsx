import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, FileText, FolderOpen, LogOut, Lock, FileSignature, ChevronRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ProfileSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userName?: string;
  userEmail?: string;
}

export function ProfileSidebar({ activeSection, onSectionChange, userName, userEmail }: ProfileSidebarProps) {
  const { t } = useTranslation();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = userName || user?.email?.split('@')[0] || 'Utilisateur';
  const displayEmail = userEmail || user?.email || '';
  const initials = displayName.slice(0, 2).toUpperCase();

  const menuItems = [
    {
      id: 'info-group',
      label: 'Mes informations',
      icon: User,
      subItems: [
        { id: 'info', label: 'Informations personnelles', icon: User },
        { id: 'password', label: 'Mot de passe', icon: Lock },
      ],
    },
    {
      id: 'requests-group',
      label: 'Mes demandes',
      icon: FileText,
      subItems: [
        { id: 'requests', label: 'Demandes de crédit', icon: FileText },
        { id: 'contracts', label: 'Mes contrats', icon: FileSignature },
      ],
    },
    {
      id: 'documents',
      label: 'Mes documents',
      icon: FolderOpen,
      subItems: [],
    },
  ];

  const getDefaultOpen = () => {
    if (['info', 'password'].includes(activeSection)) return 'info-group';
    if (['requests', 'contracts'].includes(activeSection)) return 'requests-group';
    return '';
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-card to-card/95 border-r border-border min-h-[calc(100vh-80px)] flex flex-col shadow-lg">
      {/* User Profile Header */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all duration-300 hover:ring-primary/40">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">{displayName}</h2>
            <p className="text-sm text-muted-foreground truncate">{displayEmail}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <Accordion type="single" collapsible defaultValue={getDefaultOpen()} className="space-y-1">
          {menuItems.map((item) => (
            <AccordionItem 
              key={item.id} 
              value={item.id} 
              className="border-none"
            >
              {item.subItems.length > 0 ? (
                <>
                  <AccordionTrigger 
                    className={cn(
                      "hover:no-underline py-3 px-4 rounded-xl transition-all duration-200",
                      "hover:bg-primary/5 group",
                      "[&[data-state=open]]:bg-primary/10 [&[data-state=open]]:shadow-sm",
                      "[&>svg]:transition-transform [&>svg]:duration-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg transition-all duration-200",
                        "bg-muted group-hover:bg-primary/10",
                        "group-[[data-state=open]]:bg-primary group-[[data-state=open]]:text-primary-foreground"
                      )}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1 pt-1">
                    <div className="ml-4 pl-4 border-l-2 border-border/50 space-y-1">
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => onSectionChange(subItem.id)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-all duration-200',
                            'group/item',
                            activeSection === subItem.id
                              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                              : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                          )}
                        >
                          <subItem.icon className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            activeSection !== subItem.id && "group-hover/item:scale-110"
                          )} />
                          <span className="flex-1 text-left">{subItem.label}</span>
                          <ChevronRight className={cn(
                            "h-4 w-4 opacity-0 -translate-x-2 transition-all duration-200",
                            activeSection === subItem.id ? "opacity-100 translate-x-0" : "group-hover/item:opacity-50 group-hover/item:translate-x-0"
                          )} />
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </>
              ) : (
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 group',
                    activeSection === item.id
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : 'text-foreground hover:bg-primary/5'
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    activeSection === item.id 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted group-hover:bg-primary/10"
                  )}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                  <ChevronRight className={cn(
                    "h-4 w-4 opacity-0 -translate-x-2 transition-all duration-200",
                    activeSection === item.id ? "opacity-100 translate-x-0" : "group-hover:opacity-50 group-hover:translate-x-0"
                  )} />
                </button>
              )}
            </AccordionItem>
          ))}
        </Accordion>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border/50">
        <button
          onClick={handleSignOut}
          className={cn(
            "w-full flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200",
            "text-destructive/80 hover:text-destructive",
            "hover:bg-destructive/10 group"
          )}
        >
          <div className="p-2 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-all duration-200">
            <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          </div>
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
