"use client";

import * as React from "react";
import { useState } from "react";
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Type,
  Layout,
  Globe,
  Calendar as CalendarIcon,
} from "lucide-react";
import { SettingsCard } from "./settings-card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const themes = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
];

const dateFormats = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (US)" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (UK)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO)" },
];

export function AppearanceSection() {
  const [theme, setTheme] = useState("system");
  const [density, setDensity] = useState("comfortable");
  const [fontSize, setFontSize] = useState([14]);
  const [language, setLanguage] = useState("en");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Appearance preferences updated");
    } catch (error) {
      toast.error("Failed to update preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Theme Preferences */}
      <SettingsCard
        title='Theme'
        description='Choose your preferred color theme'
        icon={Palette}
      >
        <RadioGroup value={theme} onValueChange={setTheme} className='grid gap-4'>
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            return (
              <div key={themeOption.id} className='flex items-center space-x-3'>
                <RadioGroupItem value={themeOption.id} id={themeOption.id} />
                <Label
                  htmlFor={themeOption.id}
                  className='flex items-center gap-2 cursor-pointer flex-1'
                >
                  <div
                    className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-lg border-2 transition-colors",
                      theme === themeOption.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Icon className='h-6 w-6' />
                  </div>
                  <div className='space-y-0.5'>
                    <p className='text-sm font-medium'>{themeOption.label}</p>
                    <p className='text-xs text-muted-foreground'>
                      {themeOption.id === "system"
                        ? "Adapts to your system preferences"
                        : `Always use ${themeOption.label.toLowerCase()} mode`}
                    </p>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </SettingsCard>

      {/* Display Settings */}
      <SettingsCard
        title='Display'
        description='Customize the interface density and size'
        icon={Layout}
      >
        <div className='space-y-6'>
          {/* Density */}
          <div className='space-y-3'>
            <Label className='text-sm font-medium'>Interface Density</Label>
            <RadioGroup value={density} onValueChange={setDensity} className='grid gap-3'>
              <div className='flex items-center space-x-3'>
                <RadioGroupItem value='compact' id='compact' />
                <Label htmlFor='compact' className='cursor-pointer flex-1'>
                  <div className='space-y-0.5'>
                    <p className='text-sm font-medium'>Compact</p>
                    <p className='text-xs text-muted-foreground'>
                      More content, less padding
                    </p>
                  </div>
                </Label>
              </div>
              <div className='flex items-center space-x-3'>
                <RadioGroupItem value='comfortable' id='comfortable' />
                <Label htmlFor='comfortable' className='cursor-pointer flex-1'>
                  <div className='space-y-0.5'>
                    <p className='text-sm font-medium'>Comfortable</p>
                    <p className='text-xs text-muted-foreground'>
                      Balanced spacing (recommended)
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Font Size */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label className='text-sm font-medium'>Font Size</Label>
              <span className='text-sm text-muted-foreground'>{fontSize[0]}px</span>
            </div>
            <div className='flex items-center gap-4'>
              <Type className='h-4 w-4 text-muted-foreground' />
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                min={12}
                max={18}
                step={1}
                className='flex-1'
              />
              <Type className='h-5 w-5 text-muted-foreground' />
            </div>
            <p className='text-xs text-muted-foreground'>
              Adjust the base font size across the application
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Language & Region */}
      <SettingsCard
        title='Language & Region'
        description='Set your language and regional preferences'
        icon={Globe}
      >
        <div className='space-y-4'>
          {/* Language */}
          <div className='space-y-2'>
            <Label htmlFor='language' className='text-sm font-medium'>
              Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id='language'>
                <SelectValue placeholder='Select language' />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='text-xs text-muted-foreground'>
              The language used throughout the interface
            </p>
          </div>

          <Separator />

          {/* Date Format */}
          <div className='space-y-2'>
            <Label
              htmlFor='date-format'
              className='text-sm font-medium flex items-center gap-2'
            >
              <CalendarIcon className='h-4 w-4' />
              Date Format
            </Label>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger id='date-format'>
                <SelectValue placeholder='Select date format' />
              </SelectTrigger>
              <SelectContent>
                {dateFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='text-xs text-muted-foreground'>
              How dates are displayed throughout the app
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Sidebar Preferences */}
      <SettingsCard
        title='Sidebar'
        description='Customize your sidebar behavior'
        icon={Layout}
      >
        <div className='flex items-center justify-between py-2'>
          <div className='space-y-0.5'>
            <Label htmlFor='sidebar-collapsed' className='text-sm font-medium'>
              Default to Collapsed
            </Label>
            <p className='text-xs text-muted-foreground'>
              Start with the sidebar in collapsed state
            </p>
          </div>
          <Switch
            id='sidebar-collapsed'
            checked={sidebarCollapsed}
            onCheckedChange={setSidebarCollapsed}
          />
        </div>
      </SettingsCard>

      {/* Save Button */}
      <div className='flex justify-end pt-2'>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size='lg'
          className='min-w-[160px]'
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
