import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { clients, projects } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FolderKanban,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { InviteClientDialog } from "@/components/clients/invite-client-dialog";
import { ClientFilesSection } from "@/components/clients/client-files-section";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { clientId } = await params;

  // Fetch client
  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  if (!client) {
    notFound();
  }

  // Fetch client projects
  const clientProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
      status: projects.status,
      color: projects.color,
      description: projects.description,
    })
    .from(projects)
    .where(eq(projects.clientId, clientId));

  return (
    <div className='space-y-6'>
      {/* Client Header */}
      <div className='flex items-start gap-4'>
        <div className='h-20 w-20 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0'>
          <Building2 className='h-10 w-10 text-white' />
        </div>
        <div className='flex-1'>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>{client.name}</h1>
              {client.companyName && (
                <p className='text-xl text-neutral-600 dark:text-neutral-400 mt-1'>
                  {client.companyName}
                </p>
              )}
            </div>
            <div className='flex items-center gap-2'>
              <InviteClientDialog clientEmail={client.email} clientName={client.name} />
              {client.isActive && <Badge variant='default'>Active</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Client Info Grid */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center gap-3'>
              <Mail className='h-5 w-5 text-neutral-500' />
              <div>
                <p className='text-sm text-neutral-500'>Email</p>
                <a
                  href={`mailto:${client.email}`}
                  className='font-medium hover:underline'
                >
                  {client.email}
                </a>
              </div>
            </div>

            {client.phone && (
              <div className='flex items-center gap-3'>
                <Phone className='h-5 w-5 text-neutral-500' />
                <div>
                  <p className='text-sm text-neutral-500'>Phone</p>
                  <a href={`tel:${client.phone}`} className='font-medium hover:underline'>
                    {client.phone}
                  </a>
                </div>
              </div>
            )}

            {client.website && (
              <div className='flex items-center gap-3'>
                <Globe className='h-5 w-5 text-neutral-500' />
                <div>
                  <p className='text-sm text-neutral-500'>Website</p>
                  <a
                    href={client.website}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='font-medium hover:underline'
                  >
                    {client.website}
                  </a>
                </div>
              </div>
            )}

            {(client.address || client.city) && (
              <div className='flex items-center gap-3'>
                <MapPin className='h-5 w-5 text-neutral-500' />
                <div>
                  <p className='text-sm text-neutral-500'>Address</p>
                  <div className='font-medium'>
                    {client.address && <p>{client.address}</p>}
                    <p>
                      {[client.city, client.state, client.postalCode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {client.country && <p>{client.country}</p>}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {client.industry && (
              <div>
                <p className='text-sm text-neutral-500 mb-1'>Industry</p>
                <Badge variant='secondary'>{client.industry}</Badge>
              </div>
            )}

            {client.taxId && (
              <div>
                <p className='text-sm text-neutral-500'>Tax ID</p>
                <p className='font-medium'>{client.taxId}</p>
              </div>
            )}

            {client.notes && (
              <div>
                <p className='text-sm text-neutral-500 mb-1'>Notes</p>
                <p className='text-sm whitespace-pre-wrap'>{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client Projects */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Projects ({clientProjects.length})</span>
            <Link href='/projects/new'>
              <button className='text-sm text-blue-600 hover:underline'>
                + Add Project
              </button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientProjects.length === 0 ? (
            <div className='text-center py-8 text-neutral-500'>
              <FolderKanban className='h-12 w-12 mx-auto mb-2 opacity-50' />
              <p>No projects yet for this client</p>
            </div>
          ) : (
            <div className='grid gap-3 md:grid-cols-2'>
              {clientProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className='flex items-center gap-3 p-3 rounded-lg border hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors'
                >
                  <div
                    className='h-10 w-10 rounded-lg flex items-center justify-center shrink-0'
                    style={{ backgroundColor: project.color || "#0070f3" }}
                  >
                    <FolderKanban className='h-5 w-5 text-white' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium truncate'>{project.name}</p>
                    <p className='text-sm text-neutral-500 truncate'>
                      {project.description || "No description"}
                    </p>
                  </div>
                  <Badge variant='outline' className='text-xs shrink-0'>
                    {project.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Files */}
      <ClientFilesSection clientId={clientId} />
    </div>
  );
}
