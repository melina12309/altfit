import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Share2, Sparkles, ShoppingBag, ArrowRight } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import outfit1 from "@/assets/outfit-1.jpg";
import outfit2 from "@/assets/outfit-2.jpg";
import outfit3 from "@/assets/outfit-3.jpg";

interface Look {
  id: string;
  title: string;
  image: string;
  price: string;
  items: number;
}

interface MomentData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  looks: Look[];
}

const momentsData: Record<string, MomentData> = {
  "emily-in-paris": {
    id: "emily-in-paris",
    title: "Emily in Paris",
    subtitle: "Season 4 style guide",
    description: "Channel Emily Cooper's bold Parisian style with our curated collection of affordable alternatives. From statement coats to designer-look accessories, recreate the magic without the price tag.",
    image: outfit1,
    looks: [
      { id: "1", title: "The Pink Power Look", image: outfit1, price: "$89", items: 4 },
      { id: "2", title: "Café Chic", image: outfit2, price: "$120", items: 5 },
      { id: "3", title: "Gallery Opening", image: outfit3, price: "$150", items: 4 },
      { id: "4", title: "Office à la Française", image: outfit1, price: "$95", items: 3 },
      { id: "5", title: "Weekend Stroll", image: outfit2, price: "$75", items: 4 },
      { id: "6", title: "Evening Soirée", image: outfit3, price: "$180", items: 5 },
    ],
  },
  "hailey-bieber": {
    id: "hailey-bieber",
    title: "Hailey Bieber",
    subtitle: "Street style essentials",
    description: "Master Hailey's effortlessly cool aesthetic with clean lines, neutral tones, and statement pieces that elevate any outfit.",
    image: outfit2,
    looks: [
      { id: "1", title: "Model Off-Duty", image: outfit2, price: "$110", items: 4 },
      { id: "2", title: "Airport Chic", image: outfit3, price: "$95", items: 3 },
      { id: "3", title: "Errand Run Glam", image: outfit1, price: "$80", items: 4 },
      { id: "4", title: "Date Night Minimal", image: outfit2, price: "$140", items: 4 },
    ],
  },
  "quiet-luxury": {
    id: "quiet-luxury",
    title: "Quiet Luxury",
    subtitle: "Understated elegance",
    description: "Embrace the art of subtle sophistication. Quality fabrics, impeccable tailoring, and timeless pieces that whisper rather than shout.",
    image: outfit1,
    looks: [
      { id: "1", title: "The Row Inspired", image: outfit1, price: "$160", items: 4 },
      { id: "2", title: "Cashmere Dreams", image: outfit3, price: "$200", items: 3 },
      { id: "3", title: "Boardroom Ready", image: outfit2, price: "$180", items: 5 },
      { id: "4", title: "Weekend Luxe", image: outfit1, price: "$140", items: 4 },
      { id: "5", title: "Neutral Territory", image: outfit3, price: "$120", items: 4 },
    ],
  },
};

// Default fallback for unlisted moments
const defaultMoment: MomentData = {
  id: "default",
  title: "Coming Soon",
  subtitle: "Stay tuned",
  description: "We're curating the perfect looks for this moment. Check back soon!",
  image: outfit1,
  looks: [
    { id: "1", title: "Look 1", image: outfit1, price: "$100", items: 4 },
    { id: "2", title: "Look 2", image: outfit2, price: "$120", items: 5 },
    { id: "3", title: "Look 3", image: outfit3, price: "$90", items: 3 },
  ],
};

export default function MomentDetail() {
  const { momentId } = useParams();
  const navigate = useNavigate();
  const [selectedBudget, setSelectedBudget] = useState<"low" | "mid" | "high">("mid");

  const moment = momentsData[momentId || ""] || defaultMoment;

  const handleTalkToStylist = () => {
    navigate(`/stylist?q=${encodeURIComponent(`Create a ${moment.title} inspired outfit`)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={moment.image}
          alt={moment.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back button */}
        <Link
          to="/explore"
          className="absolute top-24 left-6 md:left-12 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back to Explore</span>
        </Link>

        {/* Actions */}
        <div className="absolute top-24 right-6 md:right-12 flex items-center gap-2">
          <Button variant="ghost" size="icon" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white">
            <Heart className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm text-white/60 mb-2 editorial-spacing">{moment.subtitle.toUpperCase()}</p>
              <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">{moment.title}</h1>
              <p className="text-white/70 max-w-2xl">{moment.description}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="py-12">
        <div className="container">
          {/* Budget filter & CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10"
          >
            <div>
              <h2 className="text-2xl font-serif mb-2">Curated Looks</h2>
              <p className="text-muted-foreground">Shop the aesthetic at your price point</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-full">
                {(["low", "mid", "high"] as const).map((budget) => (
                  <button
                    key={budget}
                    onClick={() => setSelectedBudget(budget)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                      selectedBudget === budget
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {budget === "low" ? "Under $100" : budget === "mid" ? "$100-200" : "$200+"}
                  </button>
                ))}
              </div>

              <Button onClick={handleTalkToStylist} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Ask AI Stylist
              </Button>
            </div>
          </motion.div>

          {/* Looks grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {moment.looks.map((look, index) => (
              <motion.div
                key={look.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link
                  to={`/outfit/${look.id}`}
                  className="group block bg-card rounded-xl overflow-hidden border border-border hover:border-foreground/20 hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={look.image}
                      alt={look.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Quick shop button */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" className="w-full gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        View Look
                      </Button>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium mb-1">{look.title}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">From {look.price}</span>
                      <span className="text-muted-foreground">{look.items} items</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Related moments */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 pt-12 border-t border-border"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-serif">You might also like</h2>
              <Link to="/explore" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.values(momentsData)
                .filter(m => m.id !== moment.id)
                .slice(0, 4)
                .map((relatedMoment) => (
                  <Link
                    key={relatedMoment.id}
                    to={`/explore/${relatedMoment.id}`}
                    className="group block relative aspect-square rounded-xl overflow-hidden"
                  >
                    <img
                      src={relatedMoment.image}
                      alt={relatedMoment.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-serif text-lg">{relatedMoment.title}</h3>
                    </div>
                  </Link>
                ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
