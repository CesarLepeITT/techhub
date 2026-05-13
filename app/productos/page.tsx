"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { 
  Search, 
  SlidersHorizontal, 
  Grid3X3, 
  LayoutList, 
  ChevronDown,
  X,
  Star,
  ShoppingCart,
  Package,
  Check,
  ArrowUpDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", name: "Todos", count: 1250 },
  { id: "microcontrollers", name: "Microcontroladores", count: 234 },
  { id: "sensors", name: "Sensores", count: 456 },
  { id: "iot", name: "Módulos IoT", count: 189 },
  { id: "sbc", name: "Single Board", count: 78 },
  { id: "tools", name: "Herramientas", count: 312 },
  { id: "kits", name: "Kits educativos", count: 156 },
  { id: "displays", name: "Displays", count: 134 },
  { id: "motors", name: "Motores", count: 98 },
]

const sortOptions = [
  { id: "relevance", name: "Más relevantes" },
  { id: "price-asc", name: "Precio: menor a mayor" },
  { id: "price-desc", name: "Precio: mayor a menor" },
  { id: "rating", name: "Mejor calificados" },
  { id: "newest", name: "Más recientes" },
]

const products = [
  {
    id: "1",
    name: "Arduino Nano V3.0 ATmega328P Compatible con Cable USB",
    category: "Microcontroladores",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
    retailPrice: 149.00,
    wholesalePrice: 119.00,
    wholesaleMinQty: 10,
    rating: 4.8,
    reviewCount: 234,
    stock: "in_stock" as const,
    badge: "Más vendido",
  },
  {
    id: "2",
    name: "Kit Sensor Ultrasónico HC-SR04 con Cables Dupont",
    category: "Sensores",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=400&fit=crop",
    retailPrice: 89.00,
    wholesalePrice: 69.00,
    wholesaleMinQty: 15,
    rating: 4.6,
    reviewCount: 156,
    stock: "in_stock" as const,
  },
  {
    id: "3",
    name: "Raspberry Pi 4 Model B 4GB RAM con Disipadores",
    category: "Single Board",
    image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&h=400&fit=crop",
    retailPrice: 2499.00,
    wholesalePrice: 2199.00,
    wholesaleMinQty: 5,
    rating: 4.9,
    reviewCount: 89,
    stock: "low_stock" as const,
    badge: "Oferta",
  },
  {
    id: "4",
    name: "ESP32 DevKit V1 WiFi + Bluetooth Dual Core",
    category: "IoT",
    image: "https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=400&h=400&fit=crop",
    retailPrice: 189.00,
    wholesalePrice: 149.00,
    wholesaleMinQty: 10,
    rating: 4.7,
    reviewCount: 312,
    stock: "in_stock" as const,
  },
  {
    id: "5",
    name: "Kit Soldadura Completo: Cautín 60W + Pasta + Estaño",
    category: "Herramientas",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop",
    retailPrice: 399.00,
    rating: 4.5,
    reviewCount: 178,
    stock: "in_stock" as const,
  },
  {
    id: "6",
    name: "Módulo Relé 4 Canales 5V con Optoacoplador",
    category: "Módulos",
    image: "https://images.unsplash.com/photo-1597733336794-12d05021d510?w=400&h=400&fit=crop",
    retailPrice: 129.00,
    wholesalePrice: 99.00,
    wholesaleMinQty: 20,
    rating: 4.4,
    reviewCount: 92,
    stock: "in_stock" as const,
  },
  {
    id: "7",
    name: "Pantalla OLED 0.96\" I2C 128x64 SSD1306 Azul",
    category: "Displays",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop",
    retailPrice: 79.00,
    wholesalePrice: 59.00,
    wholesaleMinQty: 25,
    rating: 4.8,
    reviewCount: 267,
    stock: "in_stock" as const,
    badge: "Nuevo",
  },
  {
    id: "8",
    name: "Motor Paso a Paso NEMA 17 con Driver A4988",
    category: "Motores",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop",
    retailPrice: 349.00,
    wholesalePrice: 299.00,
    wholesaleMinQty: 5,
    rating: 4.6,
    reviewCount: 134,
    stock: "low_stock" as const,
  },
  {
    id: "9",
    name: "Sensor de Temperatura y Humedad DHT22 AM2302",
    category: "Sensores",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
    retailPrice: 169.00,
    wholesalePrice: 139.00,
    wholesaleMinQty: 10,
    rating: 4.7,
    reviewCount: 198,
    stock: "in_stock" as const,
  },
  {
    id: "10",
    name: "Protoboard 830 Puntos con Base Metálica",
    category: "Herramientas",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=400&fit=crop",
    retailPrice: 89.00,
    wholesalePrice: 69.00,
    wholesaleMinQty: 15,
    rating: 4.5,
    reviewCount: 145,
    stock: "in_stock" as const,
  },
  {
    id: "11",
    name: "Kit Cables Dupont 120pcs Macho-Macho/Hembra-Hembra",
    category: "Accesorios",
    image: "https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=400&h=400&fit=crop",
    retailPrice: 79.00,
    wholesalePrice: 59.00,
    wholesaleMinQty: 20,
    rating: 4.6,
    reviewCount: 312,
    stock: "in_stock" as const,
  },
  {
    id: "12",
    name: "Fuente de Alimentación 5V 3A USB-C para Raspberry Pi",
    category: "Fuentes",
    image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&h=400&fit=crop",
    retailPrice: 249.00,
    wholesalePrice: 199.00,
    wholesaleMinQty: 10,
    rating: 4.8,
    reviewCount: 87,
    stock: "in_stock" as const,
  },
]

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(price)
}

