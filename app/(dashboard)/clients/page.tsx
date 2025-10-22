"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      // First get workspace
      const workspaceRes = await fetch("/api/workspaces");
      const workspaceData = await workspaceRes.json();
      const workspaceId = workspaceData.workspaces[0]?.id;

      if (!workspaceId) return;

      const res = await fetch(`/api/clients?workspaceId=${workspaceId}`);
      const data = await res.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Get workspace
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
      }
    } catch (error) {
      console.error("Error creating client:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Clients</h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            Manage your client relationships and contact information
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Add a new client to your workspace
              </DialogDescription>
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
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
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
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className='flex justify-end gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type='submit'>Create Client</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients Grid */}
      {clients.length === 0 ? (
        <Card className='p-12'>
          <div className='text-center'>
            <Building2 className='mx-auto h-12 w-12 text-neutral-400' />
            <h3 className='mt-4 text-lg font-semibold'>No clients yet</h3>
            <p className='mt-2 text-neutral-500'>
              Get started by adding your first client
            </p>
            <Button className='mt-4' onClick={() => setIsDialogOpen(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Add Client
            </Button>
          </div>
        </Card>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {clients.map((client) => (
            <Card key={client.id} className='hover:shadow-md transition-shadow'>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center'>
                      <Building2 className='h-6 w-6 text-white' />
                    </div>
                    <div>
                      <CardTitle className='text-lg'>{client.name}</CardTitle>
                      {client.companyName && (
                        <p className='text-sm text-neutral-500'>
                          {client.companyName}
                        </p>
                      )}
                    </div>
                  </div>
                  {client.isActive && (
                    <Badge variant='default' className='text-xs'>
                      Active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='space-y-2 text-sm'>
                  <div className='flex items-center gap-2 text-neutral-600 dark:text-neutral-400'>
                    <Mail className='h-4 w-4' />
                    <span className='truncate'>{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className='flex items-center gap-2 text-neutral-600 dark:text-neutral-400'>
                      <Phone className='h-4 w-4' />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.website && (
                    <div className='flex items-center gap-2 text-neutral-600 dark:text-neutral-400'>
                      <Globe className='h-4 w-4' />
                      <a
                        href={client.website}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='truncate hover:underline'>
                        {client.website}
                      </a>
                    </div>
                  )}
                  {client.city && (
                    <div className='flex items-center gap-2 text-neutral-600 dark:text-neutral-400'>
                      <MapPin className='h-4 w-4' />
                      <span>
                        {client.city}
                        {client.state && `, ${client.state}`}
                      </span>
                    </div>
                  )}
                  {client.industry && (
                    <div className='mt-2'>
                      <Badge variant='secondary' className='text-xs'>
                        {client.industry}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className='flex items-center gap-2 pt-3 border-t'>
                  <Link href={`/clients/${client.id}`} className='flex-1'>
                    <Button variant='outline' size='sm' className='w-full'>
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
