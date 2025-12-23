import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";

const budgetTiers = [
  { max: 100, label: "Budget Friendly", brands: "Shein, H&M, Primark" },
  { max: 250, label: "Smart Shopping", brands: "Zara, Mango, ASOS" },
  { max: 500, label: "Elevated Casual", brands: "& Other Stories, COS, Arket" },
  { max: 1000, label: "Investment Pieces", brands: "Vestiaire, TheRealReal" },
];

export function BudgetSlider() {
  const [budget, setBudget] = useState([250]);

  const currentTier = budgetTiers.find((tier) => budget[0] <= tier.max) || budgetTiers[budgetTiers.length - 1];

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-xs editorial-spacing text-muted-foreground mb-3">
            STYLE AT YOUR PRICE
          </p>
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Set your budget
          </h2>
          <p className="text-muted-foreground">
            Slide to regenerate outfits at different price points
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-card rounded-2xl p-8 shadow-card"
        >
          {/* Budget Display */}
          <div className="text-center mb-8">
            <span className="text-5xl md:text-6xl font-serif">${budget[0]}</span>
            <p className="text-muted-foreground mt-2">{currentTier.label}</p>
          </div>

          {/* Slider */}
          <Slider
            value={budget}
            onValueChange={setBudget}
            min={50}
            max={1000}
            step={25}
            className="mb-6"
          />

          {/* Tier Info */}
          <div className="flex justify-between text-xs text-muted-foreground mb-8">
            <span>$50</span>
            <span>$1000+</span>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Suggested brands:</p>
            <p className="font-medium">{currentTier.brands}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" size="lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate at ${budget[0]}
            </Button>
            <Button variant="outline" size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              Mix New & Pre-loved
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
