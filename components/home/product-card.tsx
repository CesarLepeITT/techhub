"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, ShoppingCart, Package, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  id: string
  name: string
  category: string
  image: string
  retailPrice: number
  wholesalePrice?: number
  wholesaleMinQty?: number
  rating: number
  reviewCount: number
  stock: "in_stock" | "low_stock" | "out_of_stock"
  badge?: string
}

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

export function ProductCard({
  id,
  name,
  category,
  image,
  retailPrice,
  wholesalePrice,
  wholesaleMinQty,
  rating,
  reviewCount,
  stock,
  badge,
}: ProductCardProps) {
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
      {/* Badge */}
      {badge && (
        <div className="absolute left-3 top-3 z-10 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm">
          {badge}
        </div>
      )}

      {/* Image Container */}
      <Link href={`/productos/${id}`} className="cursor-pointer">
        <div className="relative aspect-square overflow-hidden bg-secondary/30">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category Badge */}
        <span className="mb-2 inline-flex w-fit rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
          {category}
        </span>

        {/* Title */}
        <Link href={`/productos/${id}`} className="cursor-pointer">
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-foreground hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mb-3 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3.5 w-3.5",
                  i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-border"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {rating.toFixed(1)} ({reviewCount})
          </span>
        </div>

        {/* Prices */}
        <div className="mb-3 space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">{formatPrice(retailPrice)}</span>
            <span className="text-xs text-muted-foreground">MXN</span>
          </div>
          {wholesalePrice && wholesaleMinQty && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-primary">{formatPrice(wholesalePrice)}</span>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Mayoreo desde {wholesaleMinQty} pzas
              </span>
            </div>
          )}
        </div>

        {/* Stock Badge */}
        <div className="mb-4">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium",
              stockLabels[stock].className
            )}
          >
            <Package className="h-3 w-3" />
            {stockLabels[stock].label}
          </span>
        </div>

        {/* Add to Cart Button */}
        <Button
          className={cn(
            "mt-auto w-full rounded-lg transition-all duration-300 cursor-pointer",
            isAdded
              ? "bg-primary/10 text-primary hover:bg-primary/20"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={handleAddToCart}
          disabled={stock === "out_of_stock" || isAdding}
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
              Agregar al carrito
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