const stockLabels = {
  in_stock: { label: "En stock", className: "bg-primary/10 text-primary" },
  low_stock: { label: "Últimas piezas", className: "bg-amber-500/10 text-amber-600" },
  out_of_stock: { label: "Agotado", className: "bg-destructive/10 text-destructive" },
}

function ProductGridCard({ product }: { product: typeof products[0] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    setTimeout(() => {
      setIsAdding(false)
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 2000)
    }, 500)
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-lift">
      {product.badge && (
        <div className="absolute left-3 top-3 z-10 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm">
          {product.badge}
        </div>
      )}

      <div className="relative aspect-square overflow-hidden bg-secondary/30 cursor-pointer">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="mb-2 inline-flex w-fit rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
          {product.category}
        </span>

        <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-foreground cursor-pointer hover:text-primary transition-colors">
          {product.name}
        </h3>

        <div className="mb-3 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3.5 w-3.5",
                  i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-border"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {product.rating.toFixed(1)} ({product.reviewCount})
          </span>
        </div>

        <div className="mb-3 space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">{formatPrice(product.retailPrice)}</span>
          </div>
          {product.wholesalePrice && product.wholesaleMinQty && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-primary">{formatPrice(product.wholesalePrice)}</span>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Mayoreo {product.wholesaleMinQty}+ pzas
              </span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium",
              stockLabels[product.stock].className
            )}
          >
            <Package className="h-3 w-3" />
            {stockLabels[product.stock].label}
          </span>
        </div>

        <Button
          className={cn(
            "mt-auto w-full rounded-lg transition-all duration-300 cursor-pointer",
            isAdded
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={handleAddToCart}
          disabled={product.stock === "out_of_stock" || isAdding}
        >
          {isAdding ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Agregando...
            </span>
          ) : isAdded ? (
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Agregado
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Agregar
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSort, setSelectedSort] = useState("relevance")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [showWholesaleOnly, setShowWholesaleOnly] = useState(false)

  useEffect(() => {
    setSearchQuery(searchParams.get("buscar") ?? "")
    const categoryFromUrl = searchParams.get("categoria")
    const matchingCategory = categories.find(
      (category) => category.name.toLowerCase() === categoryFromUrl?.toLowerCase()
    )
    setSelectedCategory(matchingCategory?.id ?? "all")
  }, [searchParams])

  const filteredProducts = products.filter((p) => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (selectedCategory !== "all") {
      const activeCategory = categories.find((category) => category.id === selectedCategory)?.name
      if (activeCategory && p.category !== activeCategory) {
        return false
      }
    }
    if (showWholesaleOnly && !p.wholesalePrice) {
      return false
    }
    if (priceRange.min && p.retailPrice < parseFloat(priceRange.min)) {
      return false
    }
    if (priceRange.max && p.retailPrice > parseFloat(priceRange.max)) {
      return false
    }
    return true
  }).sort((a, b) => {
    switch (selectedSort) {
      case "price-asc":
        return a.retailPrice - b.retailPrice
      case "price-desc":
        return b.retailPrice - a.retailPrice
      case "rating":
        return b.rating - a.rating
      case "newest":
        return Number(b.id) - Number(a.id)
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pb-8 pt-20 md:pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
              Catálogo de productos
            </h1>
            <p className="text-muted-foreground">
              Encuentra componentes, kits y herramientas para tus proyectos
            </p>
          </div>

          {/* Search and Filters Bar */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-card py-3 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Filter Toggle */}
              <Button
                variant="outline"
                className={cn(
                  "rounded-lg border-border cursor-pointer",
                  showFilters && "bg-primary/10 border-primary/30 text-primary"
                )}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filtros
              </Button>

              {/* Sort Dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  className="rounded-lg border-border cursor-pointer"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  {sortOptions.find((s) => s.id === selectedSort)?.name}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
                {showSortDropdown && (
                  <div className="absolute right-0 top-full z-20 mt-2 w-56 animate-fade-in rounded-xl border border-border bg-card p-2 shadow-elevated">
                    {sortOptions.map((option) => (
                      <button
                        key={option.id}
                        className={cn(
                          "w-full rounded-lg px-4 py-2.5 text-left text-sm transition-colors cursor-pointer",
                          selectedSort === option.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground hover:bg-secondary"
                        )}
                        onClick={() => {
                          setSelectedSort(option.id)
                          setShowSortDropdown(false)
                        }}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Mode */}
              <div className="hidden sm:flex items-center gap-1 rounded-lg border border-border bg-card p-1">
                <button
                  className={cn(
                    "rounded-md p-2 transition-colors cursor-pointer",
                    viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  className={cn(
                    "rounded-md p-2 transition-colors cursor-pointer",
                    viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Sidebar Filters */}
            <aside
              className={cn(
                "shrink-0 transition-all duration-300 lg:block",
                showFilters ? "w-full lg:w-64" : "hidden lg:hidden"
              )}
            >
              <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Categorías</h3>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer",
                          selectedCategory === category.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <span>{category.name}</span>
                        <span className="text-xs">{category.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Rango de precio</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                    />
                  </div>
                </div>

                {/* Wholesale Filter */}
                <div>
                  <label className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showWholesaleOnly}
                      onChange={(e) => setShowWholesaleOnly(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                    />
                    <span className="text-sm text-foreground">Solo mayoreo</span>
                  </label>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  className="mt-4 w-full rounded-lg cursor-pointer"
                  onClick={() => {
                    setSelectedCategory("all")
                    setPriceRange({ min: "", max: "" })
                    setShowWholesaleOnly(false)
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Results count */}
              <div className="mb-4 text-sm text-muted-foreground">
                Mostrando {filteredProducts.length} de {products.length} productos
              </div>

              {filteredProducts.length > 0 ? (
                <div className={cn(
                  "grid gap-4",
                  viewMode === "grid" 
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                    : "grid-cols-1"
                )}>
                  {filteredProducts.map((product) => (
                    <ProductGridCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center shadow-soft">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-secondary">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    No se encontraron productos
                  </h3>
                  <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                    Intenta ajustar los filtros o buscar con otros términos
                  </p>
                  <Button
                    variant="outline"
                    className="rounded-lg cursor-pointer"
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory("all")
                      setPriceRange({ min: "", max: "" })
                      setShowWholesaleOnly(false)
                    }}
                  >
                    Limpiar búsqueda
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ProductsPageContent />
    </Suspense>
  )
}
