"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Camera, Save, Loader2, User, Mail, Phone, Globe, FileText } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface ProfileFormProps {
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

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(user.image || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    bio: user.bio || "",
    timezone: user.timezone || "America/New_York",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, GIF, and WebP images are allowed");
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async () => {
    if (!imageFile) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      console.log("Uploading profile picture...");
      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Upload failed:", error);
        throw new Error(error.error || "Failed to upload avatar");
      }

      const data = await response.json();
      console.log("Upload successful, new image URL:", data.imageUrl);

      setImagePreview(data.imageUrl);
      setImageFile(null);

      // Update the session to reflect the new avatar
      console.log("Updating session...");
      await updateSession();

      toast.success("Profile picture updated successfully");

      // Refresh the router to update server components and re-fetch session
      router.refresh();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload profile picture"
      );
      throw error; // Re-throw to prevent further execution
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload profile picture first if there's a new one
      if (imageFile) {
        await uploadProfilePicture();
      }

      // Update other profile fields
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

      // Update the session to reflect profile changes
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

  return (
    <form onSubmit={handleSubmit}>
      <div className='grid gap-6'>
        {/* Profile Picture Card */}
        <Card className='border-2 hover:border-primary/50 transition-colors'>
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                <Camera className='h-5 w-5 text-primary' />
              </div>
              <div>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Your public profile image</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col sm:flex-row items-center gap-6'>
              <Avatar className='h-32 w-32 border-4 border-background shadow-xl ring-2 ring-border'>
                <AvatarImage src={imagePreview || undefined} alt={formData.name} />
                <AvatarFallback className='text-4xl font-semibold bg-linear-to-br from-primary/20 to-primary/5'>
                  {formData.name.substring(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 text-center sm:text-left space-y-3'>
                <div>
                  <h4 className='font-semibold text-lg'>
                    {formData.name || "Your Name"}
                  </h4>
                  <p className='text-sm text-muted-foreground'>{user.email}</p>
                </div>
                <div className='flex flex-col sm:flex-row gap-3'>
                  {!imageFile ? (
                    <>
                      <Label
                        htmlFor='profile-image'
                        className='cursor-pointer inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6'
                      >
                        <Camera className='mr-2 h-4 w-4' />
                        Choose Photo
                      </Label>
                      <Input
                        id='profile-image'
                        type='file'
                        accept='image/jpeg,image/png,image/gif,image/webp'
                        className='hidden'
                        onChange={handleImageChange}
                      />
                    </>
                  ) : (
                    <div className='flex gap-2'>
                      <Button
                        type='button'
                        onClick={uploadProfilePicture}
                        disabled={isUploadingImage}
                        size='sm'
                        className='h-10'
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Save className='mr-2 h-4 w-4' />
                            Upload Now
                          </>
                        )}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(user.image || null);
                        }}
                        disabled={isUploadingImage}
                        className='h-10'
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  <p className='text-xs text-muted-foreground self-center'>
                    JPG, PNG, GIF or WebP. Max 5MB
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid Layout for Info Cards */}
        <div className='grid md:grid-cols-2 gap-6'>
          {/* Personal Information */}
          <Card className='border-2 hover:border-primary/50 transition-colors'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                  <User className='h-5 w-5 text-primary' />
                </div>
                <div>
                  <CardTitle>Personal Info</CardTitle>
                  <CardDescription>Your basic information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-5'>
              <div className='space-y-2'>
                <Label
                  htmlFor='name'
                  className='text-sm font-medium flex items-center gap-2'
                >
                  <User className='h-4 w-4 text-muted-foreground' />
                  Full Name
                </Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder='John Doe'
                  required
                  className='h-11'
                />
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='email'
                  className='text-sm font-medium flex items-center gap-2'
                >
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  Email Address
                </Label>
                <Input
                  id='email'
                  type='email'
                  value={user.email || ""}
                  disabled
                  className='bg-muted/50 cursor-not-allowed h-11'
                />
                <p className='text-xs text-muted-foreground flex items-center gap-1'>
                  Email cannot be changed for security reasons
                </p>
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='phone'
                  className='text-sm font-medium flex items-center gap-2'
                >
                  <Phone className='h-4 w-4 text-muted-foreground' />
                  Phone Number
                </Label>
                <Input
                  id='phone'
                  type='tel'
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder='+1 (555) 123-4567'
                  className='h-11'
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className='border-2 hover:border-primary/50 transition-colors'>
            <CardHeader className='pb-4'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                  <Globe className='h-5 w-5 text-primary' />
                </div>
                <div>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-5'>
              <div className='space-y-2'>
                <Label
                  htmlFor='timezone'
                  className='text-sm font-medium flex items-center gap-2'
                >
                  <Globe className='h-4 w-4 text-muted-foreground' />
                  Timezone
                </Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                >
                  <SelectTrigger id='timezone' className='h-11'>
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
                <p className='text-xs text-muted-foreground'>
                  Used for displaying dates and times
                </p>
              </div>

              <div className='pt-4 border-t'>
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>Account Status</h4>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-2 rounded-full bg-green-500 animate-pulse' />
                    <span className='text-sm text-muted-foreground'>Active Account</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bio Section - Full Width */}
        <Card className='border-2 hover:border-primary/50 transition-colors'>
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                <FileText className='h-5 w-5 text-primary' />
              </div>
              <div>
                <CardTitle>About You</CardTitle>
                <CardDescription>Tell others a little bit about yourself</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <Textarea
                id='bio'
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder='I am a passionate professional who...'
                rows={4}
                className='resize-none'
              />
              <p className='text-xs text-muted-foreground'>
                {formData.bio.length} / 500 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className='flex justify-end pt-4 border-t'>
          <Button
            type='submit'
            disabled={isLoading}
            size='lg'
            className='min-w-[200px] h-12 text-base'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className='mr-2 h-5 w-5' />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
