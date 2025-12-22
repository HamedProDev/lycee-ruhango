import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroCampus from "@/assets/hero-campus.jpg";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  published_at: string | null;
  created_at: string;
}

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .eq("published", true)
          .order("published_at", { ascending: false });

        if (error) throw error;
        setNews(data || []);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <>
      <Helmet>
        <title>News & Events | Lycée de Ruhango Ikirezi TSS</title>
        <meta name="description" content="Stay updated with the latest news, events, and achievements at Lycée de Ruhango Ikirezi Technical Secondary School." />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="relative h-[250px] md:h-[300px]">
          <img src={heroCampus} alt="Campus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-background">
              <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">News & Events</h1>
              <p className="text-lg text-background/90">Stay updated with our latest happenings</p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">No news articles available at the moment.</p>
                <p className="text-muted-foreground mt-2">Check back soon for updates!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.map((item) => (
                  <article 
                    key={item.id} 
                    className="bg-card rounded-xl overflow-hidden shadow-soft card-hover cursor-pointer"
                    onClick={() => setSelectedNews(item)}
                  >
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
                      <span className="text-primary font-medium text-sm hover:underline">
                        Read More →
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* News Detail Modal */}
        {selectedNews && (
          <div 
            className="fixed inset-0 bg-foreground/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedNews(null)}
          >
            <div 
              className="bg-card rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedNews.image_url && (
                <img 
                  src={selectedNews.image_url} 
                  alt={selectedNews.title} 
                  className="w-full h-64 object-cover"
                />
              )}
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedNews.published_at || selectedNews.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold font-poppins text-foreground mb-6">
                  {selectedNews.title}
                </h2>
                <div className="prose prose-sm max-w-none text-foreground">
                  {selectedNews.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
                <button 
                  className="mt-8 text-primary font-medium hover:underline"
                  onClick={() => setSelectedNews(null)}
                >
                  ← Back to News
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
};

export default News;
