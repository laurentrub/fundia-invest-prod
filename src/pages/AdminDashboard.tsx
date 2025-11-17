import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, CheckCircle, XCircle, Clock, Mail, Eye } from "lucide-react";

// Mock data
const mockApplications = [
  {
    id: "APP001",
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    loanType: "Personal Loan",
    amount: 10000,
    duration: 48,
    status: "new",
    date: "2025-10-01",
    monthlyIncome: 2800,
  },
  {
    id: "APP002",
    name: "Marie Martin",
    email: "marie.martin@example.com",
    loanType: "Auto Loan",
    amount: 25000,
    duration: 60,
    status: "in-progress",
    date: "2025-10-01",
    monthlyIncome: 3500,
  },
  {
    id: "APP003",
    name: "Pierre Bernard",
    email: "pierre.bernard@example.com",
    loanType: "Home Improvement",
    amount: 15000,
    duration: 72,
    status: "approved",
    date: "2025-09-30",
    monthlyIncome: 4200,
  },
  {
    id: "APP004",
    name: "Sophie Laurent",
    email: "sophie.laurent@example.com",
    loanType: "Debt Consolidation",
    amount: 30000,
    duration: 84,
    status: "rejected",
    date: "2025-09-29",
    monthlyIncome: 2200,
  },
];

const AdminDashboard = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: "New", variant: "default" as const, icon: Clock },
      "in-progress": { label: "In Progress", variant: "secondary" as const, icon: FileText },
      approved: { label: "Approved", variant: "default" as const, icon: CheckCircle },
      rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredApplications = filterStatus === "all" 
    ? mockApplications 
    : mockApplications.filter(app => app.status === filterStatus);

  const stats = {
    total: mockApplications.length,
    new: mockApplications.filter(app => app.status === "new").length,
    inProgress: mockApplications.filter(app => app.status === "in-progress").length,
    approved: mockApplications.filter(app => app.status === "approved").length,
    rejected: mockApplications.filter(app => app.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage loan applications and customer requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-6">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Applications</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold text-accent">{stats.new}</div>
            <div className="text-sm text-muted-foreground">New</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold text-success">{stats.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filter by Status:</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Applications Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Applicant</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Loan Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm">{app.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{app.name}</div>
                        <div className="text-xs text-muted-foreground">{app.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{app.loanType}</td>
                    <td className="px-6 py-4 font-semibold">€{app.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{app.duration}mo</td>
                    <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{app.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Mail className="h-4 w-4" />
                        </Button>
                        {app.status === "new" && (
                          <>
                            <Button size="sm" variant="default">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
