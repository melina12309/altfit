import { useState } from "react";
import { motion } from "framer-motion";
import { Tv, Star, Calendar, TrendingUp, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import outfit1 from "@/assets/outfit-1.jpg";
import outfit2 from "@/assets/outfit-2.jpg";
import outfit3 from "@/assets/outfit-3.jpg";

type Category = "all" | "tv" | "celebrities" | "events" | "vibes";

interface CulturalMoment {
  id: string;
  title: string;
  subtitle: string;
  category: Category;
  image: string;
  looksCount: number;
  trending?: boolean;
  new?: boolean;
}

const categories = [
  { id: "all" as Category, label: "All", icon: TrendingUp },
  { id: "tv" as Category, label: "TV & Film", icon: Tv },
  { id: "celebrities" as Category, label: "Celebrities", icon: Star },
  { id: "events" as Category, label: "Events", icon: Calendar },
  { id: "vibes" as Category, label: "Trending Vibes", icon: TrendingUp },
];

const culturalMoments: CulturalMoment[] = [
  {
    id: "emily-in-paris",
    title: "Emily in Paris",
    subtitle: "Season 4 style guide",
    category: "tv",
    image: outfit1,
    looksCount: 24,
    trending: true,
  },
  {
    id: "hailey-bieber",
    title: "Hailey Bieber",
    subtitle: "Street style essentials",
    category: "celebrities",
    image: outfit2,
    looksCount: 18,
    trending: true,
  },
  {
    id: "met-gala-2024",
    title: "Met Gala 2024",
    subtitle: "Garden of Time inspired",
    category: "events",
    image: outfit3,
    looksCount: 32,
    new: true,
  },
  {
    id: "quiet-luxury",
    title: "Quiet Luxury",
    subtitle: "Understated elegance",
    category: "vibes",
    image: outfit1,
    looksCount: 28,
    trending: true,
  },
  {
    id: "succession",
    title: "Succession",
    subtitle: "Billionaire dressing",
    category: "tv",
    image: outfit2,
    looksCount: 16,
  },
  {
    id: "zendaya",
    title: "Zendaya",
    subtitle: "Red carpet moments",
    category: "celebrities",
    image: outfit3,
    looksCount: 22,
    trending: true,
  },
  {
    id: "fashion-week-ss24",
    title: "Fashion Week SS24",
    subtitle: "Runway to real life",
    category: "events",
    image: outfit1,
    looksCount: 45,
  },
  {
    id: "old-money-aesthetic",
    title: "Old Money",
    subtitle: "Classic sophistication",
    category: "vibes",
    image: outfit2,
    looksCount: 34,
  },
  {
    id: "euphoria",
    title: "Euphoria",
    subtitle: "Bold Gen-Z style",
    category: "tv",
    image: outfit3,
    looksCount: 29,
  },
  {
    id: "bella-hadid",
    title: "Bella Hadid",
    subtitle: "Off-duty model looks",
    category: "celebrities",
    image: outfit1,
    looksCount: 21,
  },
  {
    id: "coachella-2024",
    title: "Coachella 2024",
    subtitle: "Festival fashion",
    category: "events",
    image: outfit2,
    looksCount: 38,
    new: true,
  },
  {
    id: "dark-academia",
    title: "Dark Academia",
    subtitle: "Scholarly aesthetic",
    category: "vibes",
    image: outfit3,
    looksCount: 26,
  },
];

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filteredMoments = activeCategory === "all" 
    ? culturalMoments 
    : culturalMoments.filter(m => m.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-serif mb-4">
              Explore
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Discover trending cultural moments and get inspired outfits at every price point
            </p>
          </motion.div>

          {/* Category tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-foreground text-background"
                    : "bg-card border border-border hover:border-foreground/20"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </motion.div>

          {/* Featured moment (first trending) */}
          {activeCategory === "all" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <Link 
                to={`/explore/${culturalMoments[0].id}`}
                className="group block relative rounded-2xl overflow-hidden aspect-[21/9] bg-card"
              >
                <img
                  src={culturalMoments[0].image}
                  alt={culturalMoments[0].title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                      TRENDING NOW
                    </span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white">
                      {culturalMoments[0].looksCount} looks
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-serif text-white mb-2">
                    {culturalMoments[0].title}
                  </h2>
                  <p className="text-white/70 text-lg mb-4">{culturalMoments[0].subtitle}</p>
                  <div className="flex items-center gap-2 text-white group-hover:gap-3 transition-all">
                    <Play className="w-5 h-5" />
                    <span className="font-medium">Explore looks</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Moments grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMoments.slice(activeCategory === "all" ? 1 : 0).map((moment, index) => (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link
                  to={`/explore/${moment.id}`}
                  className="group block bg-card rounded-xl overflow-hidden border border-border hover:border-foreground/20 hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={moment.image}
                      alt={moment.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Tags */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {moment.trending && (
                        <span className="px-2 py-1 bg-foreground text-background text-xs font-medium rounded-full">
                          Trending
                        </span>
                      )}
                      {moment.new && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-serif text-xl mb-1">{moment.title}</h3>
                      <p className="text-sm text-white/70 mb-2">{moment.subtitle}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50">{moment.looksCount} looks</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
