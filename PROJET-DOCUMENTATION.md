# 📚 Documentation Complète - Fundia Invest

## 🎯 Vue d'ensemble du projet

**Fundia Invest** est une plateforme de gestion de demandes de crédit avec interface admin complète.

### Technologies utilisées
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Email**: Resend
- **PDF**: jsPDF + jsPDF-autotable
- **Charts**: Recharts
- **Routing**: React Router v6
- **i18n**: react-i18next
- **Forms**: React Hook Form + Zod
- **State**: React Query (TanStack Query)

---

## 📁 Structure du projet

```
fundia-invest-prod/
├── src/
│   ├── components/
│   │   ├── ui/                    # Composants shadcn/ui de base
│   │   ├── admin/                 # Composants admin spécifiques
│   │   │   ├── StatCards.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   ├── StatusHistory.tsx
│   │   │   ├── EmailHistory.tsx
│   │   │   ├── RequestNotes.tsx
│   │   │   ├── GenerateContractDialog.tsx  # ⭐ Nouveau
│   │   │   └── ...
│   │   └── profile/               # Composants profil utilisateur
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminLayout.tsx    # Layout avec sidebar
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── Analytics.tsx      # ⭐ Nouveau - Dashboard analytique
│   │   │   ├── RequestsList.tsx   # ⭐ Amélioré - Filtres avancés + Export
│   │   │   ├── RequestDetail.tsx
│   │   │   └── ...
│   │   ├── Dashboard.tsx          # Dashboard utilisateur
│   │   ├── Profile.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── exportUtils.ts         # ⭐ Nouveau - Export CSV/Excel
│   │   ├── contractGenerator.ts   # ⭐ Nouveau - Génération PDF contrats
│   │   └── utils.ts
│   ├── hooks/
│   │   └── useAuth.tsx
│   ├── integrations/
│   │   └── supabase/
│   └── i18n/
│       └── locales/
│           ├── fr.json            # Traductions françaises
│           ├── en.json
│           └── ...
├── supabase/
│   ├── functions/
│   │   ├── _shared/
│   │   │   ├── rateLimiter.ts     # ⭐ Nouveau - Rate limiting
│   │   │   └── README.md          # ⭐ Nouveau - Documentation
│   │   ├── send-application-confirmation/
│   │   ├── send-status-notification/
│   │   ├── send-document-request/
│   │   ├── send-custom-email/     # ⭐ Amélioré - Rate limiting
│   │   └── ...
│   └── migrations/                # Migrations SQL
└── public/
```

---

## 🏗️ Architecture et Patterns

### 1. **Architecture Frontend**

#### **Pattern de routing**
```typescript
// App.tsx - Structure de routing
<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<AdminDashboard />} />
  <Route path="analytics" element={<Analytics />} />
  <Route path="requests" element={<RequestsList />} />
  <Route path="requests/:id" element={<RequestDetail />} />
  {/* ... */}
</Route>
```

**Principe** :
- Layouts partagés (AdminLayout) avec Outlet
- Routes imbriquées pour structure hiérarchique
- Routes protégées avec vérification de rôle

#### **Pattern de composants**

**Composant avec state management :**
```typescript
export default function ComponentName() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dependency]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('table')
        .select('*');

      if (error) throw error;
      setData(data || []);
    } catch (error: any) {
      toast.error(t('errors.loadError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  return (
    <div className="space-y-6">
      {/* Content */}
    </div>
  );
}
```

#### **Pattern de filtrage avancé**
```typescript
// État des filtres
const [search, setSearch] = useState('');
const [statusFilter, setStatusFilter] = useState('all');
const [loanTypeFilter, setLoanTypeFilter] = useState('all');
const [minAmount, setMinAmount] = useState('');
const [maxAmount, setMaxAmount] = useState('');
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');

// Logique de filtrage
const filteredData = data.filter((item) => {
  const matchesSearch =
    search === '' ||
    item.name.toLowerCase().includes(search.toLowerCase());

  const matchesStatus =
    statusFilter === 'all' ||
    item.status === statusFilter;

  const matchesAmount =
    (minAmount === '' || item.amount >= parseFloat(minAmount)) &&
    (maxAmount === '' || item.amount <= parseFloat(maxAmount));

  const matchesDate =
    (startDate === '' || new Date(item.date) >= new Date(startDate)) &&
    (endDate === '' || new Date(item.date) <= new Date(endDate));

  return matchesSearch && matchesStatus && matchesAmount && matchesDate;
});
```

