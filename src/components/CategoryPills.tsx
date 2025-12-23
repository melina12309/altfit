import { motion } from "framer-motion";
import { Tv, Star, Calendar, Camera, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = [
  { 
    icon: Tv, 
    label: "TV Shows", 
    examples: ["Emily in Paris", "Euphoria", "Succession"],
    prompt: "Emily in Paris outfit",
    gradient: "from-purple-500/10 to-pink-500/10",
    iconColor: "text-purple-500"
  },
  { 
    icon: Star, 
    label: "Celebrities", 
    examples: ["Hailey Bieber", "Zendaya", "Bella Hadid"],
    prompt: "Hailey Bieber street style",
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-500"
  },
  { 
    icon: Calendar, 
    label: "Events", 
    examples: ["Met Gala", "Fashion Week", "Red Carpet"],
    prompt: "Met Gala inspired look",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-500"
  },
  { 
    icon: Camera, 
    label: "Photo Match", 
    examples: ["Screenshot any outfit", "Pinterest saves", "Instagram"],
    prompt: "Help me match this outfit",
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-500"
  },
  { 
    icon: Sparkles, 
    label: "Describe a Vibe", 
    examples: ["Quiet luxury", "Y2K aesthetic", "Dark academia"],
    prompt: "Quiet luxury aesthetic outfit",
    gradient: "from-rose-500/10 to-red-500/10",
    iconColor: "text-rose-500"
  },
];

export function CategoryPills() {
  const navigate = useNavigate();

  const handleCategoryClick = (prompt: string) => {
    navigate(`/stylist?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <section id="discover" className="py-20 md:py-28 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs editorial-spacing text-muted-foreground mb-3">
            HOW IT WORKS
          </p>
          <h2 className="text-3xl md:text-5xl font-serif mb-4">
            From inspiration to wardrobe
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Tell us what inspires you and we'll create shoppable outfits at your budget
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((category, index) => (
            <motion.button
              key={category.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              onClick={() => handleCategoryClick(category.prompt)}
              className="group relative bg-card border border-border rounded-2xl p-6 text-left hover:border-foreground/20 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className={`w-6 h-6 ${category.iconColor}`} />
                </div>

                {/* Label */}
                <h3 className="font-medium text-lg mb-3">{category.label}</h3>

                {/* Examples */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {category.examples.map((example) => (
                    <span 
                      key={example} 
                      className="text-xs px-2 py-1 bg-foreground/5 rounded-full text-muted-foreground"
                    >
                      {example}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  <span>Try it</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Visual flow indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 flex items-center justify-center gap-4"
        >
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-medium">1</span>
            <span>Pick your inspiration</span>
          </div>
          <div className="w-8 h-px bg-border" />
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-medium">2</span>
            <span>Set your budget</span>
          </div>
          <div className="w-8 h-px bg-border" />
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-medium">3</span>
            <span>Shop the look</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
