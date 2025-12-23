import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Share2, ShoppingBag, ExternalLink, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { addFavorite, removeFavorite, isFavorite } from "@/lib/favorites";
import { useToast } from "@/hooks/use-toast";
import outfit1 from "@/assets/outfit-1.jpg";
import outfit2 from "@/assets/outfit-2.jpg";
import outfit3 from "@/assets/outfit-3.jpg";

// Mock data - in a real app this would come from an API
const outfitsData: Record<string, OutfitData> = {
  "1": {
    id: "1",
    title: "The Power Look",
    inspiration: "Street Style",
    description: "A sophisticated ensemble that transitions seamlessly from boardroom to evening drinks. Sharp tailoring meets modern minimalism.",
    image: outfit1,
    totalPrice: { min: 89, max: 245 },
    savedAmount: 320,
    products: [
      {
        id: "p1",
        name: "Structured Blazer",
        brand: "Zara",
        price: 89.90,
        originalPrice: 129.90,
        image: outfit1,
        category: "Outerwear",
        affiliateUrl: "https://zara.com",
        isNew: true,
      },
      {
        id: "p2",
        name: "High-Waist Trousers",
        brand: "COS",
        price: 79.00,
        originalPrice: 99.00,
        image: outfit2,
        category: "Bottoms",
        affiliateUrl: "https://cos.com",
        isPreLoved: true,
      },
      {
        id: "p3",
        name: "Silk Camisole",
        brand: "& Other Stories",
        price: 45.00,
        image: outfit3,
        category: "Tops",
        affiliateUrl: "https://stories.com",
        isNew: true,
      },
      {
        id: "p4",
        name: "Leather Ankle Boots",
        brand: "Mango",
        price: 119.00,
        originalPrice: 159.00,
        image: outfit1,
        category: "Shoes",
        affiliateUrl: "https://mango.com",
        isNew: true,
      },
      {
        id: "p5",
        name: "Minimalist Watch",
        brand: "Vestiaire Collective",
        price: 85.00,
        originalPrice: 250.00,
        image: outfit2,
        category: "Accessories",
        affiliateUrl: "https://vestiairecollective.com",
        isPreLoved: true,
      },
    ],
  },
  "2": {
    id: "2",
    title: "Urban Essential",
    inspiration: "Fashion Week",
    description: "Effortlessly cool street style that captures the essence of modern fashion capitals. Perfect for the style-conscious urbanite.",
    image: outfit2,
    totalPrice: { min: 120, max: 380 },
    savedAmount: 280,
    products: [
      {
        id: "p1",
        name: "Oversized Coat",
        brand: "Arket",
        price: 189.00,
        originalPrice: 249.00,
        image: outfit2,
        category: "Outerwear",
        affiliateUrl: "https://arket.com",
        isNew: true,
      },
      {
        id: "p2",
        name: "Wide-Leg Jeans",
        brand: "Vinted",
        price: 35.00,
        originalPrice: 89.00,
        image: outfit1,
        category: "Bottoms",
        affiliateUrl: "https://vinted.com",
        isPreLoved: true,
      },
      {
        id: "p3",
        name: "Cashmere Sweater",
        brand: "Uniqlo",
        price: 79.90,
        image: outfit3,
        category: "Tops",
        affiliateUrl: "https://uniqlo.com",
        isNew: true,
      },
      {
        id: "p4",
        name: "Leather Tote",
        brand: "TheRealReal",
        price: 145.00,
        originalPrice: 450.00,
        image: outfit2,
        category: "Bags",
        affiliateUrl: "https://therealreal.com",
        isPreLoved: true,
      },
    ],
  },
  "3": {
    id: "3",
    title: "Evening Edit",
    inspiration: "Editorial",
    description: "Refined elegance for those special moments. A curated selection that exudes sophistication and timeless style.",
    image: outfit3,
    totalPrice: { min: 150, max: 420 },
    savedAmount: 450,
    products: [
      {
        id: "p1",
        name: "Slip Dress",
        brand: "Massimo Dutti",
        price: 129.00,
        image: outfit3,
        category: "Dresses",
        affiliateUrl: "https://massimodutti.com",
        isNew: true,
      },
      {
        id: "p2",
        name: "Statement Earrings",
        brand: "Vestiaire Collective",
        price: 65.00,
        originalPrice: 180.00,
        image: outfit1,
        category: "Jewelry",
        affiliateUrl: "https://vestiairecollective.com",
        isPreLoved: true,
      },
      {
        id: "p3",
        name: "Strappy Heels",
        brand: "Zara",
        price: 79.90,
        image: outfit2,
        category: "Shoes",
        affiliateUrl: "https://zara.com",
        isNew: true,
      },
    ],
  },
};

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  affiliateUrl: string;
  isNew?: boolean;
  isPreLoved?: boolean;
}

