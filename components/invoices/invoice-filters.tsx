"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

interface InvoiceFiltersProps {
  showClientFilter?: boolean;
  showProjectFilter?: boolean;
}

export function InvoiceFilters({
  showClientFilter = false,
  showProjectFilter = false,
}: InvoiceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    updateURL();
  }, [debouncedSearch, status]);

  const updateURL = () => {
    const params = new URLSearchParams();

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }

    if (status !== "all") {
      params.set("status", status);
    }

    const query = params.toString();
    router.push(`/invoices${query ? `?${query}` : ""}`);
  };

  return (
    <div className='flex flex-col sm:flex-row gap-4 mb-6'>
      {/* Search */}
      <div className='relative flex-1'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500' />
        <Input
          placeholder='Search invoices...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='pl-10'
        />
      </div>

      {/* Status Filter */}
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className='w-full sm:w-[180px]'>
          <SelectValue placeholder='Filter by status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Statuses</SelectItem>
          <SelectItem value='DRAFT'>Draft</SelectItem>
          <SelectItem value='SENT'>Sent</SelectItem>
          <SelectItem value='VIEWED'>Viewed</SelectItem>
          <SelectItem value='PAID'>Paid</SelectItem>
          <SelectItem value='OVERDUE'>Overdue</SelectItem>
          <SelectItem value='CANCELLED'>Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
