"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Truck, 
  Package, 
  Tag,
  Share2,
  QrCode,
  Copy,
  Check,
  ArrowLeft,
  CreditCard,
  Shield,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { cn } from "@/lib/utils"

interface CartItem {
  id: string
  name: string
  image: string
  price: number
  wholesalePrice?: number
  quantity: number
  wholesaleMinQty?: number
  category: string
  seller: string
}

const initialCartItems: CartItem[] = [
  {
    id: "1",
    name: "Arduino Nano V3.0 ATmega328P Compatible con Cable USB",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop",
    price: 149,
    wholesalePrice: 119,
    quantity: 12,
    wholesaleMinQty: 10,
    category: "Microcontroladores",
    seller: "TechStore TJ",
  },
  {
    id: "2",
    name: "Sensor Ultrasónico HC-SR04 con Cables Dupont",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=200&h=200&fit=crop",
    price: 89,
    wholesalePrice: 69,
    quantity: 5,
    wholesaleMinQty: 15,
    category: "Sensores",
    seller: "MakerZone MX",
  },
  {
    id: "3",
    name: "ESP32 DevKit V1 WiFi + Bluetooth Dual Core",
    image: "https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=200&h=200&fit=crop",
    price: 189,
    wholesalePrice: 149,
    quantity: 3,
    wholesaleMinQty: 10,
    category: "IoT",
    seller: "IoT Solutions",
  },
]

const shippingOptions = [
  {
    id: "local",
    name: "Entrega local Tijuana",
    description: "Mismo día o siguiente día hábil",
    price: 0,
    time: "1-2 días",
    icon: Truck,
  },
  {
    id: "express",
    name: "Express nacional",
    description: "Envío prioritario a todo México",
    price: 149,
    time: "2-3 días",
    icon: Package,
  },
  {
    id: "standard",
    name: "Estándar nacional",
    description: "Envío económico",
    price: 79,
    time: "5-7 días",
    icon: Clock,
  },
]

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(price)
}

function CartItemCard({ 
  item, 
  onUpdateQuantity, 
  onRemove 
}: { 
  item: CartItem
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}) {
  const isWholesale = item.wholesaleMinQty && item.quantity >= item.wholesaleMinQty
  const unitPrice = isWholesale && item.wholesalePrice ? item.wholesalePrice : item.price
  const subtotal = unitPrice * item.quantity

  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-soft">
      {/* Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary/30">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <div className="mb-1 flex items-start justify-between gap-2">
          <div>
            <span className="mb-1 inline-block rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {item.category}
            </span>
            <h3 className="text-sm font-semibold text-foreground line-clamp-2">{item.name}</h3>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-2 text-xs text-muted-foreground">Vendido por {item.seller}</p>

        <div className="mt-auto flex items-end justify-between">
          {/* Quantity */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
            <button
              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center text-sm font-medium text-foreground">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">{formatPrice(subtotal)}</div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">{formatPrice(unitPrice)}/u</span>
              {isWholesale && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary font-medium">
                  Mayoreo
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Wholesale hint */}
        {item.wholesaleMinQty && !isWholesale && item.wholesalePrice && (
          <div className="mt-2 rounded-lg bg-primary/5 px-3 py-2 text-xs text-primary">
            <Tag className="mr-1 inline h-3 w-3" />
            Agrega {item.wholesaleMinQty - item.quantity} más para precio mayoreo ({formatPrice(item.wholesalePrice)}/u)
          </div>
        )}
      </div>
    </div>
  )
}

function ShareCartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const shareLink = "https://techmarket.mx/cart/shared/abc123"

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-slide-up rounded-xl border border-border bg-card p-6 shadow-float">
        <h3 className="mb-2 text-xl font-bold text-foreground">Compartir carrito</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Comparte este enlace con colegas o clientes para que vean tu selección de productos.
        </p>

        {/* QR Code placeholder */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-secondary">
            <QrCode className="h-24 w-24 text-muted-foreground" />
          </div>
        </div>

        {/* Link input */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={shareLink}
            readOnly
            className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground cursor-text"
          />
          <Button
            onClick={handleCopy}
            className={cn(
              "shrink-0 rounded-lg transition-all cursor-pointer",
              copied ? "bg-primary/10 text-primary" : "bg-primary text-primary-foreground"
            )}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-lg cursor-pointer" onClick={onClose}>
            Cerrar
          </Button>
          <Button className="flex-1 rounded-lg bg-primary hover:bg-primary/90 cursor-pointer">
            <Share2 className="mr-2 h-4 w-4" />
            Compartir
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems)
  const [selectedShipping, setSelectedShipping] = useState("local")
  const [showShareModal, setShowShareModal] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems(items =>
      items.map(item => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const isWholesale = item.wholesaleMinQty && item.quantity >= item.wholesaleMinQty
      const unitPrice = isWholesale && item.wholesalePrice ? item.wholesalePrice : item.price
      return total + unitPrice * item.quantity
    }, 0)
  }

  const calculateWholesaleSavings = () => {
    return cartItems.reduce((savings, item) => {
      const isWholesale = item.wholesaleMinQty && item.quantity >= item.wholesaleMinQty
      if (isWholesale && item.wholesalePrice) {
        return savings + (item.price - item.wholesalePrice) * item.quantity
      }
      return savings
    }, 0)
  }

  const subtotal = calculateSubtotal()
  const wholesaleSavings = calculateWholesaleSavings()
  const shippingCost = shippingOptions.find(s => s.id === selectedShipping)?.price || 0
  const promoDiscount = promoApplied ? subtotal * 0.1 : 0
  const total = subtotal + shippingCost - promoDiscount

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 pt-20 md:pt-24">
          <div className="text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-xl bg-secondary">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">Tu carrito está vacío</h1>
            <p className="mb-8 text-muted-foreground">
              Explora nuestro catálogo y encuentra los componentes que necesitas
            </p>
            <Link href="/productos">
              <Button className="rounded-lg bg-primary px-8 hover:bg-primary/90 cursor-pointer">
                Explorar productos
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pb-24 pt-20 md:pb-8 md:pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link
                href="/productos"
                className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Seguir comprando
              </Link>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Carrito de compras
              </h1>
            </div>
            <Button
              variant="outline"
              className="rounded-lg border-primary/20 hover:bg-primary/10 cursor-pointer"
              onClick={() => setShowShareModal(true)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartir carrito
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map(item => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Shipping Options */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                  <h2 className="mb-4 text-lg font-semibold text-foreground">Opciones de envío</h2>
                  <div className="space-y-3">
                    {shippingOptions.map(option => (
                      <label
                        key={option.id}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border-2 p-4 transition-colors cursor-pointer",
                          selectedShipping === option.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={option.id}
                          checked={selectedShipping === option.id}
                          onChange={() => setSelectedShipping(option.id)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                          selectedShipping === option.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        )}>
                          <option.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">{option.name}</span>
                            <span className="font-semibold text-foreground">
                              {option.price === 0 ? "Gratis" : formatPrice(option.price)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                          <span className="text-xs text-primary">{option.time}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Promo Code */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                  <h2 className="mb-4 text-lg font-semibold text-foreground">Código promocional</h2>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ingresa tu código"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                    />
                    <Button
                      variant="outline"
                      className="shrink-0 rounded-lg cursor-pointer"
                      onClick={() => {
                        if (promoCode) setPromoApplied(true)
                      }}
                      disabled={promoApplied}
                    >
                      {promoApplied ? <Check className="h-4 w-4" /> : "Aplicar"}
                    </Button>
                  </div>
                  {promoApplied && (
                    <p className="mt-2 text-sm text-primary">
                      Código aplicado: 10% de descuento
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
                  <h2 className="mb-4 text-lg font-semibold text-foreground">Resumen del pedido</h2>
                  
                  <div className="space-y-3 border-b border-border pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal ({cartItems.length} productos)</span>
                      <span className="text-foreground">{formatPrice(subtotal)}</span>
                    </div>
                    {wholesaleSavings > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-primary">Ahorro mayoreo</span>
                        <span className="text-primary">-{formatPrice(wholesaleSavings)}</span>
                      </div>
                    )}
                    {promoApplied && (
                      <div className="flex justify-between text-sm">
                        <span className="text-primary">Descuento promocional</span>
                        <span className="text-primary">-{formatPrice(promoDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envío</span>
                      <span className="text-foreground">
                        {shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between py-4">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-foreground">{formatPrice(total)}</span>
                      <span className="block text-xs text-muted-foreground">MXN (IVA incluido)</span>
                    </div>
                  </div>

                  <Button className="w-full rounded-lg bg-primary py-6 text-base hover:bg-primary/90 cursor-pointer">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Proceder al pago
                  </Button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Pago seguro con encriptación SSL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      <ShareCartModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </div>
  )
}