### 2. **Architecture Backend (Supabase)**

#### **Edge Function Pattern**
```typescript
// Structure type d'une Edge Function
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // 1. Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 2. Vérifier l'authentification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders } }
      );
    }

    // 3. Créer client Supabase avec token utilisateur
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders } }
      );
    }

    // 4. Rate limiting (optionnel)
    const clientId = getClientIdentifier(req, userData.user.email);
    const rateLimitResult = checkRateLimit(clientId, {
      maxRequests: 10,
      windowMs: 60000
    });

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, corsHeaders);
    }

    // 5. Logique métier
    const { data } = await req.json();

    // ... votre code ...

    // 6. Réponse avec headers rate limit
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
          ...getRateLimitHeaders(rateLimitResult)
        }
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders } }
    );
  }
};

serve(handler);
```

#### **Pattern de vérification de rôle**
```typescript
// Vérifier si l'utilisateur est admin/manager
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const { data: roleData, error: roleError } = await supabaseAdmin
  .from("user_roles")
  .select("role")
  .eq("user_id", userId)
  .in("role", ["admin", "manager"])
  .maybeSingle();

if (roleError || !roleData) {
  return new Response(
    JSON.stringify({ error: "Forbidden: Admin access required" }),
    { status: 403, headers: { ...corsHeaders } }
  );
}
```

### 3. **Sécurité - Row Level Security (RLS)**

**Exemple de politique RLS :**
```sql
-- Politique pour loan_requests
CREATE POLICY "Users can view their own requests"
ON loan_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests"
ON loan_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Admins can update all requests"
ON loan_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'manager')
  )
);
```

---

## 🎨 Design System & UI Patterns

### **Système de couleurs et statuts**

```typescript
// Pattern de configuration des statuts
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  refused: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  in_progress: Loader2,
  approved: CheckCircle,
  refused: XCircle,
};

// Utilisation
<Badge className={cn('gap-1', statusColors[status])}>
  <StatusIcon className="h-3 w-3" />
  {t(`admin.status.${status}`)}
</Badge>
```

### **Pattern de cartes (Cards)**

```typescript
// Structure de base d'une Card
<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Contenu */}
  </CardContent>
</Card>

// Card avec actions
<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle>Titre</CardTitle>
    <Button variant="outline" size="sm">Action</Button>
  </CardHeader>
  <CardContent>
    {/* Contenu */}
  </CardContent>
</Card>
```

