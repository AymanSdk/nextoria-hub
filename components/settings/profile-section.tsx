"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User, Mail, Phone, Globe, FileText, Camera, Save, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { SettingsCard } from "./settings-card";
import { FormFieldWrapper } from "./form-field-wrapper";
import { AvatarUploadDialog } from "./avatar-upload-dialog";

interface ProfileSectionProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    phone?: string | null;
    bio?: string | null;
    timezone?: string | null;
  };
}

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona (MST)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT)" },
  { value: "UTC", label: "UTC" },
];

export function ProfileSection({ user }: ProfileSectionProps) {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.image);

  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    bio: user.bio || "",
    timezone: user.timezone || "America/New_York",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update the session
      await updateSession();

      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUploadSuccess = (newImageUrl: string) => {
    setAvatarUrl(newImageUrl);
  };

  const bioLength = formData.bio.length;
  const bioMaxLength = 500;

  return (
    <div className='space-y-6'>
      {/* Avatar Card */}
      <SettingsCard
        title='Profile Picture'
        description='Upload a photo to personalize your account'
        icon={Camera}
      >
        <div className='flex flex-col sm:flex-row items-center gap-6'>
          <div className='relative group'>
            <Avatar className='h-32 w-32 border-4 border-border shadow-lg'>
              <AvatarImage src={avatarUrl || undefined} alt={formData.name} />
              <AvatarFallback className='text-4xl font-semibold'>
                {formData.name.substring(0, 2).toUpperCase() || "US"}
              </AvatarFallback>
            </Avatar>
            <button
              type='button'
              onClick={() => setShowAvatarDialog(true)}
              className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
            >
              <Camera className='h-8 w-8 text-white' />
            </button>
          </div>

          <div className='flex-1 space-y-3 text-center sm:text-left'>
            <div>
              <h4 className='font-semibold text-lg'>{formData.name || "Your Name"}</h4>
              <p className='text-sm text-muted-foreground'>{user.email}</p>
            </div>
            <Button onClick={() => setShowAvatarDialog(true)} variant='outline'>
              <Camera className='h-4 w-4 mr-2' />
              Change Photo
            </Button>
            <p className='text-xs text-muted-foreground'>
              JPG, PNG, GIF or WebP. Max 5MB
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Avatar Upload Dialog */}
      <AvatarUploadDialog
        open={showAvatarDialog}
        onOpenChange={setShowAvatarDialog}
        currentImage={avatarUrl}
        userName={formData.name}
        onUploadSuccess={handleAvatarUploadSuccess}
      />

      {/* Personal Information */}
      <form onSubmit={handleSubmit} className='space-y-6'>
        <SettingsCard
          title='Personal Information'
          description='Update your personal details'
          icon={User}
        >
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormFieldWrapper
              label='Full Name'
              htmlFor='name'
              required
              error={errors.name}
              className='sm:col-span-2'
            >
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                placeholder='John Doe'
                className='h-11'
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label='Email Address'
              htmlFor='email'
              description='Email cannot be changed'
              className='sm:col-span-2'
            >
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  id='email'
                  type='email'
                  value={user.email || ""}
                  disabled
                  className='pl-10 h-11 bg-muted/50 cursor-not-allowed'
                />
              </div>
            </FormFieldWrapper>
          </div>
        </SettingsCard>

        {/* Contact Information */}
        <SettingsCard
          title='Contact Information'
          description='How can people reach you?'
          icon={Phone}
        >
          <div className='grid gap-4 sm:grid-cols-2'>
            <FormFieldWrapper label='Phone Number' htmlFor='phone' description='Optional'>
              <div className='relative'>
                <Phone className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  id='phone'
                  type='tel'
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder='+1 (555) 123-4567'
                  className='pl-10 h-11'
                />
              </div>
            </FormFieldWrapper>

            <FormFieldWrapper
              label='Timezone'
              htmlFor='timezone'
              description='For displaying dates and times'
            >
              <div className='relative'>
                <Globe className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10' />
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                >
                  <SelectTrigger id='timezone' className='pl-10 h-11'>
                    <SelectValue placeholder='Select timezone' />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormFieldWrapper>
          </div>
        </SettingsCard>

        {/* About */}
        <SettingsCard
          title='About'
          description='Tell others a little bit about yourself'
          icon={FileText}
        >
          <FormFieldWrapper
            label='Bio'
            htmlFor='bio'
            description={`${bioLength} / ${bioMaxLength} characters`}
          >
            <Textarea
              id='bio'
              value={formData.bio}
              onChange={(e) => {
                if (e.target.value.length <= bioMaxLength) {
                  setFormData({ ...formData, bio: e.target.value });
                }
              }}
              placeholder='I am a passionate professional who...'
              rows={4}
              className='resize-none'
            />
          </FormFieldWrapper>
        </SettingsCard>

        {/* Save Button */}
        <div className='flex justify-end pt-2'>
          <Button type='submit' disabled={isLoading} size='lg' className='min-w-[160px]'>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                Saving...
              </>
            ) : (
              <>
                <Save className='mr-2 h-5 w-5' />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
