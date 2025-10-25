import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { nanoid } from "nanoid";
import {
  Workflow,
  Plus,
  Sparkles,
  GitBranch,
  Users,
  Zap,
} from "lucide-react";

export default async function FlowchartIndexPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Generate a random room ID for quick start
  const randomRoomId = nanoid(10);

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Workflow className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Collaborative Flowchart Editor
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create beautiful flowcharts, diagrams, and process maps with your team in real-time
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                <GitBranch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-base">Multiple Node Types</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Start/End, Process, Decision, and custom nodes with beautiful styling
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg">
                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-base">Real-time Collaboration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Work together with your team on the same flowchart simultaneously
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-base">Powerful Features</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Import/export flows, snap to grid, properties panel, and more
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden border-2 hover:border-primary transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Plus className="h-5 w-5 text-primary" />
              <CardTitle>Create New Flowchart</CardTitle>
            </div>
            <CardDescription>
              Start with a fresh canvas and build your flowchart from scratch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" size="lg">
              <Link href={`/flowchart/${randomRoomId}`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Flowchart
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-2 hover:border-primary transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-bl-full" />
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <CardTitle>Quick Start Template</CardTitle>
            </div>
            <CardDescription>
              Begin with a pre-built flowchart template with example nodes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" size="lg" variant="outline">
              <Link href={`/flowchart/${randomRoomId}`}>
                <Sparkles className="mr-2 h-4 w-4" />
                Start with Template
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">💡 Pro Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Use the <strong>Node Palette</strong> on the left to quickly add different types of nodes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Click on any node to edit its properties in the <strong>Properties Panel</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Press <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">Delete</kbd> or <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">Backspace</kbd> to remove selected items</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Hold <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">Control</kbd> to multi-select nodes and edges</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Export your flowchart as JSON and import it later to continue working</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
