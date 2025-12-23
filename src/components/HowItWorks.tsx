import { motion } from "framer-motion";
import { Sparkles, Sliders, ShoppingBag, Heart } from "lucide-react";

const steps = [
  {
    icon: Sparkles,
    title: "Find Inspiration",
    description: "Upload a photo, pick a celebrity, or describe your vibe",
  },
  {
    icon: Sliders,
    title: "Set Your Budget",
    description: "Slide to regenerate looks at any price point",
  },
  {
    icon: ShoppingBag,
    title: "Shop Smarter",
    description: "Mix new pieces with pre-loved finds from trusted sellers",
  },
  {
    icon: Heart,
    title: "Save & Remix",
    description: "Build collections and personalize any outfit",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs editorial-spacing text-muted-foreground mb-3">
            SIMPLE & POWERFUL
          </p>
          <h2 className="text-3xl md:text-4xl font-serif">
            How it works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-border" />
              )}

              <div className="relative z-10 text-center lg:text-left">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-secondary mb-6">
                  <step.icon className="w-7 h-7 text-accent" />
                </div>
                <div className="absolute -top-2 -left-2 lg:left-auto lg:-right-2 text-7xl font-serif text-secondary/80 -z-10">
                  {index + 1}
                </div>
                <h3 className="font-serif text-xl mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
