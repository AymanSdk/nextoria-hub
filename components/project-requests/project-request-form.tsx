"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  Send,
  Lightbulb,
  Target,
  Package,
  DollarSign,
  Calendar,
} from "lucide-react";

export function ProjectRequestForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    estimatedBudget: "",
    budgetCurrency: "USD",
    desiredStartDate: "",
    desiredDeadline: "",
    objectives: "",
    targetAudience: "",
    deliverables: "",
    additionalNotes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        objectives: formData.objectives || undefined,
        targetAudience: formData.targetAudience || undefined,
        deliverables: formData.deliverables || undefined,
        additionalNotes: formData.additionalNotes || undefined,
      };

      if (formData.estimatedBudget) {
        payload.estimatedBudget = Math.round(parseFloat(formData.estimatedBudget) * 100);
        payload.budgetCurrency = formData.budgetCurrency;
      }

      if (formData.desiredStartDate) {
        payload.desiredStartDate = formData.desiredStartDate;
      }

      if (formData.desiredDeadline) {
        payload.desiredDeadline = formData.desiredDeadline;
      }

      const res = await fetch("/api/project-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ error: "Failed to submit project request" }));
        throw new Error(data.error || "Failed to submit project request");
      }

      toast.success("Project request submitted successfully! We'll review it soon.");
      router.push("/project-requests");
      router.refresh();
    } catch (error) {
      console.error("Error submitting project request:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit project request"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5 text-primary' />
            Basic Information
          </CardTitle>
          <CardDescription>Tell us about your project idea</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>
              Project Title <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='title'
              placeholder='e.g., New Website Redesign'
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={255}
              className='h-11'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>
              Description <span className='text-red-500'>*</span>
            </Label>
            <Textarea
              id='description'
              placeholder='Provide a detailed description of what you need...'
              value={formData.description}
              onChange={handleChange}
              required
              minLength={10}
              rows={5}
              className='resize-none'
            />
            <p className='text-xs text-muted-foreground'>
              Minimum 10 characters ({formData.description.length}/10)
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='priority'>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className='h-11'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='LOW'>Low</SelectItem>
                  <SelectItem value='MEDIUM'>Medium</SelectItem>
                  <SelectItem value='HIGH'>High</SelectItem>
                  <SelectItem value='URGENT'>Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='estimatedBudget'>
                <DollarSign className='h-4 w-4 inline mr-1' />
                Estimated Budget (Optional)
              </Label>
              <div className='flex gap-2'>
                <Input
                  id='estimatedBudget'
                  type='number'
                  placeholder='5000'
                  value={formData.estimatedBudget}
                  onChange={handleChange}
                  min='0'
                  step='0.01'
                  className='h-11'
                />
                <Select
                  value={formData.budgetCurrency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, budgetCurrency: value })
                  }
                >
                  <SelectTrigger className='h-11 w-24'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='USD'>USD</SelectItem>
                    <SelectItem value='EUR'>EUR</SelectItem>
                    <SelectItem value='GBP'>GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5 text-primary' />
            Timeline (Optional)
          </CardTitle>
          <CardDescription>
            When would you like the project to start and finish?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='desiredStartDate'>Desired Start Date</Label>
              <Input
                id='desiredStartDate'
                type='date'
                value={formData.desiredStartDate}
                onChange={handleChange}
                className='h-11'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='desiredDeadline'>Desired Deadline</Label>
              <Input
                id='desiredDeadline'
                type='date'
                value={formData.desiredDeadline}
                onChange={handleChange}
                className='h-11'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Lightbulb className='h-5 w-5 text-primary' />
            Project Details (Optional)
          </CardTitle>
          <CardDescription>Help us understand your project better</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='objectives'>
              <Target className='h-4 w-4 inline mr-1' />
              Objectives & Goals
            </Label>
            <Textarea
              id='objectives'
              placeholder='What are you hoping to achieve with this project?'
              value={formData.objectives}
              onChange={handleChange}
              rows={3}
              className='resize-none'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='targetAudience'>Target Audience</Label>
            <Textarea
              id='targetAudience'
              placeholder='Who is your target audience?'
              value={formData.targetAudience}
              onChange={handleChange}
              rows={3}
              className='resize-none'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='deliverables'>Expected Deliverables</Label>
            <Textarea
              id='deliverables'
              placeholder='What specific deliverables are you expecting?'
              value={formData.deliverables}
              onChange={handleChange}
              rows={3}
              className='resize-none'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='additionalNotes'>Additional Notes</Label>
            <Textarea
              id='additionalNotes'
              placeholder='Any other information we should know?'
              value={formData.additionalNotes}
              onChange={handleChange}
              rows={3}
              className='resize-none'
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className='flex gap-3 justify-end'>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={isSubmitting} className='min-w-[150px]'>
          {isSubmitting ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Send className='mr-2 h-4 w-4' />
          )}
          Submit Request
        </Button>
      </div>
    </form>
  );
}
