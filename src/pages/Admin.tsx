import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  RefreshCw, 
  Download, 
  TrendingUp, 
  ShoppingBag,
  Tag,
  Palette,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Filter
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
  created_at: string;
}

export default function Admin() {
  const { toast } = useToast();
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

  useEffect(() => {
    fetchStats();
    fetchProducts();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total count
      const { count: total } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("provider", "awin_feed");

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
        .select("id, title, brand, category, gender, price, currency, retailer, image_url, created_at")
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
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, categoryFilter, genderFilter]);

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

      // Refresh stats
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-24">
        <div className="space-y-2 mb-8">
          <h1 className="font-serif text-4xl">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage product imports and view inventory statistics</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

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

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats ? Object.keys(stats.byCategory).length : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Product categories</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Brands</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats?.byBrand.length || "—"}+
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Unique brands</p>
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
                <CardDescription>Browse and search imported products</CardDescription>
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
                  <Button variant="outline" size="icon" onClick={fetchProducts}>
                    <RefreshCw className={`h-4 w-4 ${productsLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>

                {/* Products Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No products found
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <img
                                src={product.image_url}
                                alt={product.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate font-medium">
                              {product.title}
                            </TableCell>
                            <TableCell>{product.brand}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize">
                                {product.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize">{product.gender}</TableCell>
                            <TableCell className="text-right">
                              {product.currency} {product.price.toFixed(2)}
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
