"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Target,
  TrendingUp,
  DollarSign,
  Eye,
  MousePointerClick,
  Calendar,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  budgetAmount: number | null;
  spentAmount: number;
  currency: string;
  startDate: string | null;
  endDate: string | null;
  reach: number;
  impressions: number;
  clicks: number;
  conversions: number;
  targetReach: number | null;
  targetConversions: number | null;
  createdAt: string;
}

export default function CampaignsPage() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      // In a real implementation, get workspaceId from session/context
      const workspaceId = "workspace-1"; // Placeholder
      const response = await fetch(`/api/campaigns?workspaceId=${workspaceId}`);
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "PLANNING":
        return "bg-blue-500";
      case "PAUSED":
        return "bg-yellow-500";
      case "COMPLETED":
        return "bg-gray-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace("_", " ");
  };

  const calculateProgress = (current: number, target: number | null) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filter === "all") return true;
    return campaign.status === filter;
  });

  // Calculate summary stats
  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === "ACTIVE").length,
    totalBudget: campaigns.reduce((acc, c) => acc + (c.budgetAmount || 0), 0),
    totalSpent: campaigns.reduce((acc, c) => acc + c.spentAmount, 0),
    totalReach: campaigns.reduce((acc, c) => acc + c.reach, 0),
    totalConversions: campaigns.reduce((acc, c) => acc + c.conversions, 0),
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Campaigns</h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            Track and manage all your marketing campaigns
          </p>
        </div>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          New Campaign
        </Button>
      </div>

      {/* Summary Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Campaigns
            </CardTitle>
            <Target className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
            <p className='text-xs text-neutral-500 mt-1'>
              {stats.active} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Budget</CardTitle>
            <DollarSign className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${(stats.totalBudget / 100).toLocaleString()}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>
              ${(stats.totalSpent / 100).toLocaleString()} spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Reach</CardTitle>
            <Eye className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.totalReach.toLocaleString()}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>People reached</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Conversions</CardTitle>
            <TrendingUp className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.totalConversions.toLocaleString()}
            </div>
            <p className='text-xs text-neutral-500 mt-1'>Total conversions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className='flex items-center gap-2'>
        <Filter className='h-4 w-4 text-neutral-500' />
        <div className='flex gap-2'>
          {["all", "PLANNING", "ACTIVE", "PAUSED", "COMPLETED"].map(
            (status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size='sm'
                onClick={() => setFilter(status)}>
                {status === "all" ? "All" : status}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Campaigns List */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {loading ? (
          <p className='text-neutral-500'>Loading campaigns...</p>
        ) : filteredCampaigns.length === 0 ? (
          <div className='col-span-full text-center py-12'>
            <p className='text-neutral-500'>No campaigns found</p>
            <Button className='mt-4'>
              <Plus className='mr-2 h-4 w-4' />
              Create your first campaign
            </Button>
          </div>
        ) : (
          filteredCampaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='space-y-1'>
                    <CardTitle className='line-clamp-1'>
                      {campaign.name}
                    </CardTitle>
                    <p className='text-sm text-neutral-500'>
                      {getTypeLabel(campaign.type)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {campaign.description && (
                  <p className='text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2'>
                    {campaign.description}
                  </p>
                )}

                {/* Budget */}
                {campaign.budgetAmount && (
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-neutral-500'>Budget</span>
                      <span className='font-medium'>
                        ${(campaign.spentAmount / 100).toLocaleString()} / $
                        {(campaign.budgetAmount / 100).toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={
                        (campaign.spentAmount / campaign.budgetAmount) * 100
                      }
                    />
                  </div>
                )}

                {/* Metrics */}
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <p className='text-xs text-neutral-500'>Reach</p>
                    <p className='text-lg font-semibold'>
                      {campaign.reach.toLocaleString()}
                    </p>
                    {campaign.targetReach && (
                      <Progress
                        value={calculateProgress(
                          campaign.reach,
                          campaign.targetReach
                        )}
                        className='h-1'
                      />
                    )}
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs text-neutral-500'>Conversions</p>
                    <p className='text-lg font-semibold'>
                      {campaign.conversions.toLocaleString()}
                    </p>
                    {campaign.targetConversions && (
                      <Progress
                        value={calculateProgress(
                          campaign.conversions,
                          campaign.targetConversions
                        )}
                        className='h-1'
                      />
                    )}
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs text-neutral-500'>Impressions</p>
                    <p className='text-lg font-semibold'>
                      {campaign.impressions.toLocaleString()}
                    </p>
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs text-neutral-500'>Clicks</p>
                    <p className='text-lg font-semibold'>
                      {campaign.clicks.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Dates */}
                {campaign.startDate && (
                  <div className='flex items-center gap-2 text-xs text-neutral-500'>
                    <Calendar className='h-3 w-3' />
                    {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                    {campaign.endDate
                      ? new Date(campaign.endDate).toLocaleDateString()
                      : "Ongoing"}
                  </div>
                )}

                <Button variant='outline' className='w-full' size='sm'>
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
