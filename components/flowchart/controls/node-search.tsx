"use client";

import { useState, useEffect } from "react";
import { useReactFlow, useNodes } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NodeSearchProps {
  onClose?: () => void;
}

export function NodeSearch({ onClose }: NodeSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const nodes = useNodes();
  const { setCenter, setNodes } = useReactFlow();

  const filteredNodes = nodes.filter((node) =>
    (node.data as any).label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNodeClick = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      // Center on node
      setCenter(node.position.x + 100, node.position.y + 50, {
        zoom: 1.5,
        duration: 800,
      });

      // Highlight node
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === nodeId,
        }))
      );
    }
  };

  if (isCollapsed) {
    return (
      <Button
        variant='outline'
        size='icon'
        className='absolute left-4 top-96 z-10'
        onClick={() => setIsCollapsed(false)}
      >
        <Search className='h-4 w-4' />
      </Button>
    );
  }

  return (
    <Card className='absolute left-4 bottom-4 z-10 w-80 shadow-lg'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-sm font-semibold flex items-center gap-2'>
            <Search className='h-4 w-4' />
            Search Nodes
          </CardTitle>
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
      <CardContent className='space-y-3'>
        <div className='relative'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search by label...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-8'
          />
        </div>

        <ScrollArea className='h-[200px]'>
          {filteredNodes.length === 0 ? (
            <div className='text-center text-sm text-muted-foreground py-8'>
              {searchTerm ? "No nodes found" : "Type to search nodes"}
            </div>
          ) : (
            <div className='space-y-2'>
              {filteredNodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => handleNodeClick(node.id)}
                  className='w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex-1 min-w-0'>
                      <div className='font-medium text-sm truncate'>
                        {(node.data as any).label || node.id}
                      </div>
                      {(node.data as any).description && (
                        <div className='text-xs text-muted-foreground truncate mt-0.5'>
                          {(node.data as any).description}
                        </div>
                      )}
                    </div>
                    <Badge variant='outline' className='text-xs ml-2 shrink-0'>
                      {node.type}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {searchTerm && (
          <div className='text-xs text-muted-foreground text-center'>
            Found {filteredNodes.length} of {nodes.length} nodes
          </div>
        )}
      </CardContent>
    </Card>
  );
}
