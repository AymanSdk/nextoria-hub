"use client";

import { useNodes, useEdges } from "@xyflow/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, Database, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FlowchartDataTableProps {
  onClose?: () => void;
}

export function FlowchartDataTable({ onClose }: FlowchartDataTableProps) {
  const nodes = useNodes();
  const edges = useEdges();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleExportCSV = (type: "nodes" | "edges") => {
    let csv = "";

    if (type === "nodes") {
      csv = "ID,Type,Label,X,Y,Selected\n";
      nodes.forEach((node) => {
        csv += `"${node.id}","${node.type}","${(node.data as any).label || ""}",${
          node.position.x
        },${node.position.y},${node.selected || false}\n`;
      });
    } else {
      csv = "ID,Source,Target,Label,Type\n";
      edges.forEach((edge) => {
        csv += `"${edge.id}","${edge.source}","${edge.target}","${edge.label || ""}","${
          edge.type || "default"
        }"\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `flowchart-${type}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`${type} exported as CSV`);
  };

  if (isCollapsed) {
    return (
      <Button
        variant='outline'
        size='icon'
        className='absolute right-4 bottom-4 z-10'
        onClick={() => setIsCollapsed(false)}
      >
        <Database className='h-4 w-4' />
      </Button>
    );
  }

  return (
    <Card className='absolute right-4 bottom-20 z-10 w-[500px] shadow-lg'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Database className='h-4 w-4' />
            <div>
              <CardTitle className='text-sm font-semibold'>Flowchart Data</CardTitle>
              <CardDescription className='text-xs'>
                {nodes.length} nodes, {edges.length} edges
              </CardDescription>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6'
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            {onClose && (
              <Button variant='ghost' size='icon' className='h-6 w-6' onClick={onClose}>
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-3 pt-0'>
        <Tabs defaultValue='nodes' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='nodes'>Nodes</TabsTrigger>
            <TabsTrigger value='edges'>Edges</TabsTrigger>
          </TabsList>

          <TabsContent value='nodes' className='mt-3'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <div className='text-xs text-muted-foreground'>
                  {nodes.length} total nodes
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-7'
                  onClick={() => handleExportCSV("nodes")}
                >
                  <Download className='h-3 w-3 mr-1' />
                  Export CSV
                </Button>
              </div>
              <ScrollArea className='h-[300px] rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[80px]'>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead className='w-[60px]'>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nodes.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className='text-center text-muted-foreground py-8'
                        >
                          No nodes in flowchart
                        </TableCell>
                      </TableRow>
                    ) : (
                      nodes.map((node) => (
                        <TableRow key={node.id}>
                          <TableCell className='font-mono text-xs'>
                            {node.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline' className='text-xs'>
                              {node.type}
                            </Badge>
                          </TableCell>
                          <TableCell className='font-medium'>
                            {(node.data as any).label || "Untitled"}
                          </TableCell>
                          <TableCell className='text-xs text-muted-foreground'>
                            {Math.round(node.position.x)}, {Math.round(node.position.y)}
                          </TableCell>
                          <TableCell>
                            {node.selected && (
                              <Badge variant='default' className='text-[10px] h-4'>
                                Selected
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value='edges' className='mt-3'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <div className='text-xs text-muted-foreground'>
                  {edges.length} total connections
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-7'
                  onClick={() => handleExportCSV("edges")}
                >
                  <Download className='h-3 w-3 mr-1' />
                  Export CSV
                </Button>
              </div>
              <ScrollArea className='h-[300px] rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[80px]'>ID</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {edges.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className='text-center text-muted-foreground py-8'
                        >
                          No connections in flowchart
                        </TableCell>
                      </TableRow>
                    ) : (
                      edges.map((edge) => {
                        const sourceNode = nodes.find((n) => n.id === edge.source);
                        const targetNode = nodes.find((n) => n.id === edge.target);
                        return (
                          <TableRow key={edge.id}>
                            <TableCell className='font-mono text-xs'>
                              {edge.id.slice(0, 8)}...
                            </TableCell>
                            <TableCell className='text-xs'>
                              {(sourceNode?.data as any)?.label || edge.source}
                            </TableCell>
                            <TableCell className='text-xs'>
                              {(targetNode?.data as any)?.label || edge.target}
                            </TableCell>
                            <TableCell className='text-xs text-muted-foreground'>
                              {edge.label || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant='secondary' className='text-[10px] h-4'>
                                {edge.type || "default"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
