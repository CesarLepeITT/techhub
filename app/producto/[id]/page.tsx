"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Share2,
  Heart,
  ShoppingCart,
  Sparkles,
  Star,
  Minus,
  Plus,
  Check,
  AlertCircle,
  Loader,
  Eye,
  MessageCircle,
  Truck,
  Lock,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getProductById, getProductReviews, addToCart, isInWishlist, addToWishlist, removeFromWishlist } from "@/lib/supabase-queries"
import { useSession } from "@/components/SessionProvider"

type Product = {
  id: string
  name: string
  description: string
  image_url: string
  images_array: string[]
  price: number
  wholesale_price: number | null
  minimum_wholesale_quantity: number | null
  stock: number
  rating: number
  reviews_count: number
  sellers: {
    id: string
    store_name: string
    is_verified: boolean
    rating: number
  } | null
  categories: { name: string } | null
}

type Review = {
  id: string
  rating: number
  title: string
  content: string
  helpful_count: number
  created_at: string
  users: { nombre: string } | null
}

export default function ProductoPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description")

  useEffect(() => {
    loadProduct()
  }, [id])

  useEffect(() => {
    if (user && product) {
      checkWishlist()
    }
  }, [user, product])

  const loadProduct = async () => {
    setIsLoading(true)
    setError("")
    try {
      const productRes = await getProductById(id as string)
      if (productRes.error) throw productRes.error
      if (!productRes.data) throw new Error("Producto no encontrado")

      setProduct(productRes.data)

      const reviewsRes = await getProductReviews(id as string)
      if (!reviewsRes.error && reviewsRes.data) {
        setReviews(reviewsRes.data)
      }
    } catch (err) {
      setError("Error al cargar el producto")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const checkWishlist = async () => {
    if (!user) return
    try {
      const { exists } = await isInWishlist(user.id, id as string)
      setIsWishlisted(exists)
    } catch (err) {
      console.error("Error checking wishlist:", err)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/iniciar-sesion")
      return
    }

    try {
      const res = await addToCart(user.id, id as string, quantity)
      if (res.error) throw res.error
      window.dispatchEvent(new Event("cart-updated"))
      alert("Producto agregado al carrito")
    } catch (err) {
      alert("Error al agregar al carrito")
      console.error(err)
    }
  }

  const handleWishlist = async () => {
    if (!user) {
      router.push("/iniciar-sesion")
      return
    }

    try {
      if (isWishlisted) {
        const res = await removeFromWishlist(user.id, id as string)
        if (res.error) throw res.error
        setIsWishlisted(false)
      } else {
        const res = await addToWishlist(user.id, id as string)
        if (res.error) throw res.error
        setIsWishlisted(true)
      }
    } catch (err) {
      console.error("Error updating wishlist:", err)
    }
  }

  const isWholesaleEligible = quantity >= (product?.minimum_wholesale_quantity || 10)
  const displayPrice = isWholesaleEligible && product?.wholesale_price
    ? product.wholesale_price
    : product?.price

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">{error || "Producto no encontrado"}</h1>
            <Link href="/productos">
              <Button className="mt-4 rounded-lg bg-primary hover:bg-primary/90 cursor-pointer">
                Volver a productos
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link href="/productos" className="mb-6 flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Volver a productos
          </Link>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Images */}
            <div>
              <div className="mb-4 overflow-hidden rounded-xl border border-border bg-secondary">
                <img
                  src={product.images_array?.[selectedImage] || product.image_url}
                  alt={product.name}
                  className="h-96 w-full object-cover"
                />
              </div>
              {(product.images_array && product.images_array.length > 0) && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images_array.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors cursor-pointer ${
                        selectedImage === idx ? "border-primary" : "border-border"
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">{product.categories?.name || "Producto"}</p>
                <h1 className="mt-2 text-3xl font-bold text-foreground">{product.name}</h1>
              </div>

              {/* Rating */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating.toFixed(1)} ({product.reviews_count} opiniones)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6 rounded-xl border border-border bg-secondary p-4">
                <p className="text-sm text-muted-foreground mb-1">Precio</p>
                <p className="text-3xl font-bold text-primary">${displayPrice?.toFixed(2)}</p>
                {isWholesaleEligible && product.wholesale_price && (
                  <p className="mt-1 text-xs text-green-600">✓ Precio mayoreo aplicado</p>
                )}
              </div>

              {/* Stock */}
              <div className="mb-6 flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-foreground">
                      {product.stock} unidades disponibles
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <span className="text-sm font-medium text-destructive">Agotado</span>
                  </>
                )}
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-foreground">Cantidad</label>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-background w-fit p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="rounded p-2 hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="rounded p-2 hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {product.wholesale_price && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Precio mayoreo a partir de {product.minimum_wholesale_quantity} unidades
                    </p>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="mb-6 flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Agregar al carrito
                </Button>
                <Button
                  onClick={handleWishlist}
                  variant={isWishlisted ? "default" : "outline"}
                  className="rounded-lg cursor-pointer"
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                </Button>
              </div>

              {/* Seller Info */}
              {product.sellers && (
                <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
                  <h3 className="mb-3 font-semibold text-foreground">Vendedor</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{product.sellers.store_name}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-muted-foreground">{product.sellers.rating.toFixed(1)}</span>
                        {product.sellers.is_verified && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border p-3 text-center">
                  <Truck className="mx-auto mb-2 h-5 w-5 text-primary" />
                  <p className="text-xs text-foreground">Envío gratis</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <Lock className="mx-auto mb-2 h-5 w-5 text-primary" />
                  <p className="text-xs text-foreground">Pago seguro</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <RefreshCw className="mx-auto mb-2 h-5 w-5 text-primary" />
                  <p className="text-xs text-foreground">Garantía 1 año</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-12 border-b border-border">
            <div className="flex gap-8">
              {(["description", "specs", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === tab
                      ? "border-b-2 border-primary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "description" && "Descripción"}
                  {tab === "specs" && "Especificaciones"}
                  {tab === "reviews" && "Opiniones"}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-foreground">{product.description || "Sin descripción"}</p>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold text-foreground">Características técnicas</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Categoría</p>
                    <p className="font-medium text-foreground">{product.categories?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock disponible</p>
                    <p className="font-medium text-foreground">{product.stock} unidades</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground">Sin opiniones aún</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{review.users?.nombre || "Usuario"}</p>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {review.title && <p className="font-semibold text-foreground mb-1">{review.title}</p>}
                      <p className="text-sm text-muted-foreground">{review.content}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