### **Pattern de formulaires avec Dialog**

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function CustomDialog({ open, onOpenChange }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // ... logique
      toast.success('Succès !');
      onOpenChange(false);
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Titre</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Formulaire */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Confirmer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📊 Fonctionnalités Avancées Implémentées

### 1. **Dashboard Analytique (Analytics)**

**Fichier** : `src/pages/admin/Analytics.tsx`

**Caractéristiques** :
- Graphiques interactifs avec Recharts
- Filtrage temporel (7/30/90/365 jours)
- Export CSV/Excel intégré
- KPIs calculés dynamiquement

**Pattern de calcul de KPIs** :
```typescript
const totalAmount = requests?.reduce((sum, r) => sum + r.amount, 0) || 0;
const averageAmount = totalRequests > 0 ? totalAmount / totalRequests : 0;

const approvedCount = requests?.filter(r => r.status === 'approved').length || 0;
const refusedCount = requests?.filter(r => r.status === 'refused').length || 0;
const completedCount = approvedCount + refusedCount;

const approvalRate = completedCount > 0 ? (approvedCount / completedCount) * 100 : 0;
```

**Pattern de graphiques Recharts** :
```typescript
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line
      type="monotone"
      dataKey="count"
      stroke="#3b82f6"
      strokeWidth={2}
      name="Demandes"
    />
  </LineChart>
</ResponsiveContainer>
```

### 2. **Export CSV/Excel**

**Fichier** : `src/lib/exportUtils.ts`

**Fonctions principales** :
```typescript
// Export CSV avec BOM UTF-8
export function downloadCSV(
  data: ExportData[],
  filename: string,
  headers?: string[]
): void {
  const csv = convertToCSV(data, headers);
  const blob = new Blob(['\uFEFF' + csv], {
    type: 'text/csv;charset=utf-8;'
  });
  downloadBlob(blob, filename + '.csv');
}

// Export Excel (HTML table)
export function downloadExcel(
  data: ExportData[],
  filename: string,
  headers?: string[]
): void {
  // Génération HTML table compatible Excel
  const html = generateExcelHTML(data, headers);
  const blob = new Blob([html], {
    type: 'application/vnd.ms-excel'
  });
  downloadBlob(blob, filename + '.xls');
}

// Formatage français
export function formatDateForExport(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatCurrencyForExport(amount: number): string {
  return amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
```

**Utilisation** :
```typescript
import { downloadCSV, downloadExcel, formatDateForExport, formatCurrencyForExport } from '@/lib/exportUtils';

const handleExport = () => {
  const exportData = items.map(item => ({
    'Nom': item.name,
    'Montant': formatCurrencyForExport(item.amount) + ' €',
    'Date': formatDateForExport(item.date),
  }));

  downloadCSV(exportData, `export-${new Date().toISOString().split('T')[0]}`);
};
```

### 3. **Filtres Avancés**

**Pattern de UI** :
```typescript
// Ligne 1 : Recherche + Dropdowns
<div className="flex flex-col sm:flex-row gap-4">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
    <Input
      placeholder="Rechercher..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="pl-9"
    />
  </div>
  <Select value={statusFilter} onValueChange={setStatusFilter}>
    {/* Options */}
  </Select>
</div>

// Ligne 2 : Plages numériques et dates
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <div>
    <Label>Montant min (€)</Label>
    <Input
      type="number"
      value={minAmount}
      onChange={(e) => setMinAmount(e.target.value)}
    />
  </div>
  {/* Autres filtres */}
</div>

// Compteur de résultats
<div className="text-sm text-muted-foreground">
  {filteredData.length} résultat(s) sur {data.length}
</div>
```

### 4. **Rate Limiting**

**Fichier** : `supabase/functions/_shared/rateLimiter.ts`

**Pattern d'implémentation** :
```typescript
// Dans votre Edge Function
import {
  checkRateLimit,
  createRateLimitResponse,
  getClientIdentifier,
  getRateLimitHeaders
} from "../_shared/rateLimiter.ts";

const handler = async (req: Request): Promise<Response> => {
  // ... auth ...

  // Rate limiting
  const clientId = getClientIdentifier(req, userEmail);
  const rateLimitResult = checkRateLimit(clientId, {
    maxRequests: 10,  // 10 requêtes
    windowMs: 60000   // par minute
  });

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult, corsHeaders);
  }

  // ... logique métier ...

  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        ...getRateLimitHeaders(rateLimitResult) // Ajoute X-RateLimit-*
      }
    }
  );
};
```

**Configuration par fonction** :
```typescript
// Emails personnalisés : strict
checkRateLimit(clientId, { maxRequests: 10, windowMs: 60000 });

// Notifications automatiques : plus permissif
checkRateLimit(clientId, { maxRequests: 30, windowMs: 60000 });

// Nouveaux utilisateurs : très strict
checkRateLimit(clientId, { maxRequests: 5, windowMs: 60000 });
```

### 5. **Génération Dynamique de Contrats PDF**

**Fichier** : `src/lib/contractGenerator.ts`

**Structure d'un template de contrat** :
```typescript
const LOAN_TYPE_TEMPLATES: Record<string, ContractTemplate> = {
  personal: {
    loanTypeLabel: 'Prêt Personnel',
    introduction: 'Le présent contrat concerne un prêt personnel...',
  },
  auto: {
    loanTypeLabel: 'Crédit Automobile',
    introduction: 'Le présent contrat concerne un crédit automobile...',
    specialConditions: [
      'Le véhicule financé servira de garantie.',
      'Une assurance auto est obligatoire.',
    ],
  },
  // ... autres types
};
```

**Fonction de génération** :
```typescript
export async function generateContractPDF(loanData: LoanData): Promise<Blob> {
  const doc = new jsPDF();
  const template = LOAN_TYPE_TEMPLATES[loanData.loanType];

  // 1. En-tête avec logo/titre
  doc.setFontSize(24);
  doc.setTextColor(102, 126, 234);
  doc.text('FUNDIA INVEST', pageWidth / 2, yPosition, { align: 'center' });

  // 2. Informations des parties
  doc.text('LE PRÊTEUR:', margin, yPosition);
  doc.text('Fundia Invest', margin + 5, yPosition);
  // ...

  // 3. Tableau des caractéristiques (jsPDF-autotable)
  (doc as any).autoTable({
    startY: yPosition,
    head: [['Élément', 'Valeur']],
    body: [
      ['Montant emprunté', `${loanData.amount.toLocaleString('fr-FR')} €`],
      ['Durée', `${loanData.duration} mois`],
      // ...
    ],
    theme: 'grid',
    headStyles: { fillColor: [102, 126, 234] },
  });

  // 4. Articles du contrat
  doc.text('ARTICLE 1 - OBJET DU CONTRAT', margin, yPosition);
  // ...

  // 5. Zones de signature
  doc.rect(margin, yPosition, signatureBoxWidth, 30);

  return doc.output('blob');
}
```

**Calculs financiers** :
```typescript
// Calcul de mensualité avec formule financière
export function calculateMonthlyPayment(
  amount: number,
  annualRate: number,
  durationMonths: number
): number {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return amount / durationMonths;

  const payment =
    (amount * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
    (Math.pow(1 + monthlyRate, durationMonths) - 1);

  return Math.round(payment * 100) / 100;
}

// Calcul du coût total
export function calculateTotalCost(
  monthlyPayment: number,
  durationMonths: number,
  amount: number
): number {
  return Math.round((monthlyPayment * durationMonths - amount) * 100) / 100;
}
```

**Composant Dialog** :
```typescript
// src/components/admin/GenerateContractDialog.tsx
export function GenerateContractDialog({ loanRequest }) {
  const [interestRate, setInterestRate] = useState('3.5');
  const [startDate, setStartDate] = useState(/* 7 jours plus tard */);

  // Preview en temps réel
  const previewPayment = () => {
    const rate = parseFloat(interestRate);
    return calculateMonthlyPayment(
      loanRequest.amount,
      rate,
      loanRequest.duration
    );
  };

  const handleGenerate = async () => {
    // 1. Générer PDF
    const pdfBlob = await generateContractPDF(loanData);

    // 2. Upload vers Supabase Storage
    const { error } = await supabase.storage
      .from('signed-contracts')
      .upload(filePath, pdfBlob);

    // 3. Créer enregistrement DB
    await supabase.from('contracts').insert({
      loan_request_id: loanRequest.id,
      contract_path: filePath,
      status: 'pending_signature',
      // ...
    });

    // 4. Télécharger pour l'admin
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Contrat-${loanRequest.id}.pdf`;
    link.click();
  };

  return (
    <Dialog>
      {/* Formulaire avec aperçu en temps réel */}
    </Dialog>
  );
}
```

---

## 🔐 Sécurité - Checklist

### **Frontend**
- [ ] Validation Zod sur tous les formulaires
- [ ] Sanitization HTML (escapeHtml dans emails)
- [ ] Protection CSRF (tokens dans headers)
- [ ] Pas de secrets dans le code (utiliser .env)
- [ ] Vérification de rôle avant affichage UI admin

### **Backend (Edge Functions)**
- [ ] Vérification JWT sur toutes les routes protégées
- [ ] Vérification de rôle (admin/manager) pour actions sensibles
- [ ] Rate limiting sur endpoints sensibles
- [ ] CORS headers configurés correctement
- [ ] Logs d'erreur (sans exposer de données sensibles)
- [ ] Service Role Key uniquement côté serveur

### **Base de données**
- [ ] RLS activé sur toutes les tables
- [ ] Politiques RLS pour SELECT, INSERT, UPDATE, DELETE
- [ ] Fonctions PostgreSQL pour vérification de rôle
- [ ] Indexes sur colonnes fréquemment recherchées
- [ ] Foreign keys avec ON DELETE CASCADE approprié

### **Storage**
- [ ] Buckets avec politiques RLS
- [ ] Politiques SELECT : utilisateur voit ses fichiers uniquement
- [ ] Politiques INSERT : utilisateur upload dans son dossier uniquement
- [ ] Admins ont accès à tous les fichiers
- [ ] Pas de fichiers publics sensibles

---

## 📦 Déploiement

### **Lovable Cloud (Actuel)**

1. **Push sur GitHub** :
   ```bash
   git add .
   git commit -m "feat: Description de la feature"
   git push origin main
   ```

2. **Déploiement automatique** :
   - Lovable détecte les changements
   - Build automatique (5-15 min)
   - Déploiement sur CDN

3. **Variables d'environnement** :
   - Configurées dans Lovable Dashboard
   - Secrets Supabase (URL, Anon Key, Service Role Key)
   - Secrets Resend (API Key, From Email)

### **Autre plateforme (Vercel, Netlify, etc.)**

**Vercel** :
```bash
# Installation
npm i -g vercel

