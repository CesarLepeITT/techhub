"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Play,
  Volume2,
  VolumeX,
  ShoppingCart,
  ChevronUp,
  ChevronDown,
  Star,
  Package,
  Check,
  ExternalLink,
  Loader,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { cn } from "@/lib/utils"
import { useSession } from "@/components/SessionProvider"
import { getProductsForReels, addToCart } from "@/lib/supabase-queries"

const REEL_PRODUCT_IDS = [
  "fe1ab2c3-5aab-4b1b-a908-7d3ae6a26870",
  "617df9c1-1a8a-4ca2-bcf0-edc1d09eb325",
  "fa7bfbf8-9437-4068-b8cc-dea33c0c47e6",
  "3d4e5e4d-4601-46bc-8c76-5d20cdcbae80",
]

const SELLER_DATA: Record<string, { name: string; avatar: string; verified: boolean }> = {
  "fe1ab2c3-5aab-4b1b-a908-7d3ae6a26870": {
    name: "TechStore TJ",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    verified: true,
  },
  "617df9c1-1a8a-4ca2-bcf0-edc1d09eb325": {
    name: "IoT Solutions",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    verified: false,
  },
  "fa7bfbf8-9437-4068-b8cc-dea33c0c47e6": {
    name: "MakerZone MX",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    verified: true,
  },
  "3d4e5e4d-4601-46bc-8c76-5d20cdcbae80": {
    name: "Electro Maker",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    verified: true,
  },
}


type ReelProduct = {
  id: string
  name: string
  description: string
  image_url: string
  video_url: string | null
  price: number
  wholesale_price: number | null
  minimum_wholesale_quantity: number | null
  stock: number
  rating: number
  reviews_count: number
  categories: { name: string } | null
  sellers: { store_name: string; is_verified: boolean } | null
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(price)
}

function getStockStatus(stock: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (stock <= 0) return "out_of_stock"
  if (stock <= 5) return "low_stock"
  return "in_stock"
}

