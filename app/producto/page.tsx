"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft,
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Package,
  Truck,
  Shield,
  Check,
  Minus,
  Plus,
  User,
  MessageCircle,
  TrendingUp,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { cn } from "@/lib/utils"

interface Review {
  id: string
  author: string
  rating: number
  date: string
  comment: string
  helpful: number
  avatar: string
}

const product = {
  id: "1",
  name: "Arduino Nano V3.0 ATmega328P Compatible con Cable USB",
  price: 149.00,
  wholesalePrice: 119.00,
  wholesaleMinQty: 10,
  rating: 4.8,
  reviewCount: 234,
  stock: 45,
  category: "Microcontroladores",
  seller: {
    name: "TechStore TJ",
    rating: 4.9,
    verified: true,
    reviews: 567
  },
  images: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=800&h=800&fit=crop",
  ],
  description: "Arduino Nano V3.0 es un pequeño microcontrolador basado en ATmega328 con pinout compatible con mini-breadboard. Compatible con todos los accesorios y shields estándar de Arduino.",
  specs: [
    { label: "Procesador", value: "ATmega328P" },
    { label: "Voltaje operativo", value: "5V" },
    { label: "Pines digitales", value: "22" },
    { label: "Pines analógicos", value: "8" },
    { label: "Memoria Flash", value: "32 KB" },
    { label: "SRAM", value: "2 KB" },
    { label: "Velocidad reloj", value: "16 MHz" },
  ],
  features: [
    "Compatible con mini-breadboard",
    "Puerto micro USB para programación",
    "LED integrado en pin 13",
    "Bajo costo, ideal para proyectos educativos",
    "Amplia comunidad y documentación",
    "Compatible con todos los sensores y módulos"
  ]
}

const reviews: Review[] = [
  {
    id: "1",
    author: "Carlos M.",
    rating: 5,
    date: "Hace 2 semanas",
    comment: "Excelente producto. Llegó rápido y funciona perfectamente. Lo recomiendo ampliamente para proyectos educativos.",
    helpful: 45,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
  },
  {
    id: "2",
    author: "María G.",
    rating: 4,
    date: "Hace 1 mes",
    comment: "Buen producto, precio muy competitivo. La documentación podría ser más detallada en español.",
    helpful: 28,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
  },
  {
    id: "3",
    author: "Roberto J.",
    rating: 5,
    date: "Hace 1 mes",
    comment: "Perfecto para mi proyecto de robótica. Compatibilidad total con mis sensores existentes.",
    helpful: 32,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
  },
]

const relatedProducts = [
  {
    id: "2",
    name: "Kit Sensor Ultrasónico HC-SR04",
    price: 89,
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=300&fit=crop",
    rating: 4.6,
    reviewCount: 156
  },
  {
    id: "3",
    name: "ESP32 DevKit V1 WiFi",
    price: 189,
    image: "https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=300&h=300&fit=crop",
    rating: 4.7,
    reviewCount: 312
  },
  {
    id: "4",
    name: "Protoboard 830 Puntos",
    price: 89,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=300&fit=crop",
    rating: 4.5,
    reviewCount: 145
  },
]

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(price)
}

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description")

  const isWholesale = quantity >= product.wholesaleMinQty
  const unitPrice = isWholesale ? product.wholesalePrice : product.price
  const subtotal = unitPrice * quantity

  const handleAddToCart = () => {
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-12 pt-20 md:pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary cursor-pointer">Home</Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/productos" className="text-muted-foreground hover:text-primary cursor-pointer">Productos</Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{product.name}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary/30">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                      selectedImage === index
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <span className="mb-2 inline-block rounded-lg bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      {product.category}
                    </span>
                    <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
                      {product.name}
                    </h1>
                  </div>
                  <button
                    onClick={() => setIsFavorited(!isFavorited)}
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                      isFavorited
                        ? "bg-red-500 text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    )}
                  >
                    <Heart className={cn("h-5 w-5", isFavorited && "fill-current")} />
                  </button>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.floor(product.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-border"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({product.reviewCount} reseñas)
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-xl bg-secondary/50 p-5">
                <div className="mb-3">
                  <div className="mb-1 text-sm text-muted-foreground">Precio</div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-foreground">
                      {formatPrice(unitPrice)}
                    </span>
                    {isWholesale && (
                      <span className="text-sm line-through text-muted-foreground">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>

                {product.wholesalePrice && (
                  <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
                    <TrendingUp className="mr-2 inline h-4 w-4" />
                    Mayoreo desde {product.wholesaleMinQty} piezas: {formatPrice(product.wholesalePrice)}/u
                  </div>
                )}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">En stock</p>
                  <p className="text-xs text-muted-foreground">{product.stock} unidades disponibles</p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Cantidad</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary cursor-pointer"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-medium text-foreground">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Subtotal: <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Button
                  className={cn(
                    "w-full rounded-xl py-6 transition-all cursor-pointer",
                    isAdded
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={handleAddToCart}
                >
                  {isAdded ? (
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
                <Button variant="outline" className="w-full rounded-xl py-6 cursor-pointer">
                  <Share2 className="mr-2 h-5 w-5" />
                  Compartir producto
                </Button>
              </div>

              {/* Seller Info */}
              <div className="rounded-xl border border-border p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{product.seller.name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {product.seller.rating} ({product.seller.reviews} reseñas)
                    </div>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                    <Sparkles className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <Button variant="outline" className="w-full rounded-lg cursor-pointer">
                  Ver tienda
                </Button>
              </div>

              {/* Benefits */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">Envío gratis a Tijuana</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">Pago seguro garantizado</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm text-foreground">Garantía de 1 año</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-12">
            <div className="mb-6 flex gap-4 border-b border-border">
              {(["description", "specs", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-3 font-medium transition-colors",
                    activeTab === tab
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === "description" && "Descripción"}
                  {tab === "specs" && "Especificaciones"}
                  {tab === "reviews" && "Reseñas"}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "description" && (
              <div className="space-y-4">
                <p className="text-base text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-foreground">Características principales</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="mt-1 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="rounded-xl border border-border p-6">
                <table className="w-full">
                  <tbody>
                    {product.specs.map((spec, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-3 font-medium text-foreground">{spec.label}</td>
                        <td className="py-3 text-right text-muted-foreground">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border border-border p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Image
                          src={review.avatar}
                          alt={review.author}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <p className="font-medium text-foreground">{review.author}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-border"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mb-3 text-sm text-foreground">{review.comment}</p>
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary cursor-pointer">
                      <MessageCircle className="h-4 w-4" />
                      Útil ({review.helpful})
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Products */}
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Productos relacionados</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((prod) => (
                <Link key={prod.id} href={`/producto/${prod.id}`}>
                  <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-lift cursor-pointer">
                    <div className="relative aspect-square overflow-hidden bg-secondary/30">
                      <Image
                        src={prod.image}
                        alt={prod.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
                        {prod.name}
                      </h3>
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-muted-foreground">{prod.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">({prod.reviewCount})</span>
                      </div>
                      <p className="text-lg font-bold text-foreground">{formatPrice(prod.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