# Déploiement
vercel --prod

# Variables d'environnement
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

**Netlify** :
```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🎯 Bonnes Pratiques pour Futurs Projets

### **1. Structure de départ**

```bash
# Créer un nouveau projet
npm create vite@latest mon-projet -- --template react-ts

# Installer les dépendances de base
npm install @supabase/supabase-js react-router-dom
npm install @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
npm install i18next react-i18next i18next-browser-languagedetector
npm install sonner

# UI (shadcn/ui)
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input select dialog

# Tailwind CSS (déjà inclus avec shadcn)
# Recharts pour graphiques
npm install recharts

# PDF
npm install jspdf jspdf-autotable
```

### **2. Configuration Supabase**

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### **3. Hook d'authentification réutilisable**

```typescript
// src/hooks/useAuth.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updatePassword: (password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updatePassword = async (password: string) => {
    return await supabase.auth.updateUser({ password });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### **4. Internationalisation (i18n)**

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### **5. Composants UI réutilisables**

**Loading State** :
```typescript
// src/components/LoadingState.tsx
export function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
```

**Empty State** :
```typescript
// src/components/EmptyState.tsx
export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex p-4 rounded-full bg-muted mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground mt-2">{description}</p>
    </div>
  );
}
```

**Error State** :
```typescript
// src/components/ErrorState.tsx
export function ErrorState({ error, retry }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex p-4 rounded-full bg-red-100 mb-4">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-lg font-medium">Une erreur est survenue</h3>
      <p className="text-muted-foreground mt-2">{error}</p>
      <Button onClick={retry} className="mt-4">Réessayer</Button>
    </div>
  );
}
```

