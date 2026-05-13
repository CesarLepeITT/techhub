"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { 
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  ShoppingCart,
  ChevronUp,
  ChevronDown,
  Star,
  Package,
  User,
  Check,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { cn } from "@/lib/utils"

interface TechReel {
  id: string
  videoUrl: string
  thumbnailUrl: string
  product: {
    id: string
    name: string
    price: number
    wholesalePrice?: number
    rating: number
    reviewCount: number
    image: string
    category: string
    stock: "in_stock" | "low_stock" | "out_of_stock"
  }
  seller: {
    name: string
    avatar: string
    verified: boolean
  }
  stats: {
    likes: number
    comments: number
    shares: number
  }
  description: string
}

const reels: TechReel[] = [
  {
    id: "1",
    videoUrl: "",
    thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=720&h=1280&fit=crop",
    product: {
      id: "p1",
      name: "Arduino Nano V3.0 ATmega328P Compatible",
      price: 149,
      wholesalePrice: 119,
      rating: 4.8,
      reviewCount: 234,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop",
      category: "Microcontroladores",
      stock: "in_stock",
    },
    seller: {
      name: "TechStore TJ",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      verified: true,
    },
    stats: { likes: 1234, comments: 89, shares: 45 },
    description: "El Arduino perfecto para tus proyectos IoT. Compatible con todos los sensores.",
  },
  {
    id: "2",
    videoUrl: "",
    thumbnailUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=720&h=1280&fit=crop",
    product: {
      id: "p2",
      name: "Raspberry Pi 4 Model B 4GB RAM",
      price: 2499,
      wholesalePrice: 2199,
      rating: 4.9,
      reviewCount: 89,
      image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=200&h=200&fit=crop",
      category: "Single Board",
      stock: "low_stock",
    },
    seller: {
      name: "MakerZone MX",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      verified: true,
    },
    stats: { likes: 2567, comments: 156, shares: 89 },
    description: "La Raspberry Pi más potente. Perfecta para servidores y proyectos multimedia.",
  },
  {
    id: "3",
    videoUrl: "",
    thumbnailUrl: "https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=720&h=1280&fit=crop",
    product: {
      id: "p3",
      name: "ESP32 DevKit WiFi + Bluetooth",
      price: 189,
      wholesalePrice: 149,
      rating: 4.7,
      reviewCount: 312,
      image: "https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=200&h=200&fit=crop",
      category: "IoT",
      stock: "in_stock",
    },
    seller: {
      name: "IoT Solutions",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      verified: false,
    },
    stats: { likes: 987, comments: 67, shares: 34 },
    description: "WiFi y Bluetooth en una sola placa. El mejor precio de Tijuana.",
  },
  {
    id: "4",
    videoUrl: "",
    thumbnailUrl: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=720&h=1280&fit=crop",
    product: {
      id: "p4",
      name: "Kit Sensor Ultrasónico HC-SR04",
      price: 89,
      wholesalePrice: 69,
      rating: 4.6,
      reviewCount: 156,
      image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=200&h=200&fit=crop",
      category: "Sensores",
      stock: "in_stock",
    },
    seller: {
      name: "Electro Maker",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      verified: true,
    },
    stats: { likes: 756, comments: 45, shares: 23 },
    description: "Mide distancias de 2cm a 4m con precisión milimétrica.",
  },
]

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(price)
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

