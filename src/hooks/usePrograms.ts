import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Program {
  id: string;
  title: string;
  description: string;
  duration: string;
  levels: string;
  careers: string[];
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const usePrograms = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchPrograms = async (activeOnly: boolean = false) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("programs")
        .select("*")
        .order("display_order", { ascending: true });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load programs.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createProgram = async (programData: {
    title: string;
    description: string;
    duration: string;
    levels: string;
    careers: string[];
    image_url?: string;
    is_active?: boolean;
    display_order?: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from("programs")
        .insert(programData)
        .select()
        .single();

      if (error) throw error;

      setPrograms((prev) => [...prev, data].sort((a, b) => a.display_order - b.display_order));
      toast({
        title: "Success",
        description: "Program created successfully.",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create program.",
      });
      return { data: null, error };
    }
  };

  const updateProgram = async (id: string, programData: Partial<Program>) => {
    try {
      const { data, error } = await supabase
        .from("programs")
        .update(programData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setPrograms((prev) =>
        prev.map((p) => (p.id === id ? data : p)).sort((a, b) => a.display_order - b.display_order)
      );
      toast({
        title: "Success",
        description: "Program updated successfully.",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update program.",
      });
      return { data: null, error };
    }
  };

  const deleteProgram = async (id: string) => {
    try {
      const { error } = await supabase.from("programs").delete().eq("id", id);

      if (error) throw error;

      setPrograms((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: "Success",
        description: "Program deleted successfully.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete program.",
      });
      return { error };
    }
  };

  return {
    programs,
    isLoading,
    fetchPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
  };
};