### **6. Pattern de page complète**

```typescript
// Template de page avec tous les états
export default function PageTemplate() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('table')
        .select('*');

      if (error) throw error;
      setData(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error(t('errors.loadError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} retry={fetchData} />;
  if (data.length === 0) return <EmptyState icon={FileText} title={t('empty.title')} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('page.title')}</h1>
          <p className="text-muted-foreground">{t('page.subtitle')}</p>
        </div>
        <Button onClick={handleAction}>Action</Button>
      </div>

      <Card>
        <CardContent>
          {/* Contenu */}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🚀 Checklist Nouveau Projet

### **Phase 1 : Setup (Jour 1)**
- [ ] Créer projet Vite + React + TypeScript
- [ ] Installer dépendances (Supabase, Router, Query, etc.)
- [ ] Configurer shadcn/ui + Tailwind
- [ ] Configurer i18next
- [ ] Setup Supabase (projet, tables de base)
- [ ] Créer hook useAuth
- [ ] Setup routing de base
- [ ] Git init + premier commit

### **Phase 2 : Auth & Base (Jour 2-3)**
- [ ] Pages auth (login, signup, reset password)
- [ ] Layout principal
- [ ] Navigation
- [ ] Page profil utilisateur
- [ ] RLS policies de base
- [ ] Variables d'environnement

### **Phase 3 : Features Métier (Jour 4-10)**
- [ ] Schéma base de données complet
- [ ] Pages principales (dashboard, liste, détails)
- [ ] Formulaires avec validation Zod
- [ ] CRUD de base
- [ ] Upload de fichiers (si nécessaire)
- [ ] Edge Functions pour emails

### **Phase 4 : Admin (Jour 11-15)**
- [ ] Layout admin avec sidebar
- [ ] Dashboard admin
- [ ] Gestion des entités
- [ ] Actions admin (approve, reject, etc.)
- [ ] Historique et logs
- [ ] Notes internes

### **Phase 5 : Features Avancées (Jour 16-20)**
- [ ] Dashboard analytique avec graphiques
- [ ] Export CSV/Excel
- [ ] Filtres avancés
- [ ] Rate limiting
- [ ] Génération de documents (PDF, etc.)
- [ ] Notifications en temps réel

### **Phase 6 : Polish & Deploy (Jour 21-25)**
- [ ] Revue UX/UI
- [ ] Responsive design
- [ ] Performance optimization
- [ ] Tests manuels
- [ ] Documentation
- [ ] Déploiement production
- [ ] Formation client

---

## 📚 Ressources & Documentation

### **Documentation officielle**
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org/docs
- Vite: https://vitejs.dev
- Supabase: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com/docs
- Recharts: https://recharts.org
- React Router: https://reactrouter.com
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev

### **Outils utiles**
- Lucide Icons: https://lucide.dev
- Radix UI: https://www.radix-ui.com
- date-fns: https://date-fns.org
- jsPDF: https://github.com/parallax/jsPDF

### **Design inspirations**
- shadcn/ui examples: https://ui.shadcn.com/examples
- Tailwind UI: https://tailwindui.com
- Headless UI: https://headlessui.com

---

## 🎨 Customisation du Design

### **Pour un design différent**

1. **Modifier les couleurs** :
```css
/* tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#votre-couleur',
          foreground: '#couleur-texte',
        },
        // ... autres couleurs
      },
    },
  },
};
```

2. **Changer les fonts** :
```css
/* index.css */
@import url('https://fonts.googleapis.com/css2?family=VotreFonte:wght@400;500;600;700&display=swap');

