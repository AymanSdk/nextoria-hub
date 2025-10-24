"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  List,
  Grid3x3,
  Rows3,
  Plus,
  Search,
  Download,
  Trash2,
  MoreHorizontal,
  CheckSquare,
  Square,
  Users,
  TrendingUp,
  Activity,
  X,
  Eye,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Client {
  id: string;
  name: string;
  companyName: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  industry: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

interface ImportClientData {
  name: string;
  companyName?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  industry?: string;
  notes?: string;
}

interface ClientsBrowserProps {
  initialClients?: Client[];
}

type ViewMode = "list" | "grid" | "compact";
type SortField = "name" | "company" | "email" | "createdAt" | "industry";
type SortOrder = "asc" | "desc";

export function ClientsBrowser({ initialClients = [] }: ClientsBrowserProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<ImportClientData[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    industry: "",
    notes: "",
  });

  useEffect(() => {
    if (initialClients.length === 0) {
      fetchClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const workspaceRes = await fetch("/api/workspaces");
      const workspaceData = await workspaceRes.json();
      const workspaceId = workspaceData.workspaces[0]?.id;

      if (!workspaceId) return;

      const res = await fetch(`/api/clients?workspaceId=${workspaceId}`);
      const data = await res.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const workspaceRes = await fetch("/api/workspaces");
      const workspaceData = await workspaceRes.json();
      const workspaceId = workspaceData.workspaces[0]?.id;

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          workspaceId,
        }),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        setFormData({
          name: "",
          companyName: "",
          email: "",
          phone: "",
          website: "",
          address: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
          industry: "",
          notes: "",
        });
        fetchClients();
        toast.success("Client created successfully");
      } else {
        toast.error("Failed to create client");
      }
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (client: Client) => {
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setClients(clients.filter((c) => c.id !== client.id));
        setClientToDelete(null);
        toast.success("Client deleted successfully");
      } else {
        toast.error("Failed to delete client");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("An error occurred");
    }
  };

  // Get unique industries for filtering
  const industries = useMemo(() => {
    const unique = new Set(
      clients.map((c) => c.industry).filter((i): i is string => Boolean(i))
    );
    return Array.from(unique).sort();
  }, [clients]);

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let result = [...clients];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.companyName?.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query) ||
          client.industry?.toLowerCase().includes(query) ||
          client.city?.toLowerCase().includes(query)
      );
    }

    // Apply industry filter
    if (filterIndustry !== "all") {
      result = result.filter((client) => client.industry === filterIndustry);
    }

    // Apply status filter
    if (filterStatus !== "all") {
      const isActive = filterStatus === "active";
      result = result.filter((client) => client.isActive === isActive);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: string | Date | null;
      let bVal: string | Date | null;

      switch (sortField) {
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
        case "company":
          aVal = a.companyName || "";
          bVal = b.companyName || "";
          break;
        case "email":
          aVal = a.email;
          bVal = b.email;
          break;
        case "industry":
          aVal = a.industry || "";
          bVal = b.industry || "";
          break;
        case "createdAt":
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [clients, searchQuery, filterIndustry, filterStatus, sortField, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => c.isActive).length;
    const thisMonth = clients.filter((c) => {
      const created = new Date(c.createdAt);
      const now = new Date();
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length;
    const withIndustry = clients.filter((c) => c.industry).length;

    return { total, active, thisMonth, withIndustry };
  }, [clients]);

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedClients.size === filteredAndSortedClients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(filteredAndSortedClients.map((c) => c.id)));
    }
  };

  const handleSelectClient = (clientId: string) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId);
    } else {
      newSelected.add(clientId);
    }
    setSelectedClients(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedClients.size === 0) return;

    try {
      await Promise.all(
        Array.from(selectedClients).map((id) =>
          fetch(`/api/clients/${id}`, { method: "DELETE" })
        )
      );

      setClients(clients.filter((c) => !selectedClients.has(c.id)));
      setSelectedClients(new Set());
      toast.success(`Deleted ${selectedClients.size} client(s)`);
    } catch (error) {
      console.error("Error deleting clients:", error);
      toast.error("Failed to delete clients");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Company",
      "Email",
      "Phone",
      "Website",
      "Industry",
      "City",
      "State",
      "Country",
      "Status",
    ];

    const csvData = filteredAndSortedClients.map((client) => [
      client.name,
      client.companyName || "",
      client.email,
      client.phone || "",
      client.website || "",
      client.industry || "",
      client.city || "",
      client.state || "",
      client.country || "",
      client.isActive ? "Active" : "Inactive",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported clients to CSV");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const parseCSV = (text: string): ImportClientData[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const data: ImportClientData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
      const row: Partial<ImportClientData> = {};

      headers.forEach((header, index) => {
        const normalizedHeader = header.toLowerCase();
        if (normalizedHeader.includes("name") && !normalizedHeader.includes("company")) {
          row.name = values[index];
        } else if (normalizedHeader.includes("company")) {
          row.companyName = values[index];
        } else if (normalizedHeader.includes("email")) {
          row.email = values[index];
        } else if (normalizedHeader.includes("phone")) {
          row.phone = values[index];
        } else if (normalizedHeader.includes("website")) {
          row.website = values[index];
        } else if (normalizedHeader.includes("industry")) {
          row.industry = values[index];
        } else if (normalizedHeader.includes("city")) {
          row.city = values[index];
        } else if (normalizedHeader.includes("state")) {
          row.state = values[index];
        } else if (normalizedHeader.includes("country")) {
          row.country = values[index];
        }
      });

      if (row.name && row.email) {
        data.push(row as ImportClientData);
      }
    }

    return data;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    try {
      const text = await file.text();
      const parsedData = parseCSV(text);

      if (parsedData.length === 0) {
        toast.error("No valid data found in CSV file");
        return;
      }

      setImportPreviewData(parsedData);
      setIsImportDialogOpen(true);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast.error("Failed to parse CSV file");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImport = async () => {
    if (importPreviewData.length === 0) return;

    setIsImporting(true);

    try {
      const workspaceRes = await fetch("/api/workspaces");
      const workspaceData = await workspaceRes.json();
      const workspaceId = workspaceData.workspaces[0]?.id;

      if (!workspaceId) {
        toast.error("No workspace found");
        setIsImporting(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const clientData of importPreviewData) {
        try {
          const res = await fetch("/api/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...clientData,
              workspaceId,
            }),
          });

          if (res.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }
      }

      setIsImportDialogOpen(false);
      setImportPreviewData([]);
      fetchClients();

      if (errorCount === 0) {
        toast.success(`Successfully imported ${successCount} client(s)`);
      } else {
        toast.warning(`Imported ${successCount} client(s), ${errorCount} failed`);
      }
    } catch (error) {
      console.error("Error importing clients:", error);
      toast.error("Failed to import clients");
    } finally {
      setIsImporting(false);
    }
  };

  const getInitials = (name: string, company: string | null) => {
    if (company) {
      return company
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-green-500 to-green-600",
      "from-orange-500 to-orange-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
      "from-teal-500 to-teal-600",
      "from-red-500 to-red-600",
    ];
    const index =
      id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div className='space-y-6'>
      {/* Hidden File Input for CSV Import */}
      <input
        ref={fileInputRef}
        type='file'
        accept='.csv'
        onChange={handleFileChange}
        className='hidden'
      />
      {/* Header */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Clients</h1>
            <p className='text-muted-foreground mt-2'>
              Manage your client relationships and contact information
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size='lg' className='gap-2'>
                <Plus className='h-4 w-4' />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>Add a new client to your workspace</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>
                      Contact Name <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='name'
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='companyName'>Company Name</Label>
                    <Input
                      id='companyName'
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({ ...formData, companyName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>
                      Email <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='email'
                      type='email'
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='phone'>Phone</Label>
                    <Input
                      id='phone'
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='website'>Website</Label>
                    <Input
                      id='website'
                      type='url'
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='industry'>Industry</Label>
                    <Input
                      id='industry'
                      value={formData.industry}
                      onChange={(e) =>
                        setFormData({ ...formData, industry: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='address'>Address</Label>
                  <Input
                    id='address'
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>

                <div className='grid grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='city'>City</Label>
                    <Input
                      id='city'
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='state'>State</Label>
                    <Input
                      id='state'
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='postalCode'>Postal Code</Label>
                    <Input
                      id='postalCode'
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData({ ...formData, postalCode: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='country'>Country</Label>
                  <Input
                    id='country'
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='notes'>Notes</Label>
                  <Textarea
                    id='notes'
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className='flex justify-end gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type='submit'>Create Client</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards - Modern Compact Design */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
          {/* Total Clients */}
          <Card className='relative overflow-hidden border hover:shadow-lg transition-all duration-300 group'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform' />
            <CardContent className='p-4 relative'>
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30'>
                      <Building2 className='h-4 w-4 text-white' />
                    </div>
                    <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                      Total
                    </p>
                  </div>
                  <p className='text-2xl font-bold tracking-tight'>{stats.total}</p>
                  <p className='text-xs text-muted-foreground'>All clients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Clients */}
          <Card className='relative overflow-hidden border hover:shadow-lg transition-all duration-300 group'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform' />
            <CardContent className='p-4 relative'>
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30'>
                      <Activity className='h-4 w-4 text-white' />
                    </div>
                    <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                      Active
                    </p>
                  </div>
                  <div className='flex items-baseline gap-2'>
                    <p className='text-2xl font-bold tracking-tight'>{stats.active}</p>
                    {stats.total > 0 && (
                      <span className='text-xs font-medium text-green-600 dark:text-green-400'>
                        {Math.round((stats.active / stats.total) * 100)}%
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground'>Currently active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* This Month */}
          <Card className='relative overflow-hidden border hover:shadow-lg transition-all duration-300 group'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform' />
            <CardContent className='p-4 relative'>
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30'>
                      <TrendingUp className='h-4 w-4 text-white' />
                    </div>
                    <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                      New
                    </p>
                  </div>
                  <p className='text-2xl font-bold tracking-tight'>{stats.thisMonth}</p>
                  <p className='text-xs text-muted-foreground'>Added this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industries */}
          <Card className='relative overflow-hidden border hover:shadow-lg transition-all duration-300 group'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform' />
            <CardContent className='p-4 relative'>
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30'>
                      <Users className='h-4 w-4 text-white' />
                    </div>
                    <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                      Industries
                    </p>
                  </div>
                  <p className='text-2xl font-bold tracking-tight'>{industries.length}</p>
                  <p className='text-xs text-muted-foreground'>Different sectors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className='my-0' />

        {/* Search and Filters Toolbar */}
        <div className='flex items-center gap-3 py-2'>
          {/* Search Input */}
          <div className='relative w-64'>
            <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground' />
            <Input
              placeholder='Search clients...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-8 h-9 text-sm'
            />
          </div>

          <Separator orientation='vertical' className='h-9 bg-border' />

          {/* Filter Controls */}
          <ButtonGroup>
            <Select value={filterIndustry} onValueChange={setFilterIndustry}>
              <SelectTrigger className='h-9 w-[110px] text-xs'>
                <SelectValue placeholder='Industry' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Industries</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className='h-9 w-[90px] text-xs'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortField}
              onValueChange={(value) => setSortField(value as SortField)}
            >
              <SelectTrigger className='h-9 w-[100px] text-xs'>
                <SelectValue placeholder='Sort' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='name'>Name</SelectItem>
                <SelectItem value='company'>Company</SelectItem>
                <SelectItem value='email'>Email</SelectItem>
                <SelectItem value='industry'>Industry</SelectItem>
                <SelectItem value='createdAt'>Date</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant='outline'
              size='sm'
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className='h-9 w-9 p-0 text-base'
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </ButtonGroup>

          {/* Active Filter Badges */}
          {(filterIndustry !== "all" || filterStatus !== "all") && (
            <>
              <Separator orientation='vertical' className='h-6' />
              <div className='flex items-center gap-1.5'>
                {filterIndustry !== "all" && (
                  <Badge
                    variant='secondary'
                    className='h-7 gap-1 text-xs px-2 cursor-pointer hover:bg-secondary/80'
                    onClick={() => setFilterIndustry("all")}
                  >
                    {filterIndustry}
                    <X className='h-3 w-3' />
                  </Badge>
                )}
                {filterStatus !== "all" && (
                  <Badge
                    variant='secondary'
                    className='h-7 gap-1 text-xs px-2 capitalize cursor-pointer hover:bg-secondary/80'
                    onClick={() => setFilterStatus("all")}
                  >
                    {filterStatus}
                    <X className='h-3 w-3' />
                  </Badge>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setFilterIndustry("all");
                    setFilterStatus("all");
                  }}
                  className='h-7 px-2 text-xs'
                >
                  Clear
                </Button>
              </div>
            </>
          )}

          {/* Spacer */}
          <div className='flex-1' />

          {/* Right Actions */}
          <div className='flex items-center gap-2'>
            {/* Results Count */}
            {(searchQuery || filterIndustry !== "all" || filterStatus !== "all") && (
              <>
                <span className='text-xs font-medium text-muted-foreground'>
                  {filteredAndSortedClients.length}/{clients.length}
                </span>
                <Separator orientation='vertical' className='h-6' />
              </>
            )}

            {/* Import/Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='h-9 px-3 gap-1.5'>
                  <Download className='h-3.5 w-3.5' />
                  <span className='text-xs'>Import/Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={handleImportClick}>
                  <Upload className='h-4 w-4 mr-2' />
                  Import from CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV}>
                  <Download className='h-4 w-4 mr-2' />
                  Export to CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation='vertical' className='h-6' />

            {/* View Mode Selector */}
            <ButtonGroup>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "outline"}
                    size='sm'
                    onClick={() => setViewMode("list")}
                    className='h-9 w-9 p-0'
                  >
                    <List className='h-3.5 w-3.5' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List View</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "outline"}
                    size='sm'
                    onClick={() => setViewMode("grid")}
                    className='h-9 w-9 p-0'
                  >
                    <Grid3x3 className='h-3.5 w-3.5' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid View</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "compact" ? "secondary" : "outline"}
                    size='sm'
                    onClick={() => setViewMode("compact")}
                    className='h-9 w-9 p-0'
                  >
                    <Rows3 className='h-3.5 w-3.5' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Compact View</TooltipContent>
              </Tooltip>
            </ButtonGroup>
          </div>
        </div>

        <Separator className='my-0' />

        {/* Bulk Actions */}
        {selectedClients.size > 0 && (
          <Card className='border-2 border-primary'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <p className='text-sm font-medium'>
                  {selectedClients.size} client(s) selected
                </p>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setSelectedClients(new Set())}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={handleBulkDelete}
                    className='gap-2'
                  >
                    <Trash2 className='h-4 w-4' />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <div className='text-center space-y-3'>
            <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto' />
            <p className='text-muted-foreground'>Loading clients...</p>
          </div>
        </div>
      ) : filteredAndSortedClients.length === 0 ? (
        <Empty className='border-2 border-dashed'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <Building2 />
            </EmptyMedia>
            <EmptyTitle>
              {searchQuery || filterIndustry !== "all" || filterStatus !== "all"
                ? "No clients found"
                : "No clients yet"}
            </EmptyTitle>
            <EmptyDescription>
              {searchQuery || filterIndustry !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Get started by adding your first client to begin managing your client relationships."}
            </EmptyDescription>
          </EmptyHeader>
          {!searchQuery && filterIndustry === "all" && filterStatus === "all" && (
            <EmptyContent>
              <Button onClick={() => setIsDialogOpen(true)} size='lg' className='gap-2'>
                <Plus className='h-4 w-4' />
                Add Your First Client
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <>
          {/* List View */}
          {viewMode === "list" && (
            <div className='space-y-1'>
              {filteredAndSortedClients.map((client) => (
                <Card
                  key={client.id}
                  className='group hover:shadow-md transition-all duration-150 border hover:border-primary/40'
                >
                  <CardContent className='p-2'>
                    <div className='flex items-center gap-2.5'>
                      {/* Checkbox */}
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-7 w-7 p-0 hover:bg-muted rounded'
                        onClick={() => handleSelectClient(client.id)}
                      >
                        {selectedClients.has(client.id) ? (
                          <CheckSquare className='h-4 w-4 text-primary' />
                        ) : (
                          <Square className='h-4 w-4 text-muted-foreground/40' />
                        )}
                      </Button>

                      {/* Avatar & Client Info */}
                      <div className='flex items-center gap-2.5 flex-1 min-w-0'>
                        <Avatar
                          className={`h-10 w-10 bg-gradient-to-br ${getAvatarColor(
                            client.id
                          )} ring-2 ring-background shadow`}
                        >
                          <AvatarFallback className='bg-transparent text-white font-bold text-xs'>
                            {getInitials(client.name, client.companyName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 flex-wrap'>
                            <h3 className='font-bold text-sm truncate text-foreground'>
                              {client.name}
                            </h3>
                            {client.companyName && (
                              <>
                                <span className='text-muted-foreground/60 text-xs'>
                                  ·
                                </span>
                                <span className='text-xs font-medium text-muted-foreground/90 truncate'>
                                  {client.companyName}
                                </span>
                              </>
                            )}
                            {client.isActive && (
                              <Badge
                                variant='default'
                                className='text-[10px] px-1.5 py-0.5 font-semibold'
                              >
                                Active
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contact Info & Industry */}
                      <div className='hidden lg:flex items-center gap-4'>
                        <div className='flex items-center gap-3'>
                          {/* Email Section - Fixed Width */}
                          <div className='flex items-center gap-2 w-[220px] shrink-0'>
                            <div className='h-7 w-7 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0'>
                              <Mail className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
                            </div>
                            <span className='truncate text-xs font-medium text-foreground/80'>
                              {client.email}
                            </span>
                          </div>
                          {/* Phone Section - Fixed Width */}
                          <div className='flex items-center gap-2 w-[180px] shrink-0'>
                            <div className='h-7 w-7 rounded-md bg-green-500/10 flex items-center justify-center shrink-0'>
                              {client.phone ? (
                                <Phone className='h-3.5 w-3.5 text-green-600 dark:text-green-400' />
                              ) : (
                                <span className='text-xs text-muted-foreground'>—</span>
                              )}
                            </div>
                            <span className='text-xs font-medium text-foreground/80 truncate'>
                              {client.phone || "—"}
                            </span>
                          </div>
                        </div>

                        {client.industry && (
                          <Badge
                            variant='secondary'
                            className='text-[10px] px-2.5 py-1 font-semibold'
                          >
                            {client.industry}
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className='flex items-center gap-1'>
                        <Link href={`/clients/${client.id}`}>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='gap-1.5 h-7 px-2.5 hover:bg-primary/10 hover:text-primary transition-colors'
                          >
                            <Eye className='h-3.5 w-3.5' />
                            <span className='hidden xl:inline text-xs font-medium'>
                              View
                            </span>
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-7 w-7 p-0 hover:bg-muted'
                            >
                              <MoreHorizontal className='h-3.5 w-3.5' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem asChild>
                              <Link href={`/clients/${client.id}`}>
                                <Eye className='h-4 w-4 mr-2' />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className='text-destructive'
                              onClick={() => setClientToDelete(client)}
                            >
                              <Trash2 className='h-4 w-4 mr-2' />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {filteredAndSortedClients.map((client) => (
                <Card
                  key={client.id}
                  className='hover:shadow-md transition-all border-2 hover:border-primary/50 relative'
                >
                  <div className='absolute top-4 left-4 z-10'>
                    <Button
                      variant='secondary'
                      size='sm'
                      className='h-6 w-6 p-0 rounded-full'
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelectClient(client.id);
                      }}
                    >
                      {selectedClients.has(client.id) ? (
                        <CheckSquare className='h-3 w-3 text-primary' />
                      ) : (
                        <Square className='h-3 w-3' />
                      )}
                    </Button>
                  </div>
                  <Link href={`/clients/${client.id}`}>
                    <CardContent className='p-6'>
                      <div className='flex flex-col items-center text-center mb-4'>
                        <Avatar
                          className={`h-16 w-16 mb-3 bg-gradient-to-br ${getAvatarColor(
                            client.id
                          )}`}
                        >
                          <AvatarFallback className='bg-transparent text-white font-semibold text-lg'>
                            {getInitials(client.name, client.companyName)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className='font-semibold text-lg'>{client.name}</h3>
                        {client.companyName && (
                          <p className='text-sm text-muted-foreground'>
                            {client.companyName}
                          </p>
                        )}
                        {client.isActive && (
                          <Badge variant='default' className='mt-2 text-xs'>
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className='space-y-2 text-sm'>
                        <div className='flex items-center gap-2 text-muted-foreground'>
                          <Mail className='h-4 w-4 flex-shrink-0' />
                          <span className='truncate'>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className='flex items-center gap-2 text-muted-foreground'>
                            <Phone className='h-4 w-4 flex-shrink-0' />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.website && (
                          <div className='flex items-center gap-2 text-muted-foreground'>
                            <Globe className='h-4 w-4 flex-shrink-0' />
                            <span className='truncate'>{client.website}</span>
                          </div>
                        )}
                        {client.city && (
                          <div className='flex items-center gap-2 text-muted-foreground'>
                            <MapPin className='h-4 w-4 flex-shrink-0' />
                            <span>
                              {client.city}
                              {client.state && `, ${client.state}`}
                            </span>
                          </div>
                        )}
                        {client.industry && (
                          <div className='mt-3 flex justify-center'>
                            <Badge variant='secondary' className='text-xs'>
                              {client.industry}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}

          {/* Compact View */}
          {viewMode === "compact" && (
            <Card className='border-2'>
              <CardContent className='p-0'>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead className='bg-muted/50 border-b'>
                      <tr>
                        <th className='text-left p-4 font-medium text-sm'>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-6 w-6 p-0'
                            onClick={handleSelectAll}
                          >
                            {selectedClients.size === filteredAndSortedClients.length ? (
                              <CheckSquare className='h-4 w-4 text-primary' />
                            ) : (
                              <Square className='h-4 w-4' />
                            )}
                          </Button>
                        </th>
                        <th className='text-left p-4 font-medium text-sm'>Client</th>
                        <th className='text-left p-4 font-medium text-sm'>Email</th>
                        <th className='text-left p-4 font-medium text-sm hidden md:table-cell'>
                          Phone
                        </th>
                        <th className='text-left p-4 font-medium text-sm hidden lg:table-cell'>
                          Industry
                        </th>
                        <th className='text-left p-4 font-medium text-sm hidden lg:table-cell'>
                          Location
                        </th>
                        <th className='text-left p-4 font-medium text-sm'>Status</th>
                        <th className='text-right p-4 font-medium text-sm'>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedClients.map((client, index) => (
                        <tr
                          key={client.id}
                          className={`border-b hover:bg-muted/50 transition-colors ${
                            index % 2 === 0 ? "bg-muted/20" : ""
                          }`}
                        >
                          <td className='p-4'>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-6 w-6 p-0'
                              onClick={() => handleSelectClient(client.id)}
                            >
                              {selectedClients.has(client.id) ? (
                                <CheckSquare className='h-4 w-4 text-primary' />
                              ) : (
                                <Square className='h-4 w-4' />
                              )}
                            </Button>
                          </td>
                          <td className='p-4'>
                            <div className='flex items-center gap-3'>
                              <Avatar
                                className={`h-8 w-8 bg-gradient-to-br ${getAvatarColor(
                                  client.id
                                )}`}
                              >
                                <AvatarFallback className='bg-transparent text-white text-xs font-semibold'>
                                  {getInitials(client.name, client.companyName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className='min-w-0'>
                                <p className='font-medium truncate'>{client.name}</p>
                                {client.companyName && (
                                  <p className='text-xs text-muted-foreground truncate'>
                                    {client.companyName}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className='p-4'>
                            <span className='text-sm truncate block max-w-[200px]'>
                              {client.email}
                            </span>
                          </td>
                          <td className='p-4 hidden md:table-cell'>
                            <span className='text-sm'>{client.phone || "—"}</span>
                          </td>
                          <td className='p-4 hidden lg:table-cell'>
                            {client.industry ? (
                              <Badge variant='secondary' className='text-xs'>
                                {client.industry}
                              </Badge>
                            ) : (
                              <span className='text-sm text-muted-foreground'>—</span>
                            )}
                          </td>
                          <td className='p-4 hidden lg:table-cell'>
                            <span className='text-sm'>
                              {client.city
                                ? `${client.city}${
                                    client.state ? `, ${client.state}` : ""
                                  }`
                                : "—"}
                            </span>
                          </td>
                          <td className='p-4'>
                            <Badge
                              variant={client.isActive ? "default" : "secondary"}
                              className='text-xs'
                            >
                              {client.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className='p-4'>
                            <div className='flex items-center justify-end gap-2'>
                              <Link href={`/clients/${client.id}`}>
                                <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                                  <Eye className='h-4 w-4' />
                                </Button>
                              </Link>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-8 w-8 p-0'
                                  >
                                    <MoreHorizontal className='h-4 w-4' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/clients/${client.id}`}>
                                      <Eye className='h-4 w-4 mr-2' />
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className='text-destructive'
                                    onClick={() => setClientToDelete(client)}
                                  >
                                    <Trash2 className='h-4 w-4 mr-2' />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Import Preview Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className='w-[95vw] max-w-[1800px] max-h-[75vh] flex flex-col'>
          <DialogHeader>
            <div className='flex items-center gap-3'>
              <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center'>
                <Upload className='h-5 w-5 text-white' />
              </div>
              <div>
                <DialogTitle className='text-xl'>Import Clients from CSV</DialogTitle>
                <DialogDescription className='mt-1'>
                  Review and confirm the clients below before importing
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='flex-1 overflow-hidden flex flex-col gap-4 mt-2'>
            {/* Summary Card */}
            <div className='grid grid-cols-3 gap-3'>
              <Card className='border-2'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center'>
                      <Users className='h-5 w-5 text-blue-600' />
                    </div>
                    <div>
                      <p className='text-2xl font-bold'>{importPreviewData.length}</p>
                      <p className='text-xs text-muted-foreground'>Total Clients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='border-2'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center'>
                      <CheckSquare className='h-5 w-5 text-green-600' />
                    </div>
                    <div>
                      <p className='text-2xl font-bold'>
                        {importPreviewData.filter((c) => c.email && c.name).length}
                      </p>
                      <p className='text-xs text-muted-foreground'>Valid Entries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='border-2'>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center'>
                      <Building2 className='h-5 w-5 text-purple-600' />
                    </div>
                    <div>
                      <p className='text-2xl font-bold'>
                        {importPreviewData.filter((c) => c.companyName).length}
                      </p>
                      <p className='text-xs text-muted-foreground'>With Company</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info Banner */}
            <div className='flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
              <div className='h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5'>
                <span className='text-white text-xs font-bold'>i</span>
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                  Import Requirements
                </p>
                <p className='text-xs text-blue-800/80 dark:text-blue-200/80 mt-1'>
                  Only rows with both <strong>Name</strong> and <strong>Email</strong>{" "}
                  will be imported. Optional fields include Company, Phone, Industry, and
                  Location.
                </p>
              </div>
            </div>

            {/* Preview Table */}
            <Card className='border-2 flex-1 overflow-hidden flex flex-col'>
              <CardContent className='p-0 flex-1 overflow-hidden flex flex-col'>
                <div className='flex-1 overflow-auto'>
                  <table className='w-full'>
                    <thead className='bg-muted/50 border-b sticky top-0 z-10'>
                      <tr>
                        <th className='text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide'>
                          #
                        </th>
                        <th className='text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide'>
                          Name
                        </th>
                        <th className='text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide'>
                          Company
                        </th>
                        <th className='text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide'>
                          Email
                        </th>
                        <th className='text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide'>
                          Phone
                        </th>
                        <th className='text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide'>
                          Industry
                        </th>
                        <th className='text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide'>
                          Location
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y'>
                      {importPreviewData.map((client, index) => (
                        <tr key={index} className='hover:bg-muted/30 transition-colors'>
                          <td className='px-4 py-3 text-sm text-muted-foreground'>
                            {index + 1}
                          </td>
                          <td className='px-4 py-3'>
                            <span className='text-sm font-medium'>
                              {client.name || (
                                <span className='text-muted-foreground'>—</span>
                              )}
                            </span>
                          </td>
                          <td className='px-4 py-3 text-sm'>
                            {client.companyName || (
                              <span className='text-muted-foreground'>—</span>
                            )}
                          </td>
                          <td className='px-4 py-3'>
                            <span className='text-sm font-mono text-blue-600 dark:text-blue-400'>
                              {client.email || (
                                <span className='text-muted-foreground'>—</span>
                              )}
                            </span>
                          </td>
                          <td className='px-4 py-3 text-sm'>
                            {client.phone || (
                              <span className='text-muted-foreground'>—</span>
                            )}
                          </td>
                          <td className='px-4 py-3'>
                            {client.industry ? (
                              <Badge variant='secondary' className='text-xs'>
                                {client.industry}
                              </Badge>
                            ) : (
                              <span className='text-sm text-muted-foreground'>—</span>
                            )}
                          </td>
                          <td className='px-4 py-3 text-sm'>
                            {client.city || client.state ? (
                              <span>
                                {client.city}
                                {client.city && client.state && ", "}
                                {client.state}
                              </span>
                            ) : (
                              <span className='text-muted-foreground'>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className='flex items-center justify-between pt-4 border-t'>
            <p className='text-sm text-muted-foreground'>
              {importPreviewData.length} client{importPreviewData.length !== 1 ? "s" : ""}{" "}
              will be added to your workspace
            </p>
            <div className='flex gap-3'>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setIsImportDialogOpen(false);
                  setImportPreviewData([]);
                }}
                disabled={isImporting}
                size='lg'
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={isImporting}
                size='lg'
                className='gap-2 min-w-[140px]'
              >
                {isImporting ? (
                  <>
                    <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className='h-4 w-4' />
                    Import All
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={clientToDelete !== null}
        onOpenChange={(open) => !open && setClientToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {clientToDelete?.name}? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clientToDelete && handleDelete(clientToDelete)}
              className='bg-destructive hover:bg-destructive/90'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
