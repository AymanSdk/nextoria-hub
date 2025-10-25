import type { Node, Edge } from "@xyflow/react";
import { FileCode, Workflow, Database, ShoppingCart, Lock } from "lucide-react";

export interface FlowchartTemplate {
  id: string;
  name: string;
  description: string;
  category: "software" | "business" | "database" | "ecommerce" | "security";
  icon: any;
  data: {
    nodes: Node[];
    edges: Edge[];
    viewport: { x: number; y: number; zoom: number };
  };
}

export const flowchartTemplates: FlowchartTemplate[] = [
  {
    id: "user-auth-flow",
    name: "User Authentication Flow",
    description: "Complete user authentication and authorization process",
    category: "security",
    icon: Lock,
    data: {
      nodes: [
        {
          id: "start",
          type: "startEnd",
          position: { x: 250, y: 50 },
          data: { label: "User Login", type: "start" },
        },
        {
          id: "validate",
          type: "process",
          position: { x: 250, y: 150 },
          data: { label: "Validate Credentials", status: "idle" },
        },
        {
          id: "decision",
          type: "decision",
          position: { x: 250, y: 280 },
          data: { label: "Valid?" },
        },
        {
          id: "success",
          type: "process",
          position: { x: 100, y: 400 },
          data: { label: "Generate Token", status: "success" },
        },
        {
          id: "error",
          type: "process",
          position: { x: 400, y: 400 },
          data: { label: "Show Error", status: "error" },
        },
        {
          id: "dashboard",
          type: "startEnd",
          position: { x: 100, y: 520 },
          data: { label: "Dashboard", type: "end" },
        },
        {
          id: "retry",
          type: "startEnd",
          position: { x: 400, y: 520 },
          data: { label: "Login Again", type: "end" },
        },
      ],
      edges: [
        { id: "e1", source: "start", target: "validate", type: "custom" },
        { id: "e2", source: "validate", target: "decision", type: "custom" },
        { id: "e3", source: "decision", target: "success", label: "Yes", type: "custom" },
        { id: "e4", source: "decision", target: "error", label: "No", type: "custom" },
        { id: "e5", source: "success", target: "dashboard", type: "custom" },
        { id: "e6", source: "error", target: "retry", type: "custom" },
      ],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
  },
  {
    id: "ecommerce-checkout",
    name: "E-commerce Checkout Process",
    description: "Complete online shopping checkout workflow",
    category: "ecommerce",
    icon: ShoppingCart,
    data: {
      nodes: [
        {
          id: "start",
          type: "startEnd",
          position: { x: 250, y: 50 },
          data: { label: "Add to Cart", type: "start" },
        },
        {
          id: "review",
          type: "process",
          position: { x: 250, y: 150 },
          data: { label: "Review Cart", status: "idle" },
        },
        {
          id: "checkout",
          type: "decision",
          position: { x: 250, y: 280 },
          data: { label: "Proceed?" },
        },
        {
          id: "payment",
          type: "process",
          position: { x: 100, y: 400 },
          data: { label: "Process Payment", status: "running" },
        },
        {
          id: "cancel",
          type: "startEnd",
          position: { x: 400, y: 400 },
          data: { label: "Cancel Order", type: "end" },
        },
        {
          id: "verify",
          type: "decision",
          position: { x: 100, y: 530 },
          data: { label: "Payment OK?" },
        },
        {
          id: "confirm",
          type: "process",
          position: { x: 0, y: 660 },
          data: { label: "Order Confirmed", status: "success" },
        },
        {
          id: "failed",
          type: "process",
          position: { x: 200, y: 660 },
          data: { label: "Payment Failed", status: "error" },
        },
        {
          id: "end",
          type: "startEnd",
          position: { x: 0, y: 780 },
          data: { label: "Complete", type: "end" },
        },
      ],
      edges: [
        { id: "e1", source: "start", target: "review", type: "custom" },
        { id: "e2", source: "review", target: "checkout", type: "custom" },
        { id: "e3", source: "checkout", target: "payment", label: "Yes", type: "custom" },
        { id: "e4", source: "checkout", target: "cancel", label: "No", type: "custom" },
        { id: "e5", source: "payment", target: "verify", type: "custom" },
        { id: "e6", source: "verify", target: "confirm", label: "Yes", type: "custom" },
        { id: "e7", source: "verify", target: "failed", label: "No", type: "custom" },
        { id: "e8", source: "confirm", target: "end", type: "custom" },
        { id: "e9", source: "failed", target: "review", label: "Retry", type: "custom" },
      ],
      viewport: { x: 0, y: 0, zoom: 0.8 },
    },
  },
  {
    id: "database-schema",
    name: "Database Entity Relationship",
    description: "Sample database schema with relationships",
    category: "database",
    icon: Database,
    data: {
      nodes: [
        {
          id: "users",
          type: "databaseSchema",
          position: { x: 100, y: 100 },
          data: {
            label: "Users",
            schema: [
              { title: "id", type: "uuid" },
              { title: "email", type: "varchar" },
              { title: "name", type: "varchar" },
              { title: "created_at", type: "timestamp" },
            ],
          },
        },
        {
          id: "orders",
          type: "databaseSchema",
          position: { x: 450, y: 100 },
          data: {
            label: "Orders",
            schema: [
              { title: "id", type: "uuid" },
              { title: "user_id", type: "uuid" },
              { title: "total", type: "decimal" },
              { title: "status", type: "varchar" },
              { title: "created_at", type: "timestamp" },
            ],
          },
        },
        {
          id: "products",
          type: "databaseSchema",
          position: { x: 450, y: 350 },
          data: {
            label: "Products",
            schema: [
              { title: "id", type: "uuid" },
              { title: "name", type: "varchar" },
              { title: "price", type: "decimal" },
              { title: "stock", type: "integer" },
            ],
          },
        },
        {
          id: "order_items",
          type: "databaseSchema",
          position: { x: 800, y: 200 },
          data: {
            label: "Order Items",
            schema: [
              { title: "id", type: "uuid" },
              { title: "order_id", type: "uuid" },
              { title: "product_id", type: "uuid" },
              { title: "quantity", type: "integer" },
              { title: "price", type: "decimal" },
            ],
          },
        },
      ],
      edges: [
        {
          id: "e1",
          source: "orders",
          target: "users",
          sourceHandle: "user_id",
          targetHandle: "id",
          label: "belongs to",
          type: "custom",
        },
        {
          id: "e2",
          source: "order_items",
          target: "orders",
          sourceHandle: "order_id",
          targetHandle: "id",
          label: "has many",
          type: "custom",
        },
        {
          id: "e3",
          source: "order_items",
          target: "products",
          sourceHandle: "product_id",
          targetHandle: "id",
          label: "references",
          type: "custom",
        },
      ],
      viewport: { x: 0, y: 0, zoom: 0.9 },
    },
  },
  {
    id: "software-deployment",
    name: "Software Deployment Pipeline",
    description: "CI/CD deployment workflow",
    category: "software",
    icon: Workflow,
    data: {
      nodes: [
        {
          id: "start",
          type: "startEnd",
          position: { x: 250, y: 50 },
          data: { label: "Code Push", type: "start" },
        },
        {
          id: "build",
          type: "process",
          position: { x: 250, y: 150 },
          data: { label: "Build & Test", status: "running" },
        },
        {
          id: "test-pass",
          type: "decision",
          position: { x: 250, y: 280 },
          data: { label: "Tests Pass?" },
        },
        {
          id: "deploy-staging",
          type: "process",
          position: { x: 100, y: 400 },
          data: { label: "Deploy to Staging", status: "idle" },
        },
        {
          id: "fix",
          type: "process",
          position: { x: 400, y: 400 },
          data: { label: "Fix Issues", status: "error" },
        },
        {
          id: "approve",
          type: "decision",
          position: { x: 100, y: 530 },
          data: { label: "Approved?" },
        },
        {
          id: "deploy-prod",
          type: "process",
          position: { x: 0, y: 660 },
          data: { label: "Deploy to Production", status: "success" },
        },
        {
          id: "rollback",
          type: "process",
          position: { x: 200, y: 660 },
          data: { label: "Rollback", status: "error" },
        },
        {
          id: "end",
          type: "startEnd",
          position: { x: 0, y: 780 },
          data: { label: "Complete", type: "end" },
        },
      ],
      edges: [
        { id: "e1", source: "start", target: "build", type: "custom" },
        { id: "e2", source: "build", target: "test-pass", type: "custom" },
        {
          id: "e3",
          source: "test-pass",
          target: "deploy-staging",
          label: "Yes",
          type: "custom",
        },
        { id: "e4", source: "test-pass", target: "fix", label: "No", type: "custom" },
        { id: "e5", source: "fix", target: "build", label: "Retry", type: "custom" },
        { id: "e6", source: "deploy-staging", target: "approve", type: "custom" },
        {
          id: "e7",
          source: "approve",
          target: "deploy-prod",
          label: "Yes",
          type: "custom",
        },
        { id: "e8", source: "approve", target: "rollback", label: "No", type: "custom" },
        { id: "e9", source: "deploy-prod", target: "end", type: "custom" },
      ],
      viewport: { x: 0, y: 0, zoom: 0.8 },
    },
  },
  {
    id: "api-request-flow",
    name: "API Request Handling",
    description: "REST API request processing flow",
    category: "software",
    icon: FileCode,
    data: {
      nodes: [
        {
          id: "start",
          type: "startEnd",
          position: { x: 250, y: 50 },
          data: { label: "API Request", type: "start" },
        },
        {
          id: "auth",
          type: "process",
          position: { x: 250, y: 150 },
          data: { label: "Authentication", status: "running" },
        },
        {
          id: "auth-check",
          type: "decision",
          position: { x: 250, y: 280 },
          data: { label: "Authenticated?" },
        },
        {
          id: "validate",
          type: "process",
          position: { x: 100, y: 400 },
          data: { label: "Validate Request", status: "idle" },
        },
        {
          id: "unauthorized",
          type: "process",
          position: { x: 400, y: 400 },
          data: { label: "401 Unauthorized", status: "error" },
        },
        {
          id: "valid-check",
          type: "decision",
          position: { x: 100, y: 530 },
          data: { label: "Valid?" },
        },
        {
          id: "process",
          type: "process",
          position: { x: 0, y: 660 },
          data: { label: "Process Request", status: "success" },
        },
        {
          id: "bad-request",
          type: "process",
          position: { x: 200, y: 660 },
          data: { label: "400 Bad Request", status: "error" },
        },
        {
          id: "response",
          type: "startEnd",
          position: { x: 0, y: 780 },
          data: { label: "Send Response", type: "end" },
        },
      ],
      edges: [
        { id: "e1", source: "start", target: "auth", type: "custom" },
        { id: "e2", source: "auth", target: "auth-check", type: "custom" },
        {
          id: "e3",
          source: "auth-check",
          target: "validate",
          label: "Yes",
          type: "custom",
        },
        {
          id: "e4",
          source: "auth-check",
          target: "unauthorized",
          label: "No",
          type: "custom",
        },
        { id: "e5", source: "validate", target: "valid-check", type: "custom" },
        {
          id: "e6",
          source: "valid-check",
          target: "process",
          label: "Yes",
          type: "custom",
        },
        {
          id: "e7",
          source: "valid-check",
          target: "bad-request",
          label: "No",
          type: "custom",
        },
        { id: "e8", source: "process", target: "response", type: "custom" },
        { id: "e9", source: "bad-request", target: "response", type: "custom" },
        { id: "e10", source: "unauthorized", target: "response", type: "custom" },
      ],
      viewport: { x: 0, y: 0, zoom: 0.8 },
    },
  },
];

export function getTemplateById(id: string): FlowchartTemplate | undefined {
  return flowchartTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(
  category: FlowchartTemplate["category"]
): FlowchartTemplate[] {
  return flowchartTemplates.filter((t) => t.category === category);
}
