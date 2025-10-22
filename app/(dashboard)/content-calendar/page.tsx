"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  platform: string | null;
  publishDate: string | null;
  contentBody: string | null;
  tags: string | null;
  createdAt: string;
}

export default function ContentCalendarPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  useEffect(() => {
    fetchContentItems();
  }, [currentDate]);

  const fetchContentItems = async () => {
    try {
      const workspaceId = "workspace-1"; // Placeholder
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const response = await fetch(
        `/api/content-calendar?workspaceId=${workspaceId}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );
      const data = await response.json();

      if (data.success) {
        setContentItems(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch content calendar:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-500";
      case "SCHEDULED":
        return "bg-blue-500";
      case "APPROVED":
        return "bg-purple-500";
      case "REVIEW":
        return "bg-yellow-500";
      case "WRITING":
        return "bg-orange-500";
      case "PLANNING":
        return "bg-gray-500";
      case "IDEA":
        return "bg-gray-400";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    return type.replace("_", " ");
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getItemsForDate = (date: Date) => {
    return contentItems.filter(
      (item) => item.publishDate && isSameDay(new Date(item.publishDate), date)
    );
  };

  const stats = {
    total: contentItems.length,
    scheduled: contentItems.filter((i) => i.status === "SCHEDULED").length,
    published: contentItems.filter((i) => i.status === "PUBLISHED").length,
    inProgress: contentItems.filter((i) =>
      ["WRITING", "REVIEW"].includes(i.status)
    ).length,
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Content Calendar
          </h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            Plan and schedule your content deliverables
          </p>
        </div>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          New Content
        </Button>
      </div>

      {/* Summary Stats */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
            <p className='text-xs text-neutral-500 mt-1'>This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.scheduled}</div>
            <p className='text-xs text-neutral-500 mt-1'>Ready to publish</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.published}</div>
            <p className='text-xs text-neutral-500 mt-1'>Live content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.inProgress}</div>
            <p className='text-xs text-neutral-500 mt-1'>Being created</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Controls */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            Next
          </Button>
          <span className='ml-4 text-lg font-semibold'>
            {format(currentDate, "MMMM yyyy")}
          </span>
        </div>
        <div className='flex gap-2'>
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size='sm'
            onClick={() => setViewMode("calendar")}>
            <CalendarIcon className='mr-2 h-4 w-4' />
            Calendar
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size='sm'
            onClick={() => setViewMode("list")}>
            <Filter className='mr-2 h-4 w-4' />
            List
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <Card>
          <CardContent className='p-4'>
            <div className='grid grid-cols-7 gap-2'>
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className='text-center font-semibold text-sm text-neutral-500 py-2'>
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {daysInMonth.map((day, idx) => {
                const items = getItemsForDate(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);

                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] p-2 border rounded-lg ${
                      isToday
                        ? "bg-blue-50 dark:bg-blue-950 border-blue-300"
                        : "border-neutral-200 dark:border-neutral-800"
                    } ${!isCurrentMonth ? "opacity-50" : ""}`}>
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isToday ? "text-blue-600 dark:text-blue-400" : ""
                      }`}>
                      {format(day, "d")}
                    </div>
                    <div className='space-y-1'>
                      {items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className='text-xs p-1 bg-neutral-100 dark:bg-neutral-800 rounded truncate cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          title={item.title}>
                          <Badge
                            className={`${getStatusColor(
                              item.status
                            )} text-[10px] mr-1`}
                            variant='outline'>
                            {item.type.slice(0, 3)}
                          </Badge>
                          {item.title}
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div className='text-xs text-neutral-500 pl-1'>
                          +{items.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className='space-y-3'>
          {loading ? (
            <p className='text-neutral-500'>Loading content...</p>
          ) : contentItems.length === 0 ? (
            <Card>
              <CardContent className='text-center py-12'>
                <p className='text-neutral-500'>
                  No content scheduled this month
                </p>
                <Button className='mt-4'>
                  <Plus className='mr-2 h-4 w-4' />
                  Add content
                </Button>
              </CardContent>
            </Card>
          ) : (
            contentItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <CardTitle className='text-lg'>{item.title}</CardTitle>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline'>
                          {getTypeIcon(item.type)}
                        </Badge>
                        {item.platform && (
                          <Badge variant='secondary'>{item.platform}</Badge>
                        )}
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                    {item.publishDate && (
                      <div className='text-sm text-neutral-500'>
                        {format(new Date(item.publishDate), "MMM d, yyyy")}
                      </div>
                    )}
                  </div>
                </CardHeader>
                {item.description && (
                  <CardContent>
                    <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                      {item.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
