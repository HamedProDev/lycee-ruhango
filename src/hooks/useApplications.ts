import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Application {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string | null;
  previous_school: string | null;
  program: string;
  level: string;
  parent_name: string | null;
  parent_phone: string | null;
  statement: string | null;
  school_report_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load applications.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitApplication = async (applicationData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    address?: string;
    previous_school?: string;
    program: string;
    level: string;
    parent_name?: string;
    parent_phone?: string;
    statement?: string;
    school_report_url?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .insert(applicationData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Thank you for your application. We will contact you soon.",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit application.",
      });
      return { data: null, error };
    }
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setApplications((prev) => prev.map((a) => (a.id === id ? data : a)));
      toast({
        title: "Status Updated",
        description: `Application status changed to ${status}.`,
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update status.",
      });
      return { data: null, error };
    }
  };

  const deleteApplication = async (id: string) => {
    try {
      const { error } = await supabase.from("applications").delete().eq("id", id);

      if (error) throw error;

      setApplications((prev) => prev.filter((a) => a.id !== id));
      toast({
        title: "Deleted",
        description: "Application deleted successfully.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete application.",
      });
      return { error };
    }
  };

  return {
    applications,
    isLoading,
    fetchApplications,
    submitApplication,
    updateApplicationStatus,
    deleteApplication,
  };
};
