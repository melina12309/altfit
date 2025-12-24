import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { 
  Package, 
  RefreshCw, 
  Download, 
  TrendingUp, 
  ShoppingBag,
  Tag,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  Plus,
  Link as LinkIcon,
  Image as ImageIcon,
  Save
} from "lucide-react";

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  errors: number;
  total: number;
  totalAvailable: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  nextOffset: number | null;
}

interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: Record<string, number>;
  byGender: Record<string, number>;
  byBrand: { brand: string; count: number }[];
  avgPrice: number;
  priceRange: { min: number; max: number };
}

interface Product {
  id: string;
  title: string;
  brand: string;
  category: string;
  gender: string;
  price: number;
  currency: string;
  retailer: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export default function Admin() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importLogs, setImportLogs] = useState<string[]>([]);
  const [limit, setLimit] = useState("1000");
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  
  // Manual product form state
  const [newProduct, setNewProduct] = useState({
    title: "",
    brand: "",
    category: "tops",
    gender: "unisex",
    price: "",
    currency: "EUR",
    retailer: "",
    affiliate_url: "",
    image_url: "",
    colors: "",
    style_tags: "",
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setCheckingRole(false);
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    };

    checkAdminRole();
  }, [user]);

  useEffect(() => {
    if (!checkingRole && isAdmin) {
      fetchStats();
      fetchProducts();
    }
  }, [checkingRole, isAdmin]);

  const fetchStats = async () => {
    try {
      // Fetch total and active counts
      const { count: total } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("provider", "awin_feed");

      const { count: active } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("provider", "awin_feed")
        .eq("is_active", true);

      // Fetch category breakdown
      const { data: categoryData } = await supabase
        .from("products")
        .select("category")
        .eq("provider", "awin_feed");

      const byCategory: Record<string, number> = {};
      categoryData?.forEach((p) => {
        byCategory[p.category] = (byCategory[p.category] || 0) + 1;
      });

      // Fetch gender breakdown
      const { data: genderData } = await supabase
        .from("products")
        .select("gender")
        .eq("provider", "awin_feed");

      const byGender: Record<string, number> = {};
      genderData?.forEach((p) => {
        byGender[p.gender] = (byGender[p.gender] || 0) + 1;
      });

      // Fetch top brands
      const { data: brandData } = await supabase
        .from("products")
        .select("brand")
        .eq("provider", "awin_feed");

      const brandCounts: Record<string, number> = {};
      brandData?.forEach((p) => {
        brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
      });
      const byBrand = Object.entries(brandCounts)
        .map(([brand, count]) => ({ brand, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Fetch price stats
      const { data: priceData } = await supabase
        .from("products")
        .select("price")
        .eq("provider", "awin_feed");

      const prices = priceData?.map((p) => p.price) || [];
      const avgPrice = prices.length > 0 
        ? prices.reduce((a, b) => a + b, 0) / prices.length 
        : 0;
      const priceRange = {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0,
      };

      setStats({
        total: total || 0,
        active: active || 0,
        inactive: (total || 0) - (active || 0),
        byCategory,
        byGender,
        byBrand,
        avgPrice,
        priceRange,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      let query = supabase
        .from("products")
        .select("id, title, brand, category, gender, price, currency, retailer, image_url, is_active, created_at")
        .eq("provider", "awin_feed")
        .order("created_at", { ascending: false })
        .limit(100);

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`);
      }
      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }
      if (genderFilter !== "all") {
        query = query.eq("gender", genderFilter);
      }
      if (statusFilter !== "all") {
        query = query.eq("is_active", statusFilter === "active");
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, categoryFilter, genderFilter, statusFilter, isAdmin]);

  const toggleProductActive = async (productId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !isActive })
        .eq("id", productId);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_active: !isActive } : p))
      );

      toast({
        title: isActive ? "Product Deactivated" : "Product Activated",
        description: `Product has been ${isActive ? "deactivated" : "activated"}`,
      });

      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setSelectedProducts((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });

      toast({
        title: "Product Deleted",
        description: "Product has been permanently deleted",
      });

      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const bulkToggleActive = async (activate: boolean) => {
    if (selectedProducts.size === 0) return;

    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: activate })
        .in("id", Array.from(selectedProducts));

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) =>
          selectedProducts.has(p.id) ? { ...p, is_active: activate } : p
        )
      );

      toast({
        title: activate ? "Products Activated" : "Products Deactivated",
        description: `${selectedProducts.size} products updated`,
      });

      setSelectedProducts(new Set());
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update products",
        variant: "destructive",
      });
    }
  };

  const bulkDelete = async () => {
    if (selectedProducts.size === 0) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", Array.from(selectedProducts));

      if (error) throw error;

      setProducts((prev) => prev.filter((p) => !selectedProducts.has(p.id)));

      toast({
        title: "Products Deleted",
        description: `${selectedProducts.size} products permanently deleted`,
      });

      setSelectedProducts(new Set());
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete products",
        variant: "destructive",
      });
    }
  };

  const toggleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
  };

  const runImport = async () => {
    setIsImporting(true);
    setImportProgress(0);
    setImportLogs([]);

    const batchSize = parseInt(limit);
    let offset = 0;
    let totalImported = 0;
    let totalAvailable = 0;
    let hasMore = true;

    try {
      while (hasMore) {
        setImportLogs((prev) => [...prev, `Importing batch at offset ${offset}...`]);

        const { data, error } = await supabase.functions.invoke("awin-import", {
          body: { limit: batchSize, offset },
        });

        if (error) {
          setImportLogs((prev) => [...prev, `❌ Error: ${error.message}`]);
          break;
        }

        const result = data as ImportResult;
        totalImported += result.imported;
        totalAvailable = result.totalAvailable;
        hasMore = result.hasMore;
        offset = result.nextOffset || offset + batchSize;

        const progress = Math.min((offset / totalAvailable) * 100, 100);
        setImportProgress(progress);

        setImportLogs((prev) => [
          ...prev,
          `✅ Imported ${result.imported} products (${offset} / ${totalAvailable})`,
        ]);

        if (!hasMore) {
          setImportLogs((prev) => [...prev, `🎉 Import complete! Total: ${totalImported} products`]);
        }
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${totalImported} products`,
      });

      fetchStats();
      fetchProducts();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setImportLogs((prev) => [...prev, `❌ Fatal error: ${errorMessage}`]);
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const runSingleBatch = async () => {
    setIsImporting(true);
    setImportLogs([]);

    try {
      setImportLogs(["Importing single batch..."]);

      const { data, error } = await supabase.functions.invoke("awin-import", {
        body: { limit: parseInt(limit) },
      });

      if (error) throw error;

      const result = data as ImportResult;
      setImportLogs([
        `✅ Imported ${result.imported} products`,
        `Total available: ${result.totalAvailable}`,
        result.hasMore ? `More products available at offset ${result.nextOffset}` : "All products imported",
      ]);

      toast({
        title: "Batch Import Complete",
        description: `Imported ${result.imported} products`,
      });

      fetchStats();
      fetchProducts();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setImportLogs([`❌ Error: ${errorMessage}`]);
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.title || !newProduct.brand || !newProduct.affiliate_url || !newProduct.image_url || !newProduct.price) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields (title, brand, price, affiliate URL, image URL)",
        variant: "destructive",
      });
      return;
    }

    setIsAddingProduct(true);
    try {
      const colorsArray = newProduct.colors.split(",").map(c => c.trim()).filter(Boolean);
      const styleTagsArray = newProduct.style_tags.split(",").map(t => t.trim()).filter(Boolean);

      const { error } = await supabase.from("products").insert({
        title: newProduct.title,
        brand: newProduct.brand,
        category: newProduct.category,
        gender: newProduct.gender,
        price: parseFloat(newProduct.price),
        currency: newProduct.currency,
        retailer: newProduct.retailer || newProduct.brand,
        affiliate_url: newProduct.affiliate_url,
        image_url: newProduct.image_url,
        colors: colorsArray.length > 0 ? colorsArray : null,
        style_tags: styleTagsArray.length > 0 ? styleTagsArray : null,
        provider: "manual",
        provider_product_id: `manual_${Date.now()}`,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Product Added",
        description: `"${newProduct.title}" has been added to the catalog`,
      });

      // Reset form
      setNewProduct({
        title: "",
        brand: "",
        category: "tops",
        gender: "unisex",
        price: "",
        currency: "EUR",
        retailer: "",
        affiliate_url: "",
        image_url: "",
        colors: "",
        style_tags: "",
      });

      fetchStats();
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setIsAddingProduct(false);
    }
  };

  // Loading state
  if (checkingRole) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-24 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Checking permissions...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-24 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to access the admin dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-24 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to access the admin dashboard. 
                Contact an administrator if you believe this is an error.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-24">
        <div className="space-y-2 mb-8">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="font-serif text-4xl">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage product imports and inventory</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="add">Add Product</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          {/* Add Product Tab */}
          <TabsContent value="add" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Affiliate Product
                </CardTitle>
                <CardDescription>
                  Manually add products from AWIN or other affiliate programs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Product Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Classic White Cotton T-Shirt"
                        value={newProduct.title}
                        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand *</Label>
                      <Input
                        id="brand"
                        placeholder="e.g., Nike, Zara, H&M"
                        value={newProduct.brand}
                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={newProduct.category}
                          onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tops">Tops</SelectItem>
                            <SelectItem value="bottoms">Bottoms</SelectItem>
                            <SelectItem value="outerwear">Outerwear</SelectItem>
                            <SelectItem value="dresses">Dresses</SelectItem>
                            <SelectItem value="shoes">Shoes</SelectItem>
                            <SelectItem value="accessories">Accessories</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender *</Label>
                        <Select
                          value={newProduct.gender}
                          onValueChange={(value) => setNewProduct({ ...newProduct, gender: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="men">Men</SelectItem>
                            <SelectItem value="women">Women</SelectItem>
                            <SelectItem value="unisex">Unisex</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          placeholder="29.99"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={newProduct.currency}
                          onValueChange={(value) => setNewProduct({ ...newProduct, currency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="retailer">Retailer</Label>
                      <Input
                        id="retailer"
                        placeholder="e.g., ASOS, Zalando (optional, defaults to brand)"
                        value={newProduct.retailer}
                        onChange={(e) => setNewProduct({ ...newProduct, retailer: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="affiliate_url" className="flex items-center gap-1">
                        <LinkIcon className="h-3.5 w-3.5" />
                        Affiliate Link *
                      </Label>
                      <Input
                        id="affiliate_url"
                        type="url"
                        placeholder="https://www.awin1.com/..."
                        value={newProduct.affiliate_url}
                        onChange={(e) => setNewProduct({ ...newProduct, affiliate_url: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        The tracking link from your affiliate program
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image_url" className="flex items-center gap-1">
                        <ImageIcon className="h-3.5 w-3.5" />
                        Product Image URL *
                      </Label>
                      <Input
                        id="image_url"
                        type="url"
                        placeholder="https://images.example.com/product.jpg"
                        value={newProduct.image_url}
                        onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                      />
                      {newProduct.image_url && (
                        <div className="mt-2 relative aspect-square w-32 rounded-lg overflow-hidden border border-border">
                          <img
                            src={newProduct.image_url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="colors">Colors</Label>
                      <Input
                        id="colors"
                        placeholder="white, black, blue (comma-separated)"
                        value={newProduct.colors}
                        onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="style_tags">Style Tags</Label>
                      <Input
                        id="style_tags"
                        placeholder="casual, streetwear, minimalist (comma-separated)"
                        value={newProduct.style_tags}
                        onChange={(e) => setNewProduct({ ...newProduct, style_tags: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <Button onClick={handleAddProduct} disabled={isAddingProduct}>
                    {isAddingProduct ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Add Product
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.total.toLocaleString() || "—"}</div>
                  <p className="text-xs text-muted-foreground mt-1">From AWIN feed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                  <Eye className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {stats?.active.toLocaleString() || "—"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats ? ((stats.active / stats.total) * 100).toFixed(1) : 0}% of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Inactive Products</CardTitle>
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-muted-foreground">
                    {stats?.inactive.toLocaleString() || "—"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Hidden from catalog</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    €{stats?.avgPrice.toFixed(2) || "—"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Range: €{stats?.priceRange.min.toFixed(0)} - €{stats?.priceRange.max.toFixed(0)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Category & Gender Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">By Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats && Object.entries(stats.byCategory)
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="capitalize">
                              {category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress 
                              value={(count / stats.total) * 100} 
                              className="w-24 h-2"
                            />
                            <span className="text-sm text-muted-foreground w-16 text-right">
                              {count.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">By Gender</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats && Object.entries(stats.byGender)
                      .sort((a, b) => b[1] - a[1])
                      .map(([gender, count]) => (
                        <div key={gender} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{gender}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Progress 
                              value={(count / stats.total) * 100} 
                              className="w-24 h-2"
                            />
                            <span className="text-sm text-muted-foreground w-16 text-right">
                              {count.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Brands */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Brands</CardTitle>
                <CardDescription>Most products by brand</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stats?.byBrand.map(({ brand, count }) => (
                    <Badge key={brand} variant="outline" className="py-1.5 px-3">
                      {brand} <span className="ml-1 text-muted-foreground">({count})</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AWIN Product Import</CardTitle>
                <CardDescription>
                  Import products from your AWIN datafeed. The feed contains ~16,500 products.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="limit">Batch Size</Label>
                    <Input
                      id="limit"
                      type="number"
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                      placeholder="1000"
                      disabled={isImporting}
                    />
                    <p className="text-xs text-muted-foreground">
                      Products per batch (recommended: 1000)
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={runSingleBatch} disabled={isImporting}>
                    {isImporting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Import Single Batch
                  </Button>
                  <Button onClick={runImport} disabled={isImporting} variant="secondary">
                    {isImporting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Import All Products
                  </Button>
                </div>

                {isImporting && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Import Progress</span>
                      <span>{importProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={importProgress} />
                  </div>
                )}

                {importLogs.length > 0 && (
                  <div className="space-y-2">
                    <Label>Import Log</Label>
                    <ScrollArea className="h-48 rounded-md border bg-muted/30 p-3">
                      <div className="space-y-1 font-mono text-xs">
                        {importLogs.map((log, i) => (
                          <div key={i} className="flex items-start gap-2">
                            {log.startsWith("✅") ? (
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                            ) : log.startsWith("❌") ? (
                              <XCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                            ) : log.startsWith("🎉") ? (
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                            ) : (
                              <Loader2 className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0 animate-spin" />
                            )}
                            <span>{log.replace(/^[✅❌🎉]\s*/, "")}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>Browse, manage, and delete products</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {stats && Object.keys(stats.byCategory).map((cat) => (
                        <SelectItem key={cat} value={cat} className="capitalize">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={genderFilter} onValueChange={setGenderFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="unisex">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={fetchProducts}>
                    <RefreshCw className={`h-4 w-4 ${productsLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>

                {/* Bulk Actions */}
                {selectedProducts.size > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">
                      {selectedProducts.size} selected
                    </span>
                    <Button size="sm" variant="outline" onClick={() => bulkToggleActive(true)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Activate
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => bulkToggleActive(false)}>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Deactivate
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {selectedProducts.size} products?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. These products will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={bulkDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedProducts(new Set())}>
                      Clear
                    </Button>
                  </div>
                )}

                {/* Products Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">
                          <input
                            type="checkbox"
                            checked={selectedProducts.size === products.length && products.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded border-input"
                          />
                        </TableHead>
                        <TableHead className="w-[60px]">Image</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="w-[80px]">Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No products found
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.map((product) => (
                          <TableRow key={product.id} className={!product.is_active ? "opacity-60" : ""}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedProducts.has(product.id)}
                                onChange={() => toggleSelectProduct(product.id)}
                                className="rounded border-input"
                              />
                            </TableCell>
                            <TableCell>
                              <img
                                src={product.image_url}
                                alt={product.title}
                                className="w-10 h-10 object-cover rounded"
                              />
                            </TableCell>
                            <TableCell className="max-w-[250px] truncate font-medium">
                              {product.title}
                            </TableCell>
                            <TableCell>{product.brand}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {product.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {product.currency} {product.price.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={product.is_active}
                                onCheckedChange={() => toggleProductActive(product.id, product.is_active)}
                              />
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this product?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete "{product.title}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deleteProduct(product.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Showing {products.length} of {stats?.total.toLocaleString() || 0} products
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
