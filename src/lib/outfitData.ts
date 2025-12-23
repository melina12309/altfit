export type Gender = "women" | "men";

// Category type supports both legacy and new DB categories
export type ItemCategory = "top" | "bottom" | "shoes" | "bag" | "accessory" | "tops" | "bottoms" | "outerwear" | "accessories";

export interface OutfitItemData {
  id: string;
  category: ItemCategory;
  name: string;
  brand: string;
  price: number;
  image: string;
  shopUrl?: string;
  isLocked?: boolean;
  gender?: Gender | "unisex";
}

export interface OutfitAlternative extends OutfitItemData {
  originalItemId: string;
}

export const SAMPLE_OUTFITS: Record<Gender, OutfitItemData[]> = {
  women: [
    {
      id: "w-top-1",
      category: "top",
      name: "Oversized Blazer",
      brand: "Zara",
      price: 89,
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop",
      shopUrl: "https://zara.com",
      gender: "women",
    },
    {
      id: "w-bottom-1",
      category: "bottom",
      name: "Wide Leg Trousers",
      brand: "COS",
      price: 79,
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
      shopUrl: "https://cos.com",
      gender: "women",
    },
    {
      id: "w-shoes-1",
      category: "shoes",
      name: "Leather Loafers",
      brand: "Mango",
      price: 59,
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop",
      shopUrl: "https://mango.com",
      gender: "women",
    },
    {
      id: "w-bag-1",
      category: "bag",
      name: "Structured Tote",
      brand: "& Other Stories",
      price: 129,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop",
      shopUrl: "https://stories.com",
      gender: "women",
    },
    {
      id: "w-accessory-1",
      category: "accessory",
      name: "Gold Hoop Earrings",
      brand: "H&M",
      price: 12,
      image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=500&fit=crop",
      shopUrl: "https://hm.com",
      gender: "women",
    },
  ],
  men: [
    {
      id: "m-top-1",
      category: "top",
      name: "Cotton Oxford Shirt",
      brand: "COS",
      price: 69,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop",
      shopUrl: "https://cos.com",
      gender: "men",
    },
    {
      id: "m-bottom-1",
      category: "bottom",
      name: "Slim Chinos",
      brand: "Zara",
      price: 49,
      image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop",
      shopUrl: "https://zara.com",
      gender: "men",
    },
    {
      id: "m-shoes-1",
      category: "shoes",
      name: "Leather Sneakers",
      brand: "Mango",
      price: 79,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop",
      shopUrl: "https://mango.com",
      gender: "men",
    },
    {
      id: "m-bag-1",
      category: "bag",
      name: "Canvas Messenger",
      brand: "Arket",
      price: 89,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop",
      shopUrl: "https://arket.com",
      gender: "men",
    },
    {
      id: "m-accessory-1",
      category: "accessory",
      name: "Leather Belt",
      brand: "H&M",
      price: 19,
      image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&h=500&fit=crop",
      shopUrl: "https://hm.com",
      gender: "men",
    },
  ],
};

// Keep SAMPLE_OUTFIT for backwards compatibility
export const SAMPLE_OUTFIT = SAMPLE_OUTFITS.women;

export const ALTERNATIVES: Record<string, OutfitAlternative[]> = {
  // Women's alternatives
  "w-top-1": [
    {
      id: "w-top-alt-1",
      originalItemId: "w-top-1",
      category: "top",
      name: "Structured Blazer",
      brand: "H&M",
      price: 49,
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
      shopUrl: "https://hm.com",
      gender: "women",
    },
    {
      id: "w-top-alt-2",
      originalItemId: "w-top-1",
      category: "top",
      name: "Linen Blend Blazer",
      brand: "Arket",
      price: 149,
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop",
      shopUrl: "https://arket.com",
      gender: "women",
    },
  ],
  "w-bottom-1": [
    {
      id: "w-bottom-alt-1",
      originalItemId: "w-bottom-1",
      category: "bottom",
      name: "Pleated Trousers",
      brand: "Zara",
      price: 45,
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
      shopUrl: "https://zara.com",
      gender: "women",
    },
  ],
  "w-shoes-1": [
    {
      id: "w-shoes-alt-1",
      originalItemId: "w-shoes-1",
      category: "shoes",
      name: "Suede Loafers",
      brand: "H&M",
      price: 35,
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop",
      shopUrl: "https://hm.com",
      gender: "women",
    },
  ],
  "w-bag-1": [
    {
      id: "w-bag-alt-1",
      originalItemId: "w-bag-1",
      category: "bag",
      name: "Canvas Tote",
      brand: "Arket",
      price: 45,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop",
      shopUrl: "https://arket.com",
      gender: "women",
    },
  ],
  "w-accessory-1": [
    {
      id: "w-acc-alt-1",
      originalItemId: "w-accessory-1",
      category: "accessory",
      name: "Silver Hoops",
      brand: "Zara",
      price: 15,
      image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=500&fit=crop",
      shopUrl: "https://zara.com",
      gender: "women",
    },
  ],
  // Men's alternatives
  "m-top-1": [
    {
      id: "m-top-alt-1",
      originalItemId: "m-top-1",
      category: "top",
      name: "Linen Shirt",
      brand: "H&M",
      price: 35,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop",
      shopUrl: "https://hm.com",
      gender: "men",
    },
    {
      id: "m-top-alt-2",
      originalItemId: "m-top-1",
      category: "top",
      name: "Knit Polo",
      brand: "Arket",
      price: 59,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop",
      shopUrl: "https://arket.com",
      gender: "men",
    },
  ],
  "m-bottom-1": [
    {
      id: "m-bottom-alt-1",
      originalItemId: "m-bottom-1",
      category: "bottom",
      name: "Wide Fit Trousers",
      brand: "COS",
      price: 89,
      image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop",
      shopUrl: "https://cos.com",
      gender: "men",
    },
  ],
  "m-shoes-1": [
    {
      id: "m-shoes-alt-1",
      originalItemId: "m-shoes-1",
      category: "shoes",
      name: "Canvas Sneakers",
      brand: "H&M",
      price: 29,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop",
      shopUrl: "https://hm.com",
      gender: "men",
    },
  ],
  "m-bag-1": [
    {
      id: "m-bag-alt-1",
      originalItemId: "m-bag-1",
      category: "bag",
      name: "Leather Backpack",
      brand: "Vinted",
      price: 45,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop",
      shopUrl: "https://vinted.com",
      gender: "men",
    },
  ],
  "m-accessory-1": [
    {
      id: "m-acc-alt-1",
      originalItemId: "m-accessory-1",
      category: "accessory",
      name: "Woven Belt",
      brand: "Zara",
      price: 25,
      image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&h=500&fit=crop",
      shopUrl: "https://zara.com",
      gender: "men",
    },
  ],
};

export const CATEGORY_LABELS: Record<string, string> = {
  top: "Top",
  bottom: "Bottom",
  shoes: "Shoes",
  bag: "Bag",
  accessory: "Accessory",
  // DB categories
  tops: "Top",
  bottoms: "Bottom",
  outerwear: "Outerwear",
  accessories: "Accessory",
};