body {
  font-family: 'VotreFonte', sans-serif;
}
```

3. **Customiser les composants shadcn** :
```typescript
// Exemple : Button avec style custom
<Button
  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
>
  Mon bouton custom
</Button>
```

4. **Layout différent** :
- Modifier `AdminLayout.tsx` pour sidebar différente
- Changer les icones (Lucide a 1000+ icones)
- Ajuster les espacements (gap, padding, margin)

### **Design Systems pré-faits**
- Material Design: Utiliser MUI au lieu de shadcn
- Ant Design: Import composants Ant Design
- Chakra UI: Alternative à shadcn
- Mantine: UI riche avec hooks

---

## 💡 Conseils Pro

### **Performance**
- Lazy load des routes : `const Page = lazy(() => import('./Page'))`
- Mémoïsation : `useMemo`, `useCallback` pour calculs lourds
- Virtualisation : `react-window` pour longues listes
- Code splitting : routes séparées

### **SEO (si applicable)**
- Utiliser Vite SSG ou migrer vers Next.js
- Meta tags dynamiques
- Sitemap.xml
- robots.txt

### **Accessibilité**
- Labels sur tous les inputs
- Alt text sur images
- Keyboard navigation
- ARIA labels
- Contraste suffisant (WCAG AA minimum)

### **Monitoring Production**
- Sentry pour error tracking
- Analytics (Google, Plausible, etc.)
- Performance monitoring (Web Vitals)
- Logs Supabase Edge Functions

---

**Créé par Claude Code - Documentation complète Fundia Invest**
*Dernière mise à jour : 2 Mars 2026*
