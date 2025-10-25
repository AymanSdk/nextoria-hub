"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReactFlow, type Node } from "@xyflow/react";
import { X, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onClose: () => void;
}

export function PropertiesPanel({ selectedNode, onClose }: PropertiesPanelProps) {
  const { setNodes } = useReactFlow();
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("idle");
  const [variant, setVariant] = useState("default");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label || "");
      setDescription(selectedNode.data.description || "");
      setStatus(selectedNode.data.status || "idle");
      setVariant(selectedNode.data.variant || "default");
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  if (isCollapsed) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-20 z-10"
        onClick={() => setIsCollapsed(false)}
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
      </Button>
    );
  }

  const handleUpdateNode = () => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                label,
                description,
                status,
                variant,
              },
            }
          : node
      )
    );
  };

  return (
    <Card className="absolute right-4 top-20 z-10 w-80 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Node Properties</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleUpdateNode}
            placeholder="Node label"
          />
        </div>

        {selectedNode.type === "base" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleUpdateNode}
                placeholder="Add a description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant">Variant</Label>
              <Select value={variant} onValueChange={setVariant}>
                <SelectTrigger id="variant">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {selectedNode.type === "process" && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="pt-2">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>
              <span className="font-medium">Type:</span> {selectedNode.type}
            </div>
            <div>
              <span className="font-medium">ID:</span> {selectedNode.id}
            </div>
            <div>
              <span className="font-medium">Position:</span> ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})
            </div>
          </div>
        </div>

        <Button onClick={handleUpdateNode} className="w-full">
          Apply Changes
        </Button>
      </CardContent>
    </Card>
  );
}

