"use client";

import { useCallback, useState } from "react";
import { type Node, type Edge, useReactFlow } from "@xyflow/react";
import { nanoid } from "nanoid";

export function useCopyPaste() {
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  const [copiedEdges, setCopiedEdges] = useState<Edge[]>([]);
  const { getNodes, getEdges } = useReactFlow();

  const copy = useCallback(() => {
    const nodes = getNodes().filter((node) => node.selected);
    const edges = getEdges().filter(
      (edge) =>
        nodes.some((n) => n.id === edge.source) &&
        nodes.some((n) => n.id === edge.target)
    );

    setCopiedNodes(nodes);
    setCopiedEdges(edges);

    return nodes.length > 0;
  }, [getNodes, getEdges]);

  const cut = useCallback(() => {
    const success = copy();
    if (success) {
      const nodes = getNodes().filter((node) => !node.selected);
      const nodeIds = nodes.map((n) => n.id);
      const edges = getEdges().filter(
        (edge) => nodeIds.includes(edge.source) && nodeIds.includes(edge.target)
      );
      return { nodes, edges };
    }
    return null;
  }, [copy, getNodes, getEdges]);

  const paste = useCallback(() => {
    if (copiedNodes.length === 0) return null;

    const idMapping = new Map<string, string>();
    copiedNodes.forEach((node) => {
      idMapping.set(node.id, nanoid());
    });

    const newNodes: Node[] = copiedNodes.map((node) => ({
      ...node,
      id: idMapping.get(node.id)!,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      selected: true,
    }));

    const newEdges: Edge[] = copiedEdges
      .filter(
        (edge) => idMapping.has(edge.source) && idMapping.has(edge.target)
      )
      .map((edge) => ({
        ...edge,
        id: nanoid(),
        source: idMapping.get(edge.source)!,
        target: idMapping.get(edge.target)!,
      }));

    return { nodes: newNodes, edges: newEdges };
  }, [copiedNodes, copiedEdges]);

  const duplicate = useCallback(() => {
    copy();
    return paste();
  }, [copy, paste]);

  return {
    copy,
    cut,
    paste,
    duplicate,
    hasCopied: copiedNodes.length > 0,
  };
}

