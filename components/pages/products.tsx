"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ProductCard from "@/components/cards/product-card"
import { useAuth } from "@/lib/auth-context"
import { Plus, Search, Package, Barcode, Tag, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [newProduct, setNewProduct] = useState({
    sku: "",
    name: "",
    barcode: "",
    description: "",
    category_id: "",
    image_url: "",
  })

  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/products", {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error("Failed to fetch products")
      return res.json()
    },
  })

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories", {
        credentials: "include",
      })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error("Failed to fetch categories")
      }
      const data = await res.json()
      return data
    },
  })

  const { data: evaluations = [] } = useQuery({
    queryKey: ["all-evaluations"],
    queryFn: async () => {
      const res = await fetch("/api/evaluations", {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch evaluations")
      return res.json()
    },
  })

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.text()
        throw new Error("Failed to create product")
      }
      const result = await res.json()
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setDialogOpen(false)
      setNewProduct({ sku: "", name: "", barcode: "", description: "", category_id: "", image_url: "" })
      toast.success("Product created successfully")
    },
    onError: (error) => {
      toast.error("Failed to create product")
    },
  })

  const getProductAverageScore = (productId: number) => {
    const productEvaluations = evaluations.filter((e: any) => e.product_id === productId)
    if (productEvaluations.length === 0) return null
    const sum = productEvaluations.reduce((acc: number, e: any) => acc + (e.overall_score || 0), 0)
    return sum / productEvaluations.length
  }

  const filteredProducts = products.filter((product: any) => {
    const query = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query) ||
      product.barcode?.toLowerCase().includes(query)
    )
  })

  const handleCreateProduct = () => {
    createProductMutation.mutate(newProduct)
  }

  const handleProductClick = (product: any) => {
    setSelectedProduct(product)
    setDetailsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-600 mt-1">Manage your product catalog</p>
        </div>
        {user?.role === "manager" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Fill in the product details below to add a new item to your catalog.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SKU (Product Code) *</Label>
                    <Input
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      placeholder="PRD-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Product Name *</Label>
                    <Input
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Product name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Barcode</Label>
                  <Input
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                    placeholder="1234567890123"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={newProduct.category_id}
                    onValueChange={(value) => setNewProduct({ ...newProduct, category_id: value })}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length === 0 && !categoriesLoading ? (
                        <div className="p-2 text-sm text-slate-500">No categories available</div>
                      ) : (
                        categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {categoriesError && <p className="text-sm text-red-600">Failed to load categories</p>}
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Product description"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateProduct}
                    disabled={
                      !newProduct.sku || !newProduct.name || !newProduct.category_id || createProductMutation.isPending
                    }
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    {createProductMutation.isPending ? "Creating..." : "Create Product"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by name, SKU, or barcode..."
          className="pl-10"
        />
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 animate-in fade-in duration-300">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No products found</p>
          <p className="text-sm text-slate-500 mt-1">
            {searchQuery ? "Try a different search term" : "Add your first product to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
          {filteredProducts.map((product: any) => {
            const category = categories.find((c: any) => c.id === product.category_id)
            const averageScore = getProductAverageScore(product.id)
            return (
              <ProductCard
                key={product.id}
                product={product}
                category={category}
                averageScore={averageScore}
                onClick={() => handleProductClick(product)}
              />
            )
          })}
        </div>
      )}

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Complete information about this product</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6 pt-4">
              {selectedProduct.image_url && (
                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedProduct.image_url || "/placeholder.svg"}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Tag className="w-4 h-4" />
                    <span>Product Name</span>
                  </div>
                  <p className="font-semibold text-slate-900">{selectedProduct.name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Package className="w-4 h-4" />
                    <span>SKU</span>
                  </div>
                  <p className="font-mono text-sm font-semibold text-slate-900">{selectedProduct.sku}</p>
                </div>
                {selectedProduct.barcode && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Barcode className="w-4 h-4" />
                      <span>Barcode</span>
                    </div>
                    <p className="font-mono text-sm text-slate-900">{selectedProduct.barcode}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Tag className="w-4 h-4" />
                    <span>Category</span>
                  </div>
                  <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200">
                    {categories.find((c: any) => c.id === selectedProduct.category_id)?.name || "Uncategorized"}
                  </Badge>
                </div>
              </div>
              {selectedProduct.description && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FileText className="w-4 h-4" />
                    <span>Description</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{selectedProduct.description}</p>
                </div>
              )}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-slate-500">
                  <p>Created: {new Date(selectedProduct.created_at).toLocaleDateString()}</p>
                  <p>Updated: {new Date(selectedProduct.updated_at).toLocaleDateString()}</p>
                </div>
                <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