function ReelCard({
  product,
  isActive,
  isMuted,
  onToggleMute,
  onRequireAuth,
}: {
  product: ReelProduct
  isActive: boolean
  isMuted: boolean
  onToggleMute: () => void
  onRequireAuth: () => boolean
}) {
  const { user } = useSession()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)

  const seller = SELLER_DATA[product.id]
  const stockStatus = getStockStatus(product.stock)

  // Autoplay on mount and whenever the product (src) changes
  useEffect(() => {
    const video = videoRef.current
    if (!video || !product.video_url) return
    setVideoLoaded(false)
    setIsPaused(false)
    video.load()
    video.play().catch(() => {})
  }, [product.video_url])

  // Sync mute state
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted
  }, [isMuted])

  const handleCartClick = async () => {
    if (!onRequireAuth()) return
    if (!user) return
    const res = await addToCart(user.id, product.id, 1)
    if (!res.error) {
      setIsAddedToCart(true)
      window.dispatchEvent(new Event("cart-updated"))
    }
  }

  const togglePause = () => {
    const video = videoRef.current
    if (!video) return
    if (isPaused) {
      video.play().catch(() => {})
      setIsPaused(false)
    } else {
      video.pause()
      setIsPaused(true)
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Video or Image background */}
      {product.video_url ? (
        <>
          {!videoLoaded && (
            <div className="absolute inset-0">
              <Image src={product.image_url} alt={product.name} fill unoptimized className="object-cover" />
            </div>
          )}
          <video
            ref={videoRef}
            src={product.video_url}
            autoPlay
            loop
            playsInline
            muted={isMuted}
            onCanPlay={() => setVideoLoaded(true)}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
              videoLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        </>
      ) : (
        <div className="absolute inset-0">
          <Image src={product.image_url} alt={product.name} fill unoptimized className="object-cover" priority={isActive} />
        </div>
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Tap to pause/resume */}
      <button className="absolute inset-0 flex items-center justify-center" onClick={togglePause}>
        {isPaused && (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
            <Play className="h-10 w-10 fill-white text-white" />
          </div>
        )}
      </button>

      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4 pt-20 md:pt-28">
        <div className="rounded-full bg-black/30 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-sm font-medium text-white">{product.categories?.name ?? "Tech"}</span>
        </div>
        <button
          onClick={onToggleMute}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm"
        >
          {isMuted ? <VolumeX className="h-5 w-5 text-white" /> : <Volume2 className="h-5 w-5 text-white" />}
        </button>
      </div>

      {/* Right side — only cart */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
        <button className="flex flex-col items-center gap-1" onClick={handleCartClick}>
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
            isAddedToCart ? "bg-primary" : "bg-black/30 backdrop-blur-sm"
          )}>
            {isAddedToCart ? <Check className="h-6 w-6 text-white" /> : <ShoppingCart className="h-6 w-6 text-white" />}
          </div>
          <span className="text-xs font-medium text-white">{isAddedToCart ? "Agregado" : "Comprar"}</span>
        </button>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8">
        {/* Seller info — sin botón Seguir */}
        {seller && (
          <div className="mb-4 flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white">
              <Image src={seller.avatar} alt={seller.name} fill unoptimized className="object-cover" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-white">{seller.name}</span>
              {seller.verified && (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm text-white/90">{product.description}</p>

        {/* Product card */}
        <div className="rounded-lg bg-card/90 p-3 backdrop-blur-sm">
          <div className="flex gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-foreground">{product.name}</h3>
              <div className="mb-1 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-muted-foreground">{product.rating.toFixed(1)}</span>
                </div>
                <span className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium",
                  stockStatus === "in_stock"
                    ? "bg-primary/10 text-primary"
                    : stockStatus === "low_stock"
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-destructive/10 text-destructive"
                )}>
                  {stockStatus === "in_stock" ? "En stock" : stockStatus === "low_stock" ? "Últimas pzas" : "Agotado"}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-foreground">{formatPrice(product.price)}</span>
                {product.wholesale_price && (
                  <span className="text-xs text-primary">Mayoreo {formatPrice(product.wholesale_price)}</span>
                )}
              </div>
            </div>
            <Button
              size="sm"
              className="shrink-0 self-center rounded-xl bg-primary hover:bg-primary/90"
              onClick={handleCartClick}
              disabled={stockStatus === "out_of_stock"}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DesktopProductPanel({
  product,
  onRequireAuth,
}: {
  product: ReelProduct
  onRequireAuth: () => boolean
}) {
  const { user } = useSession()
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const seller = SELLER_DATA[product.id]
  const stockStatus = getStockStatus(product.stock)

  const handleCart = async () => {
    if (!onRequireAuth()) return
    if (!user) return
    const res = await addToCart(user.id, product.id, 1)
    if (!res.error) {
      setIsAddedToCart(true)
      window.dispatchEvent(new Event("cart-updated"))
    }
  }

  return (
    <div className="flex h-full flex-col bg-card p-6">
      <div className="mb-6">
        <span className="mb-2 inline-flex rounded-lg bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
          {product.categories?.name ?? "Tech"}
        </span>
        <h2 className="mb-2 text-xl font-bold text-foreground">{product.name}</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-border"
                )}
              />
            ))}
            <span className="ml-1 text-sm text-muted-foreground">({product.reviews_count} reseñas)</span>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-secondary/50 p-4">
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</span>
          <span className="text-sm text-muted-foreground">MXN</span>
        </div>
        {product.wholesale_price && (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Mayoreo: {formatPrice(product.wholesale_price)} ({product.minimum_wholesale_quantity ?? 10}+ pzas)
            </span>
          </div>
        )}
      </div>

      {seller && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-border/50 p-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full">
            <Image src={seller.avatar} alt={seller.name} fill unoptimized className="object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-foreground">{seller.name}</span>
              {seller.verified && (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </div>
              )}
            </div>
            <span className="text-sm text-muted-foreground">Vendedor verificado</span>
          </div>
          <Button variant="outline" size="sm" className="ml-auto rounded-xl">
            Ver tienda
          </Button>
        </div>
      )}

      <p className="mb-6 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
        {product.description}
      </p>

      <div className="mt-auto space-y-3">
        <Button
          className={cn(
            "w-full rounded-xl py-6 transition-all",
            isAddedToCart
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          disabled={stockStatus === "out_of_stock"}
          onClick={handleCart}
        >
          {isAddedToCart ? (
            <><Check className="mr-2 h-5 w-5" />Agregado al carrito</>
          ) : (
            <><ShoppingCart className="mr-2 h-5 w-5" />Agregar al carrito</>
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-xl py-6"
          onClick={() => window.location.href = `/producto/${product.id}`}
        >
          <ExternalLink className="mr-2 h-5 w-5" />
          Ver detalles completos
        </Button>
      </div>
    </div>
  )
}

export default function ReelsPage() {
  const router = useRouter()
  const { user } = useSession()
  const [products, setProducts] = useState<ReelProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const touchStartYRef = useRef<number | null>(null)
  const wheelLockRef = useRef(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await getProductsForReels(REEL_PRODUCT_IDS)
      // Preserve the order from REEL_PRODUCT_IDS
      const ordered = REEL_PRODUCT_IDS
        .map((id) => data.find((p) => p.id === id))
        .filter(Boolean) as ReelProduct[]
      setProducts(ordered)
      setIsLoading(false)
    }
    void load()
  }, [])

  const goToNext = () => setCurrentIndex((i) => (i + 1) % products.length)
  const goToPrevious = () => setCurrentIndex((i) => (i - 1 + products.length) % products.length)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") goToNext()
      else if (e.key === "ArrowUp" || e.key === "k") goToPrevious()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [products.length])

  const requireAuth = () => {
    if (!user) {
      router.push("/iniciar-sesion")
      return false
    }
    return true
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Header />
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">No hay reels disponibles</p>
        </div>
      </div>
    )
  }

  const currentProduct = products[currentIndex]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16 md:pt-20">
        {/* Mobile View */}
        <div className="lg:hidden">
          <div
            className="relative h-[calc(100dvh-3.5rem)] w-full overflow-hidden"
            onTouchStart={(e) => { touchStartYRef.current = e.touches[0]?.clientY ?? null }}
            onTouchEnd={(e) => {
              const startY = touchStartYRef.current
              const endY = e.changedTouches[0]?.clientY
              touchStartYRef.current = null
              if (startY == null || endY == null || Math.abs(startY - endY) < 50) return
              if (startY - endY > 0) goToNext()
              else goToPrevious()
            }}
            onWheel={(e) => {
              if (wheelLockRef.current || Math.abs(e.deltaY) < 30) return
              wheelLockRef.current = true
              if (e.deltaY > 0) goToNext()
              else goToPrevious()
              window.setTimeout(() => { wheelLockRef.current = false }, 350)
            }}
          >
            <ReelCard
              product={currentProduct}
              isActive={true}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
              onRequireAuth={requireAuth}
            />

            {/* Navigation buttons */}
            <div className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2 sm:flex">
              <button onClick={goToPrevious} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
                <ChevronUp className="h-6 w-6 text-white" />
              </button>
              <button onClick={goToNext} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
                <ChevronDown className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Progress indicators */}
            <div className="absolute left-4 top-20 z-20 flex flex-col gap-1.5">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "h-1 rounded-full transition-all",
                    index === currentIndex ? "w-8 bg-white" : "w-6 bg-white/40"
                  )}
                />
              ))}
            </div>

            <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              Desliza arriba o abajo
            </div>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block">
          <div className="mx-auto flex max-w-6xl items-start justify-center gap-8 px-8 py-8">
            {/* Phone Frame */}
            <div className="relative">
              <div className="relative rounded-[3rem] bg-foreground/90 p-3 shadow-float">
                <div className="relative h-[680px] w-[min(340px,32vw)] overflow-hidden rounded-[2.5rem] bg-black">
                  <ReelCard
                    product={currentProduct}
                    isActive={true}
                    isMuted={isMuted}
                    onToggleMute={() => setIsMuted(!isMuted)}
                    onRequireAuth={requireAuth}
                  />
                </div>
                <div className="absolute left-1/2 top-5 h-6 w-24 -translate-x-1/2 rounded-full bg-foreground/90" />
              </div>

              <div className="absolute -right-16 top-1/2 flex -translate-y-1/2 flex-col gap-3">
                <button onClick={goToPrevious} className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-soft transition-lift">
                  <ChevronUp className="h-6 w-6 text-foreground" />
                </button>
                <button onClick={goToNext} className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-soft transition-lift">
                  <ChevronDown className="h-6 w-6 text-foreground" />
                </button>
              </div>

              <div className="absolute -left-8 top-1/2 flex -translate-y-1/2 flex-col gap-2">
                {products.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all",
                      index === currentIndex ? "scale-125 bg-primary" : "bg-border hover:bg-muted-foreground"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Product Details Panel */}
            <div className="h-[680px] w-[min(24rem,32vw)] min-w-[20rem] overflow-hidden rounded-xl bg-card shadow-soft">
              <DesktopProductPanel product={currentProduct} onRequireAuth={requireAuth} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
