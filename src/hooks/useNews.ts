import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  author_id: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNews = async (publishedOnly: boolean = false) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (publishedOnly) {
        query = query.eq("published", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load news. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNews = async (newsData: {
    title: string;
    content: string;
    excerpt?: string;
    image_url?: string;
    published?: boolean;
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("news")
        .insert({
          ...newsData,
          author_id: userData.user?.id,
          published_at: newsData.published ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      setNews((prev) => [data, ...prev]);
      toast({
        title: "Success",
        description: "News article created successfully.",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create news article.",
      });
      return { data: null, error };
    }
  };

  const updateNews = async (id: string, newsData: Partial<NewsItem>) => {
    try {
      const updateData = { ...newsData };
      if (newsData.published && !newsData.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("news")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setNews((prev) => prev.map((n) => (n.id === id ? data : n)));
      toast({
        title: "Success",
        description: "News article updated successfully.",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update news article.",
      });
      return { data: null, error };
    }
  };

  const deleteNews = async (id: string) => {
    try {
      const { error } = await supabase
        .from("news")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setNews((prev) => prev.filter((n) => n.id !== id));
      toast({
        title: "Success",
        description: "News article deleted successfully.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete news article.",
      });
      return { error };
    }
  };

  return {
    news,
    isLoading,
    fetchNews,
    createNews,
    updateNews,
    deleteNews,
  };
};
