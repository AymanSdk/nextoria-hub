"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Building2,
  Mail,
  Phone,
  Shield,
  Calendar,
  Globe,
  MapPin,
  List,
  Grid3x3,
  Rows3,
  UserPlus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { InviteTeamMemberDialog } from "@/components/team/invite-team-member-dialog";
import { TeamMemberActions } from "@/components/team/team-member-actions";
import { PendingInvitations } from "@/components/team/pending-invitations";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  memberRole?: string | null;
  joinedAt?: Date | null;
}

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

interface TeamBrowserProps {
  initialTeamMembers: TeamMember[];
  currentUserId: string;
}

type ViewMode = "list" | "grid" | "compact";

export function TeamBrowser({ initialTeamMembers, currentUserId }: TeamBrowserProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("team");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [clientFormData, setClientFormData] = useState({
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
    fetchClients();
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

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const workspaceRes = await fetch("/api/workspaces");
      const workspaceData = await workspaceRes.json();
      const workspaceId = workspaceData.workspaces[0]?.id;

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...clientFormData,
          workspaceId,
        }),
      });

      if (res.ok) {
        setIsClientDialogOpen(false);
        setClientFormData({
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
        toast.success("Client added successfully!");
      }
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error("Failed to create client");
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === "ADMIN") return "default";
    if (role === "DEVELOPER") return "secondary";
    if (role === "DESIGNER") return "outline";
    if (role === "MARKETER") return "outline";
    if (role === "CLIENT") return "outline";
    return "outline";
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Team Members View Renderers
  const renderTeamListView = () => (
    <div className='space-y-2'>
      {teamMembers.map((member) => (
        <div
          key={member.id}
          className='group flex items-center gap-3 p-3 border rounded-lg bg-white dark:bg-neutral-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-800 transition-all'
        >
          <Avatar className='h-10 w-10'>
            <AvatarImage src={member.image || undefined} />
            <AvatarFallback>
              {member.name?.substring(0, 2).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>

          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-0.5'>
              <h4 className='font-medium text-sm'>{member.name || "Unknown"}</h4>
              {!member.isActive && (
                <Badge variant='destructive' className='text-xs'>
                  Inactive
                </Badge>
              )}
            </div>
            <div className='flex items-center gap-2 text-xs text-neutral-500 flex-wrap'>
              <span className='flex items-center gap-1'>
                <Mail className='h-3 w-3' />
                <span className='hidden sm:inline'>{member.email}</span>
              </span>
              <span className='hidden sm:inline'>•</span>
              <span className='hidden sm:inline'>
                Joined {formatDate(member.joinedAt)}
              </span>
            </div>
          </div>

          <Badge variant={getRoleBadgeVariant(member.role)} className='shrink-0'>
            {member.role}
          </Badge>

          <TeamMemberActions
            memberId={member.id}
            memberName={member.name || member.email}
            isActive={member.isActive}
            currentUserId={currentUserId}
          />
        </div>
      ))}
    </div>
  );

  const renderTeamGridView = () => (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
      {teamMembers.map((member) => (
        <div
          key={member.id}
          className='group flex flex-col p-4 border rounded-lg bg-white dark:bg-neutral-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-800 transition-all'
        >
          <div className='flex flex-col items-center mb-3'>
            <Avatar className='h-16 w-16 mb-2'>
              <AvatarImage src={member.image || undefined} />
              <AvatarFallback>
                {member.name?.substring(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            <h4 className='font-medium text-sm text-center line-clamp-1 w-full'>
              {member.name || "Unknown"}
            </h4>
            <p className='text-xs text-neutral-500 text-center truncate w-full'>
              {member.email}
            </p>
          </div>

          <div className='flex flex-col gap-1 text-xs text-neutral-500 mt-auto'>
            <Badge
              variant={getRoleBadgeVariant(member.role)}
              className='text-xs text-center'
            >
              {member.role}
            </Badge>
            {!member.isActive && (
              <Badge variant='destructive' className='text-xs'>
                Inactive
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTeamCompactView = () => (
    <div className='border rounded-lg overflow-hidden bg-white dark:bg-neutral-900'>
      <div className='grid grid-cols-12 gap-4 px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border-b text-xs font-medium text-neutral-600 dark:text-neutral-400'>
        <div className='col-span-4'>Name</div>
        <div className='col-span-3 hidden md:block'>Email</div>
        <div className='col-span-2 hidden lg:block'>Role</div>
        <div className='col-span-2 hidden lg:block'>Joined</div>
        <div className='col-span-1'>Actions</div>
      </div>

      <div className='divide-y dark:divide-neutral-800'>
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className='group grid grid-cols-12 gap-4 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors'
          >
            <div className='col-span-4 flex items-center gap-2 min-w-0'>
              <Avatar className='h-7 w-7'>
                <AvatarImage src={member.image || undefined} />
                <AvatarFallback className='text-xs'>
                  {member.name?.substring(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              <span className='text-sm truncate'>{member.name || "Unknown"}</span>
            </div>

            <div className='col-span-3 hidden md:flex items-center text-xs text-neutral-600 dark:text-neutral-400 truncate'>
              {member.email}
            </div>

            <div className='col-span-2 hidden lg:flex items-center'>
              <Badge variant={getRoleBadgeVariant(member.role)} className='text-xs'>
                {member.role}
              </Badge>
            </div>

            <div className='col-span-2 hidden lg:flex items-center text-xs text-neutral-600 dark:text-neutral-400'>
              {formatDate(member.joinedAt)}
            </div>

            <div className='col-span-1 flex items-center justify-end'>
              <TeamMemberActions
                memberId={member.id}
                memberName={member.name || member.email}
                isActive={member.isActive}
                currentUserId={currentUserId}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Clients View Renderers
  const renderClientsListView = () => (
    <div className='space-y-4'>
      {clients.map((client) => (
        <Link key={client.id} href={`/clients/${client.id}`}>
          <div className='group flex items-center gap-4 p-4 border rounded-lg bg-white dark:bg-neutral-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer'>
            <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0'>
              <Building2 className='h-5 w-5 text-white' />
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-0.5'>
                <h4 className='font-medium text-sm'>{client.name}</h4>
                {client.isActive && (
                  <Badge variant='default' className='text-xs'>
                    Active
                  </Badge>
                )}
              </div>
              <div className='flex items-center gap-2 text-xs text-neutral-500 flex-wrap'>
                {client.companyName && (
                  <>
                    <span className='flex items-center gap-1'>
                      <Building2 className='h-3 w-3' />
                      <span className='hidden sm:inline'>{client.companyName}</span>
                    </span>
                    <span className='hidden sm:inline'>•</span>
                  </>
                )}
                <span className='flex items-center gap-1'>
                  <Mail className='h-3 w-3' />
                  <span className='hidden sm:inline'>{client.email}</span>
                </span>
                {client.industry && (
                  <>
                    <span className='hidden md:inline'>•</span>
                    <span className='hidden md:inline'>{client.industry}</span>
                  </>
                )}
              </div>
            </div>

            {client.city && (
              <div className='hidden lg:flex items-center gap-1 text-xs text-neutral-500'>
                <MapPin className='h-3 w-3' />
                <span>
                  {client.city}
                  {client.state && `, ${client.state}`}
                </span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );

  const renderClientsGridView = () => (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
      {clients.map((client) => (
        <Link key={client.id} href={`/clients/${client.id}`}>
          <div className='group flex flex-col p-5 border rounded-lg bg-white dark:bg-neutral-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer h-full'>
            <div className='flex items-start gap-3 mb-3'>
              <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0'>
                <Building2 className='h-6 w-6 text-white' />
              </div>
              <div className='flex-1 min-w-0'>
                <h4 className='font-medium text-sm line-clamp-1'>{client.name}</h4>
                {client.companyName && (
                  <p className='text-xs text-neutral-500 line-clamp-1'>
                    {client.companyName}
                  </p>
                )}
              </div>
            </div>

            <div className='space-y-1.5 text-xs flex-1'>
              <div className='flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400'>
                <Mail className='h-3 w-3 shrink-0' />
                <span className='truncate'>{client.email}</span>
              </div>
              {client.phone && (
                <div className='flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400'>
                  <Phone className='h-3 w-3 shrink-0' />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.city && (
                <div className='flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400'>
                  <MapPin className='h-3 w-3 shrink-0' />
                  <span>
                    {client.city}
                    {client.state && `, ${client.state}`}
                  </span>
                </div>
              )}
            </div>

            <div className='mt-3 pt-3 border-t flex items-center justify-between'>
              {client.industry && (
                <Badge variant='secondary' className='text-xs'>
                  {client.industry}
                </Badge>
              )}
              {client.isActive && (
                <Badge variant='default' className='text-xs ml-auto'>
                  Active
                </Badge>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  const renderClientsCompactView = () => (
    <div className='border rounded-lg overflow-hidden bg-white dark:bg-neutral-900'>
      <div className='grid grid-cols-12 gap-4 px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border-b text-xs font-medium text-neutral-600 dark:text-neutral-400'>
        <div className='col-span-3'>Name</div>
        <div className='col-span-2 hidden md:block'>Company</div>
        <div className='col-span-3 hidden lg:block'>Email</div>
        <div className='col-span-2 hidden lg:block'>Location</div>
        <div className='col-span-2'>Industry</div>
      </div>

      <div className='divide-y dark:divide-neutral-800'>
        {clients.map((client) => (
          <Link key={client.id} href={`/clients/${client.id}`}>
            <div className='group grid grid-cols-12 gap-4 px-4 py-3.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer'>
              <div className='col-span-3 flex items-center gap-2 min-w-0'>
                <div className='h-7 w-7 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0'>
                  <Building2 className='h-4 w-4 text-white' />
                </div>
                <span className='text-sm truncate'>{client.name}</span>
              </div>

              <div className='col-span-2 hidden md:flex items-center text-xs text-neutral-600 dark:text-neutral-400 truncate'>
                {client.companyName || "-"}
              </div>

              <div className='col-span-3 hidden lg:flex items-center text-xs text-neutral-600 dark:text-neutral-400 truncate'>
                {client.email}
              </div>

              <div className='col-span-2 hidden lg:flex items-center text-xs text-neutral-600 dark:text-neutral-400 truncate'>
                {client.city
                  ? `${client.city}${client.state ? `, ${client.state}` : ""}`
                  : "-"}
              </div>

              <div className='col-span-2 flex items-center'>
                {client.industry ? (
                  <Badge variant='secondary' className='text-xs truncate'>
                    {client.industry}
                  </Badge>
                ) : (
                  <span className='text-xs text-neutral-400'>-</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'>
        {/* Total Team Members */}
        <Card className='group relative overflow-hidden border-0 bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500' />
          <CardContent className='p-3.5 relative'>
            <div className='flex items-center justify-between mb-2'>
              <div className='p-2 rounded-lg bg-white/80 dark:bg-neutral-900/80 shadow-sm ring-1 ring-blue-500/20'>
                <Users className='h-4 w-4 text-blue-600 dark:text-blue-400' />
              </div>
              <div className='text-right'>
                <div className='text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100'>
                  {teamMembers.length}
                </div>
                <div className='text-[9px] sm:text-[10px] font-medium text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wide'>
                  Team Members
                </div>
              </div>
            </div>
            <div className='flex items-center gap-1.5 text-[9px] sm:text-[10px] text-blue-700/60 dark:text-blue-300/60'>
              <span className='flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/60 dark:bg-neutral-900/60'>
                <Shield className='h-2.5 w-2.5' />
                <span>{teamMembers.filter((m) => m.isActive).length} Active</span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Admins */}
        <Card className='group relative overflow-hidden border-0 bg-linear-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500' />
          <CardContent className='p-3.5 relative'>
            <div className='flex items-center justify-between mb-2'>
              <div className='p-2 rounded-lg bg-white/80 dark:bg-neutral-900/80 shadow-sm ring-1 ring-purple-500/20'>
                <Shield className='h-4 w-4 text-purple-600 dark:text-purple-400' />
              </div>
              <div className='text-right'>
                <div className='text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100'>
                  {teamMembers.filter((m) => m.role === "ADMIN").length}
                </div>
                <div className='text-[9px] sm:text-[10px] font-medium text-purple-600/70 dark:text-purple-400/70 uppercase tracking-wide'>
                  Admins
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Clients */}
        <Card className='group relative overflow-hidden border-0 bg-linear-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500' />
          <CardContent className='p-3.5 relative'>
            <div className='flex items-center justify-between mb-2'>
              <div className='p-2 rounded-lg bg-white/80 dark:bg-neutral-900/80 shadow-sm ring-1 ring-green-500/20'>
                <Building2 className='h-4 w-4 text-green-600 dark:text-green-400' />
              </div>
              <div className='text-right'>
                <div className='text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100'>
                  {clients.length}
                </div>
                <div className='text-[9px] sm:text-[10px] font-medium text-green-600/70 dark:text-green-400/70 uppercase tracking-wide'>
                  Clients
                </div>
              </div>
            </div>
            <div className='flex items-center gap-1.5 text-[9px] sm:text-[10px] text-green-700/60 dark:text-green-300/60'>
              <span className='flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/60 dark:bg-neutral-900/60'>
                <span>{clients.filter((c) => c.isActive).length} Active</span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Developers */}
        <Card className='group relative overflow-hidden border-0 bg-linear-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500' />
          <CardContent className='p-3.5 relative'>
            <div className='flex items-center justify-between mb-2'>
              <div className='p-2 rounded-lg bg-white/80 dark:bg-neutral-900/80 shadow-sm ring-1 ring-orange-500/20'>
                <Users className='h-4 w-4 text-orange-600 dark:text-orange-400' />
              </div>
              <div className='text-right'>
                <div className='text-xl sm:text-2xl font-bold text-orange-900 dark:text-orange-100'>
                  {teamMembers.filter((m) => m.role === "DEVELOPER").length}
                </div>
                <div className='text-[9px] sm:text-[10px] font-medium text-orange-600/70 dark:text-orange-400/70 uppercase tracking-wide'>
                  Developers
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invitations */}
      <PendingInvitations />

      {/* Tabs with View Modes */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
        <div className='flex items-center justify-between gap-4'>
          <TabsList>
            <TabsTrigger value='team'>
              <Users className='mr-2 h-4 w-4' />
              Team Members ({teamMembers.length})
            </TabsTrigger>
            <TabsTrigger value='clients'>
              <Building2 className='mr-2 h-4 w-4' />
              Clients ({clients.length})
            </TabsTrigger>
          </TabsList>

          {/* View Mode Switcher & Action Buttons */}
          <div className='flex items-center gap-2'>
            {/* View Switcher */}
            <div className='flex items-center border rounded-lg bg-white dark:bg-neutral-900'>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size='sm'
                onClick={() => setViewMode("list")}
                className='rounded-r-none'
                title='List View'
              >
                <List className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size='sm'
                onClick={() => setViewMode("grid")}
                className='rounded-none border-x'
                title='Grid View'
              >
                <Grid3x3 className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === "compact" ? "secondary" : "ghost"}
                size='sm'
                onClick={() => setViewMode("compact")}
                className='rounded-l-none'
                title='Compact View'
              >
                <Rows3 className='h-4 w-4' />
              </Button>
            </div>

            {/* Action Button */}
            {activeTab === "team" ? (
              <InviteTeamMemberDialog />
            ) : (
              <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className='mr-2 h-4 w-4' />
                    <span className='hidden sm:inline'>Add Client</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                  <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>
                      Add a new client to your workspace
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleClientSubmit} className='space-y-4 mt-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='name'>
                          Contact Name <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                          id='name'
                          value={clientFormData.name}
                          onChange={(e) =>
                            setClientFormData({ ...clientFormData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='companyName'>Company Name</Label>
                        <Input
                          id='companyName'
                          value={clientFormData.companyName}
                          onChange={(e) =>
                            setClientFormData({
                              ...clientFormData,
                              companyName: e.target.value,
                            })
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
                          value={clientFormData.email}
                          onChange={(e) =>
                            setClientFormData({
                              ...clientFormData,
                              email: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='phone'>Phone</Label>
                        <Input
                          id='phone'
                          value={clientFormData.phone}
                          onChange={(e) =>
                            setClientFormData({
                              ...clientFormData,
                              phone: e.target.value,
                            })
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
                          value={clientFormData.website}
                          onChange={(e) =>
                            setClientFormData({
                              ...clientFormData,
                              website: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='industry'>Industry</Label>
                        <Input
                          id='industry'
                          value={clientFormData.industry}
                          onChange={(e) =>
                            setClientFormData({
                              ...clientFormData,
                              industry: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='address'>Address</Label>
                      <Input
                        id='address'
                        value={clientFormData.address}
                        onChange={(e) =>
                          setClientFormData({
                            ...clientFormData,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className='grid grid-cols-3 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='city'>City</Label>
                        <Input
                          id='city'
                          value={clientFormData.city}
                          onChange={(e) =>
                            setClientFormData({ ...clientFormData, city: e.target.value })
                          }
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='state'>State</Label>
                        <Input
                          id='state'
                          value={clientFormData.state}
                          onChange={(e) =>
                            setClientFormData({
                              ...clientFormData,
                              state: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='postalCode'>Postal Code</Label>
                        <Input
                          id='postalCode'
                          value={clientFormData.postalCode}
                          onChange={(e) =>
                            setClientFormData({
                              ...clientFormData,
                              postalCode: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='country'>Country</Label>
                      <Input
                        id='country'
                        value={clientFormData.country}
                        onChange={(e) =>
                          setClientFormData({
                            ...clientFormData,
                            country: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='notes'>Notes</Label>
                      <Textarea
                        id='notes'
                        value={clientFormData.notes}
                        onChange={(e) =>
                          setClientFormData({ ...clientFormData, notes: e.target.value })
                        }
                        rows={3}
                      />
                    </div>

                    <div className='flex justify-end gap-3'>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => setIsClientDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type='submit'>Create Client</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <TabsContent value='team' className='space-y-4'>
          {teamMembers.length === 0 ? (
            <Card className='p-12'>
              <div className='text-center'>
                <Users className='mx-auto h-12 w-12 text-neutral-400' />
                <h3 className='mt-4 text-lg font-semibold'>No team members yet</h3>
                <p className='mt-2 text-neutral-500'>
                  Get started by inviting your first team member
                </p>
              </div>
            </Card>
          ) : (
            <>
              {viewMode === "grid" && renderTeamGridView()}
              {viewMode === "compact" && renderTeamCompactView()}
              {viewMode === "list" && renderTeamListView()}
            </>
          )}
        </TabsContent>

        <TabsContent value='clients' className='space-y-4'>
          {loading ? (
            <div className='space-y-3'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='animate-pulse flex items-center gap-4 p-4 border rounded-lg'
                >
                  <div className='h-10 w-10 bg-neutral-200 dark:bg-neutral-800 rounded'></div>
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4'></div>
                    <div className='h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2'></div>
                  </div>
                </div>
              ))}
            </div>
          ) : clients.length === 0 ? (
            <Card className='p-12'>
              <div className='text-center'>
                <Building2 className='mx-auto h-12 w-12 text-neutral-400' />
                <h3 className='mt-4 text-lg font-semibold'>No clients yet</h3>
                <p className='mt-2 text-neutral-500'>
                  Get started by adding your first client
                </p>
                <Button className='mt-4' onClick={() => setIsClientDialogOpen(true)}>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Client
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {viewMode === "grid" && renderClientsGridView()}
              {viewMode === "compact" && renderClientsCompactView()}
              {viewMode === "list" && renderClientsListView()}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
