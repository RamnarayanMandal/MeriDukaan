"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProducts, useInfiniteProducts, useDeleteProduct } from "@/hooks/useProducts";
import { useAllShops } from "@/hooks/useShop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus, Search, Edit, Trash2, Package, Image as ImageIcon, X, Calendar, XCircle } from "lucide-react";
import { Product } from "@/types/product";
import { showError } from "@/lib/sweetAlert";

export default function ProductsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | "all">("all");
  const [selectedShopId, setSelectedShopId] = useState<string | "all">("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 9;
  const { data: shops } = useAllShops();
  const [galleryProduct, setGalleryProduct] = useState<Product | null>(null);
  
  // Get all products to extract unique categories for filter
  const { data: allProductsData } = useProducts({ limit: 1000 });
  const availableCategories = allProductsData?.items
    ? Array.from(new Set(allProductsData.items.map((p) => p.category))).sort()
    : [];

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, category, selectedShopId, startDate, endDate]);

  const { 
    data: infiniteData, 
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteProducts({
    shopId: selectedShopId !== "all" ? selectedShopId : undefined,
    search: search || undefined,
    category: category !== "all" ? (category as any) : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    limit,
  });

  const deleteProduct = useDeleteProduct();

  // Flatten the infinite pages into a single array of items
  const allProducts = infiniteData?.pages.flatMap((page: any) => page.items) || [];
  const totalCount = (infiniteData?.pages[0] as any)?.meta?.total || (infiniteData?.pages[0] as any)?.totalCount || 0;

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setSelectedShopId("all");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters = search || category !== "all" || selectedShopId !== "all" || startDate || endDate;

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct.mutateAsync(id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600 mt-1">Manage your inventory</p>
        </div>
        <Button onClick={() => router.push("/admin/products/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">

            {/* Row 1: Search + Category */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>

              {/* Category */}
              <Select
                value={category}
                onValueChange={(value) => setCategory(value)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Row 2: Shop + Dates + Clear */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-end">

              {/* Shop Filter */}
              <Select
                value={selectedShopId}
                onValueChange={(value) => setSelectedShopId(value)}
              >
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="Select Shop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shops</SelectItem>
                  {shops?.map((shop) => (
                    <SelectItem key={shop._id} value={shop._id}>
                      {shop.shopName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Range */}
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Start date"
                  className="w-full sm:w-[180px]"
                />

                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="End date"
                  className="w-full sm:w-[180px]"
                />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2 w-full lg:w-auto"
                >
                  <XCircle className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>

          </div>
        </CardContent>
      </Card>


      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : allProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allProducts.map((product: Product) => (
            <Card key={product._id}>
              <CardHeader>
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    {product.thumbnailImage?.url ? (
                      <button
                        type="button"
                        className="h-12 w-12 rounded-md overflow-hidden border bg-gray-50"
                        onClick={() => setGalleryProduct(product)}
                      >
                        <img
                          src={product.thumbnailImage.url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ) : (
                      <div className="h-12 w-12 rounded-md border flex items-center justify-center text-gray-400 bg-gray-50">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {product.name}
                        <span className="text-xs font-normal text-gray-500">
                          ({product.stockQty} {product.unit} in stock)
                        </span>
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                    </div>
                  </div>
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold">₹{product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Stock:</span>
                    <span
                      className={
                        product.stockQty === 0
                          ? "text-red-600 font-semibold"
                          : product.stockQty <= 5
                            ? "text-yellow-600 font-semibold"
                            : "text-green-600"
                      }
                    >
                      {product.stockQty} {product.unit}
                    </span>
                  </div>
                  {product.stockQty > 0 && product.stockQty <= 5 && (
                    <p className="text-xs text-yellow-600">
                      Low stock – consider restocking soon
                    </p>
                  )}
                  {product.productCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Code:</span>
                      <span className="text-sm">{product.productCode}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/admin/products/${product._id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(product._id, product.name)}
                    disabled={deleteProduct.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No products found</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/admin/products/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      )}

      {hasNextPage && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            onClick={() => fetchNextPage()} 
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading more..." : "Load More Products"}
          </Button>
        </div>
      )}

      {/* Image gallery modal */}
      {galleryProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="relative w-full max-w-3xl rounded-lg bg-white p-4 shadow-lg">
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              onClick={() => setGalleryProduct(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="mb-4 text-lg font-semibold">
              {galleryProduct.name} images
            </h2>
            {galleryProduct.images && galleryProduct.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryProduct.images.map((img) => (
                  <div
                    key={img.fileId}
                    className={`relative rounded-md border overflow-hidden ${img.isThumbnail ? "ring-2 ring-blue-500" : ""
                      }`}
                  >
                    <img
                      src={img.url}
                      alt={galleryProduct.name}
                      className="h-40 w-full object-cover"
                    />
                    {img.isThumbnail && (
                      <span className="absolute bottom-1 left-1 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">
                        Thumbnail
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No images available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