interface OutfitData {
  id: string;
  title: string;
  inspiration: string;
  description: string;
  image: string;
  totalPrice: { min: number; max: number };
  savedAmount: number;
  products: Product[];
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group bg-card border border-border hover:border-foreground/20 transition-all duration-300"
    >
      <div className="flex">
        {/* Product Image */}
        <div className="relative w-32 md:w-40 aspect-square overflow-hidden flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isPreLoved && (
              <span className="px-2 py-0.5 bg-foreground text-background text-[10px] font-medium uppercase">
                Pre-loved
              </span>
            )}
            {discount > 0 && (
              <span className="px-2 py-0.5 bg-foreground text-background text-[10px] font-medium">
                -{discount}%
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase editorial-spacing mb-1">
              {product.category}
            </p>
            <h3 className="font-serif text-lg mb-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.brand}</p>
          </div>

          <div className="flex items-end justify-between mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-medium">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              Shop
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function OutfitDetail() {
  const { id } = useParams<{ id: string }>();
  const outfit = outfitsData[id || "1"];
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && id) {
      isFavorite(id).then(setIsFav).catch(console.error);
    }
  }, [id, user]);

  const handleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites.",
      });
      navigate("/auth");
      return;
    }

    if (!id) return;
    
    setLoading(true);
    try {
      if (isFav) {
        await removeFavorite(id);
        setIsFav(false);
        toast({ title: "Removed from favorites" });
      } else {
        await addFavorite(id);
        setIsFav(true);
        toast({ title: "Added to favorites" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!outfit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Outfit not found</p>
      </div>
    );
  }

  const totalCurrentPrice = outfit.products.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Back navigation */}
        <div className="container py-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to looks
          </Link>
        </div>

        {/* Hero Section */}
        <section className="container pb-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[3/4] overflow-hidden bg-muted"
            >
              <img
                src={outfit.image}
                alt={outfit.title}
                className="w-full h-full object-cover"
              />
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleFavorite}
                  disabled={loading}
                  className={`bg-background/90 backdrop-blur-sm rounded-none h-10 w-10 ${isFav ? "text-red-500" : ""}`}
                >
                  <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                </Button>
                <Button variant="outline" size="icon" className="bg-background/90 backdrop-blur-sm rounded-none h-10 w-10">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col"
            >
              <span className="text-xs text-muted-foreground uppercase editorial-spacing mb-4">
                {outfit.inspiration}
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight mb-6">
                {outfit.title}
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
                {outfit.description}
              </p>

              {/* Price Summary */}
              <div className="border border-border p-6 mb-8">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Total outfit price</span>
                  <span className="text-3xl font-serif">${totalCurrentPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4" />
                  <span>You save ${outfit.savedAmount} vs. original prices</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mb-8 pb-8 border-b border-border">
                <div>
                  <p className="text-2xl font-serif">{outfit.products.length}</p>
                  <p className="text-xs text-muted-foreground editorial-spacing mt-1">ITEMS</p>
                </div>
                <div>
                  <p className="text-2xl font-serif">{outfit.products.filter(p => p.isPreLoved).length}</p>
                  <p className="text-xs text-muted-foreground editorial-spacing mt-1">PRE-LOVED</p>
                </div>
                <div className="flex items-start gap-1">
                  <p className="text-2xl font-serif">4.8</p>
                  <Star className="w-4 h-4 mt-1" />
                  <p className="text-xs text-muted-foreground editorial-spacing mt-2 ml-1">RATING</p>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="flex-1 bg-foreground text-background hover:bg-foreground/90 rounded-none h-14">
                  <ShoppingBag className="w-4 h-4 mr-3" />
                  Shop All Items
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleFavorite}
                  disabled={loading}
                  className={`flex-1 rounded-none border-foreground h-14 ${isFav ? "bg-foreground/5" : ""}`}
                >
                  <Heart className={`w-4 h-4 mr-3 ${isFav ? "fill-current text-red-500" : ""}`} />
                  {isFav ? "Saved" : "Save Look"}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Products Breakdown */}
        <section className="border-t border-border">
          <div className="container py-16 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <span className="text-xs text-muted-foreground uppercase editorial-spacing mb-4 block">
                SHOP THE LOOK
              </span>
              <h2 className="text-3xl md:text-4xl font-serif tracking-tight">
                Product breakdown
              </h2>
            </motion.div>

            <div className="grid gap-4">
              {outfit.products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>

            {/* Affiliate Disclosure */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs text-muted-foreground mt-8 pt-8 border-t border-border"
            >
              * We may earn a commission when you shop through our affiliate links. This helps support our platform at no extra cost to you.
            </motion.p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}