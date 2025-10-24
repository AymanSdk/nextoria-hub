"use client";

import { useState, useEffect, useMemo } from "react";
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
  SlidersHorizontal,
  Download,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckSquare,
  Square,
  Users,
  TrendingUp,
  Activity,
  Calendar,
  Filter,
  X,
  FileSpreadsheet,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

interface ClientsBrowserProps {
  initialClients?: Client[];
}

type ViewMode = "list" | "grid" | "compact";
type SortField = "name" | "company" | "email" | "createdAt" | "industry";
type SortOrder = "asc" | "desc";

export function ClientsBrowser({ initialClients = [] }: ClientsBrowserProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
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

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card className='relative overflow-hidden border-2 hover:border-primary/50 transition-colors'>
            <div className='absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent' />
            <CardContent className='p-6 relative'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground font-medium'>
                    Total Clients
                  </p>
                  <p className='text-3xl font-bold'>{stats.total}</p>
                </div>
                <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center'>
                  <Building2 className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden border-2 hover:border-primary/50 transition-colors'>
            <div className='absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent' />
            <CardContent className='p-6 relative'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground font-medium'>Active</p>
                  <p className='text-3xl font-bold'>{stats.active}</p>
                </div>
                <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center'>
                  <Activity className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden border-2 hover:border-primary/50 transition-colors'>
            <div className='absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent' />
            <CardContent className='p-6 relative'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground font-medium'>This Month</p>
                  <p className='text-3xl font-bold'>{stats.thisMonth}</p>
                </div>
                <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center'>
                  <TrendingUp className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden border-2 hover:border-primary/50 transition-colors'>
            <div className='absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent' />
            <CardContent className='p-6 relative'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground font-medium'>Industries</p>
                  <p className='text-3xl font-bold'>{industries.length}</p>
                </div>
                <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center'>
                  <Users className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className='border-2'>
          <CardContent className='p-4'>
            <div className='flex flex-col lg:flex-row gap-4'>
              <div className='flex-1 relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search clients by name, company, email, industry, or location...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant={showFilters ? "default" : "outline"}
                  size='default'
                  onClick={() => setShowFilters(!showFilters)}
                  className='gap-2'
                >
                  <SlidersHorizontal className='h-4 w-4' />
                  Filters
                  {(filterIndustry !== "all" || filterStatus !== "all") && (
                    <Badge
                      variant='secondary'
                      className='ml-1 h-5 w-5 p-0 flex items-center justify-center'
                    >
                      {(filterIndustry !== "all" ? 1 : 0) +
                        (filterStatus !== "all" ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='default' className='gap-2'>
                      <Download className='h-4 w-4' />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={handleExportCSV}>
                      <FileSpreadsheet className='h-4 w-4 mr-2' />
                      Export as CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className='flex items-center gap-1 border rounded-md p-1'>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size='sm'
                    onClick={() => setViewMode("list")}
                    className='h-8 w-8 p-0'
                  >
                    <List className='h-4 w-4' />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size='sm'
                    onClick={() => setViewMode("grid")}
                    className='h-8 w-8 p-0'
                  >
                    <Grid3x3 className='h-4 w-4' />
                  </Button>
                  <Button
                    variant={viewMode === "compact" ? "secondary" : "ghost"}
                    size='sm'
                    onClick={() => setViewMode("compact")}
                    className='h-8 w-8 p-0'
                  >
                    <Rows3 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className='mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label>Industry</Label>
                  <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder='All Industries' />
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
                </div>
                <div className='space-y-2'>
                  <Label>Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder='All Statuses' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Statuses</SelectItem>
                      <SelectItem value='active'>Active</SelectItem>
                      <SelectItem value='inactive'>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label>Sort By</Label>
                  <div className='flex gap-2'>
                    <Select
                      value={sortField}
                      onValueChange={(value) => setSortField(value as SortField)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='name'>Name</SelectItem>
                        <SelectItem value='company'>Company</SelectItem>
                        <SelectItem value='email'>Email</SelectItem>
                        <SelectItem value='industry'>Industry</SelectItem>
                        <SelectItem value='createdAt'>Created</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant='outline'
                      size='default'
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className='px-3'
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Button>
                  </div>
                </div>
                {(filterIndustry !== "all" || filterStatus !== "all") && (
                  <div className='md:col-span-3 flex items-center justify-between'>
                    <p className='text-sm text-muted-foreground'>
                      {filteredAndSortedClients.length} of {clients.length} clients
                    </p>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        setFilterIndustry("all");
                        setFilterStatus("all");
                      }}
                      className='gap-2'
                    >
                      <X className='h-4 w-4' />
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
        <Card className='p-12'>
          <div className='text-center'>
            <Building2 className='mx-auto h-12 w-12 text-muted-foreground' />
            <h3 className='mt-4 text-lg font-semibold'>
              {searchQuery || filterIndustry !== "all" || filterStatus !== "all"
                ? "No clients found"
                : "No clients yet"}
            </h3>
            <p className='mt-2 text-muted-foreground'>
              {searchQuery || filterIndustry !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first client"}
            </p>
            {!searchQuery && filterIndustry === "all" && filterStatus === "all" && (
              <Button className='mt-4' onClick={() => setIsDialogOpen(true)}>
                <Plus className='mr-2 h-4 w-4' />
                Add Client
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          {/* List View */}
          {viewMode === "list" && (
            <div className='space-y-2'>
              {filteredAndSortedClients.map((client) => (
                <Card
                  key={client.id}
                  className='hover:shadow-md transition-all border-2 hover:border-primary/50'
                >
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-4'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0'
                        onClick={() => handleSelectClient(client.id)}
                      >
                        {selectedClients.has(client.id) ? (
                          <CheckSquare className='h-4 w-4 text-primary' />
                        ) : (
                          <Square className='h-4 w-4' />
                        )}
                      </Button>
                      <Avatar
                        className={`h-12 w-12 bg-gradient-to-br ${getAvatarColor(
                          client.id
                        )}`}
                      >
                        <AvatarFallback className='bg-transparent text-white font-semibold'>
                          {getInitials(client.name, client.companyName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <h3 className='font-semibold truncate'>{client.name}</h3>
                          {client.isActive && (
                            <Badge variant='default' className='text-xs'>
                              Active
                            </Badge>
                          )}
                        </div>
                        {client.companyName && (
                          <p className='text-sm text-muted-foreground truncate'>
                            {client.companyName}
                          </p>
                        )}
                      </div>
                      <div className='hidden md:flex items-center gap-4 text-sm text-muted-foreground'>
                        <div className='flex items-center gap-2'>
                          <Mail className='h-4 w-4' />
                          <span className='truncate max-w-[200px]'>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className='flex items-center gap-2'>
                            <Phone className='h-4 w-4' />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.industry && (
                          <Badge variant='secondary' className='text-xs'>
                            {client.industry}
                          </Badge>
                        )}
                      </div>
                      <div className='flex items-center gap-2'>
                        <Link href={`/clients/${client.id}`}>
                          <Button variant='ghost' size='sm' className='gap-2'>
                            <Eye className='h-4 w-4' />
                            View
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
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
