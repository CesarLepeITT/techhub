import Image from "next/image"

export type ChatProduct = {
  id: string
  name: string
  retail_price: number
  stock: number
  main_image_url: string | null
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(price)
}

export function ProductRecommendationCard({ product }: { product: ChatProduct }) {
  return (
    <a href={`/productos/${product.id}`} className="flex gap-3 rounded-lg bg-card p-3 shadow-soft transition-lift">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary/30">
        <Image
          src={product.main_image_url || "/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover"
          sizes="64px"
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
