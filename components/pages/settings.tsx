"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Tag, Target, Edit2, X } from "lucide-react"
import { toast } from "sonner"
import { base44 } from "@/api/base44Client"
import { useAuth } from "@/lib/auth-context"

export default function Settings() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Estado das categorias
  const [newCategory, setNewCategory] = useState({ name: "", description: "", color: "blue" })
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [editingCategory, setEditingCategory] = useState({ name: "", description: "", color: "blue" })
  const [newCriterion, setNewCriterion] = useState({
    category_id: "",
    name: "",
    weight: 1,
    max_score: 5,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.list(),
  })

  const { data: criteria = [] } = useQuery({
    queryKey: ["criteria"],
    queryFn: async () => {
      const res = await fetch("/api/criteria", {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch criteria")
      return res.json()
    },
  })

  const createCategoryMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create category")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"])
      setNewCategory({ name: "", description: "", color: "blue" })
      toast.success("Category created")
    },
  })

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const token = localStorage.getItem("auth_token")
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update category")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"])
      setEditingCategoryId(null)
      setEditingCategory({ name: "", description: "", color: "blue" })
      toast.success("Category updated")
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("auth_token")
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error("Failed to delete category")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"])
      toast.success("Category deleted")
    },
  })

  const createCriterionMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/criteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create criterion")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criteria"] })
      setNewCriterion({ category_id: "", name: "", weight: 1, max_score: 5 })
      toast.success("Criterion created")
    },
    onError: (error: any) => {
      toast.error("Failed to create criterion: " + (error.message || "Unknown error"))
    },
  })

  const deleteCriterionMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/criteria/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to delete criterion")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criteria"] })
      toast.success("Criterion deleted")
    },
    onError: (error: any) => {
      toast.error("Failed to delete criterion: " + (error.message || "Unknown error"))
    },
  })

  const colorOptions = [
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "purple", label: "Purple" },
    { value: "orange", label: "Orange" },
    { value: "pink", label: "Pink" },
  ]

  const canManageCategories = user?.role === "manager" || user?.role === "evaluator" || user?.role === "admin"

  const handleEditCategory = (category: any) => {
    setEditingCategoryId(category.id)
    setEditingCategory({
      name: category.name,
      description: category.description || "",
      color: category.color || "blue",
    })
  }

  const handleSaveEdit = () => {
    if (editingCategoryId && editingCategory.name) {
      updateCategoryMutation.mutate({
        id: editingCategoryId,
        data: editingCategory,
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingCategoryId(null)
    setEditingCategory({ name: "", description: "", color: "blue" })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage categories and evaluation criteria</p>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="categories">
            <Tag className="w-4 h-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="criteria">
            <Target className="w-4 h-4 mr-2" />
            Criteria
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          {canManageCategories && (
            <Card className="p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Category</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category Name *</Label>
                    <Input
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="e.g., Electronics"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Badge Color</Label>
                    <Select
                      value={newCategory.color}
                      onValueChange={(value) => setNewCategory({ ...newCategory, color: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Brief description of this category"
                    rows={2}
                  />
                </div>
                <Button
                  onClick={() => createCategoryMutation.mutate(newCategory)}
                  disabled={!newCategory.name || createCategoryMutation.isPending}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Category
                </Button>
              </div>
            </Card>
          )}

          {/* Categories List */}
          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Existing Categories</h2>
            {categories.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No categories yet</p>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id}>
                    {editingCategoryId === category.id ? (
                      <Card className="p-4 border-cyan-200 bg-cyan-50 space-y-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Category Name *</Label>
                            <Input
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                              placeholder="Category name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={editingCategory.description}
                              onChange={(e) =>
                                setEditingCategory({
                                  ...editingCategory,
                                  description: e.target.value,
                                })
                              }
                              placeholder="Brief description"
                              rows={2}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={handleCancelEdit}
                              disabled={updateCategoryMutation.isPending}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSaveEdit}
                              disabled={!editingCategory.name || updateCategoryMutation.isPending}
                              className="bg-cyan-600 hover:bg-cyan-700"
                            >
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg animate-in fade-in duration-300">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                          )}
                        </div>
                        {canManageCategories && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCategory(category)}
                              className="text-slate-400 hover:text-cyan-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteCategoryMutation.mutate(category.id)}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Criteria Tab */}
        <TabsContent value="criteria" className="space-y-6">
          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Criterion</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={newCriterion.category_id}
                  onValueChange={(value) => setNewCriterion({ ...newCriterion, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Criterion Name *</Label>
                  <Input
                    value={newCriterion.name}
                    onChange={(e) => setNewCriterion({ ...newCriterion, name: e.target.value })}
                    placeholder="e.g., Physical Quality"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight</Label>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={newCriterion.weight}
                    onChange={(e) =>
                      setNewCriterion({ ...newCriterion, weight: Number.parseFloat(e.target.value) || 1 })
                    }
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Maximum Score</Label>
                <Input
                  type="number"
                  min="1"
                  value={newCriterion.max_score}
                  onChange={(e) =>
                    setNewCriterion({ ...newCriterion, max_score: Number.parseInt(e.target.value) || 5 })
                  }
                  placeholder="5"
                />
              </div>

              <Button
                onClick={() => {
                  if (!newCriterion.category_id || !newCriterion.name) {
                    toast.error("Please select a category and enter a criterion name")
                    return
                  }
                  createCriterionMutation.mutate(newCriterion)
                }}
                disabled={!newCriterion.category_id || !newCriterion.name || createCriterionMutation.isPending}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Criterion
              </Button>
            </div>
          </Card>

          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Existing Criteria</h2>
            {criteria.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No criteria yet</p>
            ) : (
              <div className="space-y-3">
                {categories.map((category: any) => {
                  const categoryCriteria = criteria.filter((c: any) => c.category_id === category.id)
                  if (categoryCriteria.length === 0) return null

                  return (
                    <div key={category.id} className="space-y-2">
                      <h3 className="font-medium text-slate-700 text-sm uppercase tracking-wide">{category.name}</h3>
                      {categoryCriteria.map((criterion: any) => (
                        <div
                          key={criterion.id}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-lg animate-in fade-in duration-300"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">{criterion.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">
                              Weight: {criterion.weight} • Max Score: {criterion.max_score}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCriterionMutation.mutate(criterion.id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
