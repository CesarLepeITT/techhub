"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  ChevronDown,
  X,
  Star,
  ShoppingCart,
  Heart,
  Loader,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { addToCart, addToWishlist, getProducts, getCategories, isInWishlist, removeFromWishlist } from "@/lib/supabase-queries"
import { useSession } from "@/components/SessionProvider"

type Product = {
  id: string
  category_id?: string
  name: string
  image_url: string
  price: number
  wholesale_price: number | null
  minimum_wholesale_quantity: number | null
  stock: number
  rating: number
  reviews_count: number
  sellers: { store_name: string } | null
}

type Category = {
  id: string
  name: string
  slug: string
}

export default function ProductosPage() {
  const router = useRouter()
  const { user } = useSession()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("relevance")
  const [showFilters, setShowFilters] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Ghost text: first product name that starts with the current query
  const ghostCompletion = useMemo(() => {
    const q = searchQuery.trim()
    if (!q) return ""
    const lower = q.toLowerCase()
    const match = allProducts.find((p) => p.name.toLowerCase().startsWith(lower))
    if (!match || match.name.toLowerCase() === lower) return ""
    return match.name.slice(searchQuery.length)
  }, [searchQuery, allProducts])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const buscar = params.get("buscar")
    if (buscar) setSearchQuery(buscar)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const loadWishlist = async () => {
      if (!user) {
        setWishlistIds([])
        return
      }

      const results = await Promise.all(
        allProducts.map(async (product) => {
          const response = await isInWishlist(user.id, product.id)
          return response.exists ? product.id : null
        })
      )

      setWishlistIds(results.filter((value): value is string => !!value))
    }

    if (allProducts.length > 0) {
      void loadWishlist()
    }
  }, [allProducts, user])

  useEffect(() => {
    let filteredProducts = [...allProducts]
    const trimmed = searchQuery.trim()

    if (trimmed) {
      const query = trimmed.toLowerCase()
      filteredProducts = filteredProducts.filter((product) =>
        product.name.toLowerCase().includes(query)
      )
      if (trimmed.length >= 2) {
        setSuggestions(
          allProducts
            .filter((p) => p.name.toLowerCase().includes(query))
            .slice(0, 6)
        )
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    if (selectedCategory !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.category_id === selectedCategory
      )
    }

    switch (sortBy) {
      case "price-asc":
        filteredProducts.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filteredProducts.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filteredProducts.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
      default:
        break
    }

    setProducts(filteredProducts)
  }, [allProducts, searchQuery, selectedCategory, sortBy])

  const loadData = async () => {
    setIsLoading(true)
    setError("")
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getProducts(100, 0),
        getCategories(),
      ])

      if (productsRes.error) throw productsRes.error
      if (categoriesRes.error) throw categoriesRes.error

      setAllProducts(productsRes.data || [])
      setProducts(productsRes.data || [])
      setCategories(categoriesRes.data || [])
    } catch (err) {
      setError("Error al cargar productos")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const requireSession = () => {
    if (!user) {
      router.push("/iniciar-sesion")
      return false
    }

    return true
  }

  const handleAddToCart = async (productId: string) => {
    if (!requireSession()) return
    const response = await addToCart(user!.id, productId, 1)
    if (!response.error) {
      window.dispatchEvent(new Event("cart-updated"))
    }
  }

  const handleWishlistToggle = async (productId: string) => {
    if (!requireSession()) return

    if (wishlistIds.includes(productId)) {
      await removeFromWishlist(user!.id, productId)
      setWishlistIds((current) => current.filter((id) => id !== productId))
      return
    }

    await addToWishlist(user!.id, productId)
    setWishlistIds((current) => [...current, productId])
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Catálogo de Productos</h1>
            <p className="mt-2 text-muted-foreground">Explora nuestros productos disponibles</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6 flex gap-2">
            <div ref={searchContainerRef} className="relative flex-1">
              {/* Border + background container */}
              <div className="relative w-full rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary/30">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                {/* Ghost text layer — sits behind the real input */}
                {ghostCompletion && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 flex items-center overflow-hidden pl-10 pr-4"
                  >
                    {/* Invisible typed portion — reserves exact same width */}
                    <span className="whitespace-pre text-transparent">{searchQuery}</span>
                    {/* Gray ghost completion */}
                    <span className="whitespace-pre text-muted-foreground/50">{ghostCompletion}</span>
                  </div>
                )}

                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (e.target.value.trim().length >= 2) setShowSuggestions(true)
                    else setShowSuggestions(false)
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true)
                  }}
                  onKeyDown={(e) => {
                    // Tab or ArrowRight at end of input → accept ghost completion
                    if (
                      ghostCompletion &&
                      (e.key === "Tab" ||
                        (e.key === "ArrowRight" &&
                          e.currentTarget.selectionStart === searchQuery.length))
                    ) {
                      e.preventDefault()
                      const completed = searchQuery + ghostCompletion
                      setSearchQuery(completed)
                      setShowSuggestions(false)
                    }
                    if (e.key === "Escape") setShowSuggestions(false)
                  }}
                  className="relative w-full bg-transparent py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none cursor-text"
                />
              </div>

              {/* Dropdown suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-card shadow-elevated">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSearchQuery(product.name)
                        setShowSuggestions(false)
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-secondary cursor-pointer"
                    >
                      <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-primary">${product.price.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="rounded-lg cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
              <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Filtros</h3>
                  {showFilters && (
                    <button
                      onClick={() => setShowFilters(false)}
                      className="lg:hidden cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">Categorías</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`block w-full text-left text-sm transition-colors cursor-pointer ${
                        selectedCategory === "all"
                          ? "font-medium text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Todos los productos
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`block w-full text-left text-sm transition-colors cursor-pointer ${
                          selectedCategory === cat.id
                            ? "font-medium text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="mt-6 border-t border-border pt-4">
                  <h4 className="mb-3 text-sm font-medium text-foreground">Ordenar por</h4>
                  <div className="relative">
                    <button
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer flex items-center justify-between hover:bg-secondary transition-colors"
                    >
                      <span>
                        {sortBy === "relevance" && "Relevancia"}
                        {sortBy === "price-asc" && "Precio: Menor a Mayor"}
                        {sortBy === "price-desc" && "Precio: Mayor a Menor"}
                        {sortBy === "rating" && "Mejor Calificación"}
                        {sortBy === "newest" && "Más Recientes"}
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showSortDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-elevated z-10">
                        <button
                          onClick={() => {
                            setSortBy("relevance")
                            setShowSortDropdown(false)
                          }}
                          className={`block w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer first:rounded-t-lg ${
                            sortBy === "relevance"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-foreground hover:bg-secondary"
                          }`}
                        >
                          Relevancia
                        </button>
                        <button
                          onClick={() => {
                            setSortBy("price-asc")
                            setShowSortDropdown(false)
                          }}
                          className={`block w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                            sortBy === "price-asc"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-foreground hover:bg-secondary"
                          }`}
                        >
                          Precio: Menor a Mayor
                        </button>
                        <button
                          onClick={() => {
                            setSortBy("price-desc")
                            setShowSortDropdown(false)
                          }}
                          className={`block w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                            sortBy === "price-desc"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-foreground hover:bg-secondary"
                          }`}
                        >
                          Precio: Mayor a Menor
                        </button>
                        <button
                          onClick={() => {
                            setSortBy("rating")
                            setShowSortDropdown(false)
                          }}
                          className={`block w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                            sortBy === "rating"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-foreground hover:bg-secondary"
                          }`}
                        >
                          Mejor Calificación
                        </button>
                        <button
                          onClick={() => {
                            setSortBy("newest")
                            setShowSortDropdown(false)
                          }}
                          className={`block w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer last:rounded-b-lg ${
                            sortBy === "newest"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-foreground hover:bg-secondary"
                          }`}
                        >
                          Más Recientes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="lg:col-span-3">
              {/* View Mode Toggle */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {products.length} productos encontrados
                </p>
                <div className="flex gap-2 rounded-lg border border-border bg-card p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`rounded p-2 transition-colors cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`rounded p-2 transition-colors cursor-pointer ${
                      viewMode === "list"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <LayoutList className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-4 text-destructive flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-12 text-center">
                  <p className="text-muted-foreground">No se encontraron productos</p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/producto/${product.id}`}
                      className="group rounded-xl border border-border bg-card overflow-hidden shadow-soft transition-all hover:shadow-elevated hover:border-primary/50"
                    >
                      <div className="relative h-48 overflow-hidden bg-secondary">
                        <img loading="lazy"
                          src={product.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop"}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-muted-foreground">{product.sellers?.store_name || "techHub"}</p>
                        <h3 className="mb-2 text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <div className="mb-3 flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-foreground">{product.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({product.reviews_count})</span>
                        </div>
                        <p className="mb-3 text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 rounded-lg bg-primary hover:bg-primary/90 cursor-pointer text-sm"
                            onClick={(event) => {
                              event.preventDefault()
                              void handleAddToCart(product.id)
                            }}
                          >
                            <ShoppingCart className="mr-1 h-4 w-4" />
                            Agregar
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-lg cursor-pointer"
                            onClick={(event) => {
                              event.preventDefault()
                              void handleWishlistToggle(product.id)
                            }}
                          >
                            <Heart className={`h-4 w-4 ${wishlistIds.includes(product.id) ? "fill-current" : ""}`} />
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/producto/${product.id}`}
                      className="group flex gap-4 rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover:shadow-elevated hover:border-primary/50"
                    >
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                        <img loading="lazy"
                          src={product.image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop"}
                          alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{product.sellers?.store_name || "techHub"}</p>
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="my-2 flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-foreground">{product.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({product.reviews_count})</span>
                        </div>
                        <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <Button
                          variant="outline"
                          className="rounded-lg cursor-pointer"
                          onClick={(event) => {
                            event.preventDefault()
                            void handleWishlistToggle(product.id)
                          }}
                        >
                          <Heart className={`h-4 w-4 ${wishlistIds.includes(product.id) ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                          className="rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
                          onClick={(event) => {
                            event.preventDefault()
                            void handleAddToCart(product.id)
                          }}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </Link>
                  ))}
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

