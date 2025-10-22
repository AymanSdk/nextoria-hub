"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, DollarSign, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Expense {
  id: string;
  description: string;
  category: string;
  status: string;
  amount: number;
  currency: string;
  expenseDate: string;
  vendor: string | null;
  submittedBy: string;
  createdAt: string;
}

export default function ExpensesPage() {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchExpenses();
  }, [filter]);

  const fetchExpenses = async () => {
    try {
      const workspaceId = "workspace-1"; // Placeholder
      const statusParam = filter !== "all" ? `&status=${filter}` : "";
      const response = await fetch(
        `/api/expenses?workspaceId=${workspaceId}${statusParam}`
      );
      const data = await response.json();

      if (data.success) {
        setExpenses(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500";
      case "SUBMITTED":
        return "bg-blue-500";
      case "DRAFT":
        return "bg-gray-500";
      case "REJECTED":
        return "bg-red-500";
      case "REIMBURSED":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.replace("_", " ");
  };

  // Calculate stats
  const stats = {
    total: expenses.reduce((acc, e) => acc + e.amount, 0),
    approved: expenses
      .filter((e) => e.status === "APPROVED")
      .reduce((acc, e) => acc + e.amount, 0),
    pending: expenses.filter((e) => e.status === "SUBMITTED").length,
    draft: expenses.filter((e) => e.status === "DRAFT").length,
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Expenses</h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            Track and manage business expenses
          </p>
        </div>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          New Expense
        </Button>
      </div>

      {/* Summary Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Expenses
            </CardTitle>
            <Receipt className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${(stats.total / 100).toLocaleString()}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Approved</CardTitle>
            <CheckCircle className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${(stats.approved / 100).toLocaleString()}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>Approved expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Pending Approval
            </CardTitle>
            <Clock className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.pending}</div>
            <p className='text-xs text-neutral-500 mt-1'>Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Drafts</CardTitle>
            <DollarSign className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.draft}</div>
            <p className='text-xs text-neutral-500 mt-1'>Not yet submitted</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className='flex items-center gap-2'>
        <div className='flex gap-2'>
          {[
            "all",
            "DRAFT",
            "SUBMITTED",
            "APPROVED",
            "REJECTED",
            "REIMBURSED",
          ].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size='sm'
              onClick={() => setFilter(status)}>
              {status === "all" ? "All" : status}
            </Button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className='text-neutral-500'>Loading expenses...</p>
          ) : expenses.length === 0 ? (
            <div className='text-center py-12'>
              <p className='text-neutral-500'>No expenses found</p>
              <Button className='mt-4'>
                <Plus className='mr-2 h-4 w-4' />
                Create your first expense
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className='font-medium'>
                      {expense.description}
                    </TableCell>
                    <TableCell>{getCategoryLabel(expense.category)}</TableCell>
                    <TableCell className='text-neutral-500'>
                      {expense.vendor || "—"}
                    </TableCell>
                    <TableCell>
                      ${(expense.amount / 100).toLocaleString()}{" "}
                      {expense.currency}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(expense.status)}>
                        {expense.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant='ghost' size='sm'>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
