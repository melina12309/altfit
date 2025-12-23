import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryPills } from "@/components/CategoryPills";
import { BudgetSlider } from "@/components/BudgetSlider";
import { HowItWorks } from "@/components/HowItWorks";
import { AIAssistant } from "@/components/AIAssistant";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <CategoryPills />
      <BudgetSlider />
      <HowItWorks />
      <Footer />
      <AIAssistant />
    </main>
  );
};

export default Index;