function ReelCard({ 
  reel, 
  isActive, 
  isMuted,
  onToggleMute 
}: { 
  reel: TechReel
  isActive: boolean
  isMuted: boolean
  onToggleMute: () => void
}) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isAddedToCart, setIsAddedToCart] = useState(false)

  return (
    <div className="relative h-full w-full overflow-hidden bg-foreground/5">
      {/* Video/Image Background */}
      <div className="absolute inset-0">
        <Image
          src={reel.thumbnailUrl}
          alt={reel.product.name}
          fill
          className="object-cover"
          priority={isActive}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-foreground/30" />
      </div>

      {/* Play/Pause overlay */}
      <button
        className="absolute inset-0 flex items-center justify-center"
        onClick={() => setIsPlaying(!isPlaying)}
      >
        {!isPlaying && (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-foreground/20 backdrop-blur-sm">
            <Play className="h-10 w-10 text-background fill-background" />
          </div>
        )}
      </button>

      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4 pt-20 md:pt-28">
        <div className="rounded-full bg-foreground/20 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-sm font-medium text-background">{reel.product.category}</span>
        </div>
        <button
          onClick={onToggleMute}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/20 backdrop-blur-sm"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-background" />
          ) : (
            <Volume2 className="h-5 w-5 text-background" />
          )}
        </button>
      </div>

      {/* Right side actions */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
        {/* Like */}
        <button
          className="flex flex-col items-center gap-1"
          onClick={() => setIsLiked(!isLiked)}
        >
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
            isLiked ? "bg-red-500" : "bg-foreground/20 backdrop-blur-sm"
          )}>
            <Heart className={cn(
              "h-6 w-6 text-background",
              isLiked && "fill-background"
            )} />
          </div>
          <span className="text-xs font-medium text-background">
            {formatNumber(reel.stats.likes + (isLiked ? 1 : 0))}
          </span>
        </button>

        {/* Comments */}
        <button className="flex flex-col items-center gap-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/20 backdrop-blur-sm">
            <MessageCircle className="h-6 w-6 text-background" />
          </div>
          <span className="text-xs font-medium text-background">
            {formatNumber(reel.stats.comments)}
          </span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center gap-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/20 backdrop-blur-sm">
            <Share2 className="h-6 w-6 text-background" />
          </div>
          <span className="text-xs font-medium text-background">
            {formatNumber(reel.stats.shares)}
          </span>
        </button>

        {/* Cart */}
        <button
          className="flex flex-col items-center gap-1"
          onClick={() => setIsAddedToCart(!isAddedToCart)}
        >
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
            isAddedToCart ? "bg-primary" : "bg-foreground/20 backdrop-blur-sm"
          )}>
            {isAddedToCart ? (
              <Check className="h-6 w-6 text-background" />
            ) : (
              <ShoppingCart className="h-6 w-6 text-background" />
            )}
          </div>
          <span className="text-xs font-medium text-background">
            {isAddedToCart ? "Agregado" : "Comprar"}
          </span>
        </button>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8">
        {/* Seller info */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-background">
            <Image
              src={reel.seller.avatar}
              alt={reel.seller.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-background">{reel.seller.name}</span>
              {reel.seller.verified && (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </div>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto rounded-full border-background/50 bg-transparent text-background hover:bg-background/20"
          >
            Seguir
          </Button>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-background/90 line-clamp-2">
          {reel.description}
        </p>

        {/* Product card */}
        <div className="glass rounded-lg p-3">
          <div className="flex gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
              <Image
                src={reel.product.image}
                alt={reel.product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="mb-1 text-sm font-semibold text-foreground line-clamp-1">
                {reel.product.name}
              </h3>
              <div className="mb-1 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-muted-foreground">{reel.product.rating}</span>
                </div>
                <span className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium",
                  reel.product.stock === "in_stock" 
                    ? "bg-primary/10 text-primary" 
                    : "bg-amber-500/10 text-amber-600"
                )}>
                  {reel.product.stock === "in_stock" ? "En stock" : "Últimas pzas"}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-foreground">
                  {formatPrice(reel.product.price)}
                </span>
                {reel.product.wholesalePrice && (
                  <span className="text-xs text-primary">
                    Mayoreo {formatPrice(reel.product.wholesalePrice)}
                  </span>
                )}
              </div>
            </div>
            <Button size="sm" className="shrink-0 self-center rounded-xl bg-primary hover:bg-primary/90">
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DesktopProductPanel({ reel }: { reel: TechReel }) {
  const [isAddedToCart, setIsAddedToCart] = useState(false)

  return (
    <div className="flex h-full flex-col bg-card p-6">
      <div className="mb-6">
        <span className="mb-2 inline-flex rounded-lg bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
          {reel.product.category}
        </span>
        <h2 className="mb-2 text-xl font-bold text-foreground">{reel.product.name}</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.floor(reel.product.rating) 
                    ? "fill-amber-400 text-amber-400" 
                    : "text-border"
                )}
              />
            ))}
            <span className="ml-1 text-sm text-muted-foreground">
              ({reel.product.reviewCount} reseñas)
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-secondary/50 p-4">
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">
            {formatPrice(reel.product.price)}
          </span>
          <span className="text-sm text-muted-foreground">MXN</span>
        </div>
        {reel.product.wholesalePrice && (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Mayoreo: {formatPrice(reel.product.wholesalePrice)} (10+ pzas)
            </span>
          </div>
        )}
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-lg border border-border/50 p-4">
        <div className="relative h-12 w-12 overflow-hidden rounded-full">
          <Image
            src={reel.seller.avatar}
            alt={reel.seller.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground">{reel.seller.name}</span>
            {reel.seller.verified && (
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

      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        {reel.description} Este producto es ideal para proyectos de electrónica y robótica. 
        Compatible con múltiples plataformas y cuenta con excelente documentación.
      </p>

      <div className="mt-auto space-y-3">
        <Button
          className={cn(
            "w-full rounded-xl py-6 transition-all",
            isAddedToCart
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={() => setIsAddedToCart(!isAddedToCart)}
        >
          {isAddedToCart ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              Agregado al carrito
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Agregar al carrito
            </>
          )}
        </Button>
        <Button variant="outline" className="w-full rounded-xl py-6">
          <ExternalLink className="mr-2 h-5 w-5" />
          Ver detalles completos
        </Button>
      </div>
    </div>
  )
}

export default function ReelsPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const goToNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        goToNext()
      } else if (e.key === "ArrowUp" || e.key === "k") {
        goToPrevious()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentIndex])

  const currentReel = reels[currentIndex]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 md:pt-20">
        {/* Mobile View - Full Screen Vertical */}
        <div className="lg:hidden">
          <div 
            ref={containerRef}
            className="relative h-[calc(100vh-4rem)] w-full"
          >
            <ReelCard 
              reel={currentReel} 
              isActive={true}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
            />
            
            {/* Navigation buttons */}
            <div className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2 sm:flex">
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/20 backdrop-blur-sm disabled:opacity-30"
              >
                <ChevronUp className="h-6 w-6 text-background" />
              </button>
              <button
                onClick={goToNext}
                disabled={currentIndex === reels.length - 1}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/20 backdrop-blur-sm disabled:opacity-30"
              >
                <ChevronDown className="h-6 w-6 text-background" />
              </button>
            </div>

            {/* Progress indicators */}
            <div className="absolute left-4 top-20 z-20 flex flex-col gap-1.5">
              {reels.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "h-1 w-6 rounded-full transition-all",
                    index === currentIndex 
                      ? "bg-background w-8" 
                      : "bg-background/40"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop View - Phone Frame + Side Panel */}
        <div className="hidden lg:block">
          <div className="mx-auto flex max-w-6xl items-start justify-center gap-8 px-8 py-8">
            {/* Phone Frame */}
            <div className="relative">
              {/* Phone bezel */}
              <div className="relative rounded-[3rem] bg-foreground/90 p-3 shadow-float">
                {/* Screen */}
                <div className="relative h-[680px] w-[340px] overflow-hidden rounded-[2.5rem] bg-foreground">
                  <ReelCard 
                    reel={currentReel} 
                    isActive={true}
                    isMuted={isMuted}
                    onToggleMute={() => setIsMuted(!isMuted)}
                  />
                </div>
                {/* Notch */}
                <div className="absolute left-1/2 top-5 h-6 w-24 -translate-x-1/2 rounded-full bg-foreground/90" />
              </div>

              {/* Navigation arrows outside frame */}
              <div className="absolute -right-16 top-1/2 flex -translate-y-1/2 flex-col gap-3">
                <button
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-soft transition-lift disabled:opacity-30"
                >
                  <ChevronUp className="h-6 w-6 text-foreground" />
                </button>
                <button
                  onClick={goToNext}
                  disabled={currentIndex === reels.length - 1}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-soft transition-lift disabled:opacity-30"
                >
                  <ChevronDown className="h-6 w-6 text-foreground" />
                </button>
              </div>

              {/* Progress dots */}
              <div className="absolute -left-8 top-1/2 flex -translate-y-1/2 flex-col gap-2">
                {reels.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all",
                      index === currentIndex 
                        ? "bg-primary scale-125" 
                        : "bg-border hover:bg-muted-foreground"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Product Details Panel */}
            <div className="h-[680px] w-96 overflow-hidden rounded-xl bg-card shadow-soft">
              <DesktopProductPanel reel={currentReel} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
