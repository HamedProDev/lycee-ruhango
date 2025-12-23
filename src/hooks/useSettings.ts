import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

export interface Setting {
  id: string;
  key: string;
  value: Json;
  created_at: string;
  updated_at: string;
}

export interface SchoolInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface SocialLinks {
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
}

export interface AdmissionsSettings {
  is_open: boolean;
  deadline: string | null;
  requirements: string[];
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .order("key", { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load settings.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSetting = <T>(key: string, defaultValue: T): T => {
    const setting = settings.find((s) => s.key === key);
    return (setting?.value as unknown as T) || defaultValue;
  };

  const updateSetting = async (key: string, value: Json) => {
    try {
      const existingSetting = settings.find((s) => s.key === key);

      if (existingSetting) {
        const { data, error } = await supabase
          .from("settings")
          .update({ value })
          .eq("key", key)
          .select()
          .single();

        if (error) throw error;

        setSettings((prev) => prev.map((s) => (s.key === key ? (data as Setting) : s)));
      } else {
        const { data, error } = await supabase
          .from("settings")
          .insert([{ key, value }])
          .select()
          .single();

        if (error) throw error;

        setSettings((prev) => [...prev, data as Setting]);
      }

      toast({
        title: "Success",
        description: "Settings saved successfully.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save settings.",
      });
      return { error };
    }
  };

  return {
    settings,
    isLoading,
    fetchSettings,
    getSetting,
    updateSetting,
  };
};
