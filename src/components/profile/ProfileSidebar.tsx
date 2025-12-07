import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, FileText, FolderOpen, LogOut, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProfileSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function ProfileSidebar({ activeSection, onSectionChange }: ProfileSidebarProps) {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    {
      id: 'info',
      label: 'Mes informations',
      icon: User,
      subItems: [
        { id: 'info', label: 'Informations personnelles' },
        { id: 'password', label: 'Mot de passe' },
      ],
    },
    {
      id: 'requests',
      label: 'Mes demandes',
      icon: FileText,
      subItems: [
        { id: 'requests', label: 'Demandes de crédit' },
        { id: 'contracts', label: 'Mes contrats' },
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
    if (['info', 'password'].includes(activeSection)) return 'info';
    if (['requests', 'contracts'].includes(activeSection)) return 'requests';
    return activeSection;
  };

  return (
    <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-80px)] flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg text-foreground">Mon espace</h2>
      </div>

      <nav className="flex-1 p-4">
        <Accordion type="single" collapsible defaultValue={getDefaultOpen()} className="space-y-2">
          {menuItems.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border-none">
              {item.subItems.length > 0 ? (
                <>
                  <AccordionTrigger className="hover:no-underline py-2 px-3 rounded-lg hover:bg-muted/50 [&[data-state=open]]:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0 pt-1">
                    <div className="ml-8 space-y-1">
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => onSectionChange(subItem.id)}
                          className={cn(
                            'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                            activeSection === subItem.id
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          )}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </>
              ) : (
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 py-2 px-3 rounded-lg transition-colors',
                    activeSection === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted/50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              )}
            </AccordionItem>
          ))}
        </Accordion>
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
        </Button>
      </div>
    </aside>
  );
}
