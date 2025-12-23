export interface OutfitItemData {
  id: string;
  category: "top" | "bottom" | "shoes" | "bag" | "accessory";
  name: string;
  brand: string;
  price: number;
  image: string;
  shopUrl?: string;
  isLocked?: boolean;
}

export interface OutfitAlternative extends OutfitItemData {
  originalItemId: string;
}

export const SAMPLE_OUTFIT: OutfitItemData[] = [
  {
    id: "top-1",
    category: "top",
    name: "Oversized Blazer",
    brand: "Zara",
    price: 89,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop",
    shopUrl: "https://zara.com",
  },
  {
    id: "bottom-1",
    category: "bottom",
    name: "Wide Leg Trousers",
    brand: "COS",
    price: 79,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
    shopUrl: "https://cos.com",
  },
  {
    id: "shoes-1",
    category: "shoes",
    name: "Leather Loafers",
    brand: "Mango",
    price: 59,
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop",
    shopUrl: "https://mango.com",
  },
  {
    id: "bag-1",
    category: "bag",
    name: "Structured Tote",
    brand: "& Other Stories",
    price: 129,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop",
    shopUrl: "https://stories.com",
  },
  {
    id: "accessory-1",
    category: "accessory",
    name: "Gold Hoop Earrings",
    brand: "H&M",
    price: 12,
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=500&fit=crop",
    shopUrl: "https://hm.com",
  },
];

export const ALTERNATIVES: Record<string, OutfitAlternative[]> = {
  "top-1": [
    {
      id: "top-alt-1",
      originalItemId: "top-1",
      category: "top",
      name: "Structured Blazer",
      brand: "H&M",
      price: 49,
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
      shopUrl: "https://hm.com",
    },
    {
      id: "top-alt-2",
      originalItemId: "top-1",
      category: "top",
      name: "Linen Blend Blazer",
      brand: "Arket",
      price: 149,
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop",
      shopUrl: "https://arket.com",
    },
    {
      id: "top-alt-3",
      originalItemId: "top-1",
      category: "top",
      name: "Vintage Wool Blazer",
      brand: "Vestiaire",
      price: 85,
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop",
      shopUrl: "https://vestiairecollective.com",
    },
  ],
  "bottom-1": [
    {
      id: "bottom-alt-1",
      originalItemId: "bottom-1",
      category: "bottom",
      name: "Pleated Trousers",
      brand: "Zara",
      price: 45,
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
      shopUrl: "https://zara.com",
    },
    {
      id: "bottom-alt-2",
      originalItemId: "bottom-1",
      category: "bottom",
      name: "Tailored Pants",
      brand: "Mango",
      price: 59,
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
      shopUrl: "https://mango.com",
    },
  ],
  "shoes-1": [
    {
      id: "shoes-alt-1",
      originalItemId: "shoes-1",
      category: "shoes",
      name: "Suede Loafers",
      brand: "H&M",
      price: 35,
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop",
      shopUrl: "https://hm.com",
    },
    {
      id: "shoes-alt-2",
      originalItemId: "shoes-1",
      category: "shoes",
      name: "Ballet Flats",
      brand: "COS",
      price: 89,
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop",
      shopUrl: "https://cos.com",
    },
  ],
  "bag-1": [
    {
      id: "bag-alt-1",
      originalItemId: "bag-1",
      category: "bag",
      name: "Canvas Tote",
      brand: "Arket",
      price: 45,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop",
      shopUrl: "https://arket.com",
    },
    {
      id: "bag-alt-2",
      originalItemId: "bag-1",
      category: "bag",
      name: "Vintage Leather Bag",
      brand: "Vinted",
      price: 35,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop",
      shopUrl: "https://vinted.com",
    },
  ],
  "accessory-1": [
    {
      id: "acc-alt-1",
      originalItemId: "accessory-1",
      category: "accessory",
      name: "Silver Hoops",
      brand: "Zara",
      price: 15,
      image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=500&fit=crop",
      shopUrl: "https://zara.com",
    },
  ],
};

export const CATEGORY_LABELS: Record<string, string> = {
  top: "Top",
  bottom: "Bottom",
  shoes: "Shoes",
  bag: "Bag",
  accessory: "Accessory",
};
