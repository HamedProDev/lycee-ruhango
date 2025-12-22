import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import heroCampus from "@/assets/hero-campus.jpg";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  published_at: string | null;
  created_at: string;
}

const LatestNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const { data, error } = await supabase
          .from("news")
          .select("id, title, excerpt, content, image_url, published_at, created_at")
          .eq("published", true)
          .order("published_at", { ascending: false })
          .limit(3);

        if (error) throw error;
        setNews(data || []);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestNews();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (news.length === 0) {
    return null; // Don't show section if no news
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins text-foreground mb-4">
            Latest News & Events
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest happenings at our school
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => (
            <article key={item.id} className="bg-card rounded-xl overflow-hidden shadow-soft card-hover">
              <div className="relative h-52">
                <img
                  src={item.image_url || heroCampus}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4" />
                  {new Date(item.published_at || item.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <h3 className="text-lg font-bold font-poppins text-foreground mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {item.excerpt || item.content.substring(0, 150)}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/news">
            <Button variant="outline" size="lg">
              View All News
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
