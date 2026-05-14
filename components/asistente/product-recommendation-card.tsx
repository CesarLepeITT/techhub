import Image from "next/image"

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop"

export type ChatProduct = {
  id: string
  name: string
  retail_price: number
  stock: number
  image_url: string | null
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(price)
}

export function ProductRecommendationCard({ product }: { product: ChatProduct }) {
  const imageUrl = product.image_url || FALLBACK_IMAGE

  return (
    <a href={`/producto/${product.id}`} className="flex gap-3 rounded-lg bg-card p-3 shadow-soft transition-lift">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary/30">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="64px"
          unoptimized
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-foreground">{product.name}</p>
        <p className="mt-1 text-sm font-bold text-foreground">{formatPrice(product.retail_price)}</p>
        <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
      </div>
    </a>
  )
}
