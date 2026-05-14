"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Sparkles, ArrowRight, Truck, TrendingUp, Package, Play, Loader, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const suggestions = [
  "Arduino Nano para proyecto IoT",
  "Componentes para robot seguidor de línea",
  "Kit de soldadura para principiantes",
  "Sensores para invernadero automatizado",
]

const features = [
  {
    icon: Package,
    title: "Mayoreo activo",
    description: "Precios especiales desde 10 piezas",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: TrendingUp,
    title: "Predicción IA",
    description: "Recomendaciones inteligentes",
    color: "bg-accent/30 text-accent-foreground",
  },
  {
    icon: Truck,
    title: "Entrega local",
    description: "Mismo día en Tijuana",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    icon: Play,
    title: "TechReels",
    description: "Videos de productos",
    color: "bg-[#84bcbf]/20 text-foreground",
  },
]

type ChatProduct = {
  id: string
  name: string
  retail_price: number
  stock: number
  main_image_url: string | null
}

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState("")
  const [products, setProducts] = useState<ChatProduct[]>([])
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSearch = async () => {
    const query = searchQuery.trim()
    if (!query) return

    setIsLoading(true)
    setError("")
    setAiResponse("")
    setProducts([])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "Error desconocido")
        return
      }

      setAiResponse(data.response)
      setProducts(data.products || [])
    } catch {
      setError("No pude procesar tu solicitud")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative overflow-hidden bg-secondary/30 md:min-h-[90vh]">
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6  lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Hero Title */}
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Tecnología, componentes y electrónica para{" "}
            <span className="text-primary">makers de Tijuana</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
            Compra hardware, kits, refacciones y accesorios tech con recomendaciones inteligentes.
          </p>

          {/* AI Search Box */}
          <div className="mx-auto mb-8 max-w-2xl">
            <div
              className={`relative rounded-xl border border-border bg-card p-1.5 shadow-elevated transition-all duration-300 ${
                isFocused ? "ring-2 ring-primary/30 shadow-float" : ""
              }`}
            >
              <div className="flex flex-col gap-3 rounded-lg bg-card px-4 py-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <input
                    type="text"
                    placeholder="Describe lo que necesitas construir..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSearch()
                      }
                    }}
                    className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none cursor-text"
                  />
                </div>
                <Button
                  className="w-full rounded-lg bg-primary px-6 hover:bg-primary/90 sm:w-auto cursor-pointer disabled:opacity-50"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>

              {/* Search Suggestions or AI Results */}
              {isFocused && !isLoading && !aiResponse && (
                <div className="absolute left-0 right-0 top-full mt-2 animate-fade-in rounded-xl bg-card p-3 shadow-elevated border border-border z-10">
                  <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                    Sugerencias populares
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        className="rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setSearchQuery(suggestion)
                          setIsFocused(false)
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Response */}
              {aiResponse && (
                <div className="absolute left-0 right-0 top-full mt-2 animate-fade-in rounded-xl bg-card p-4 shadow-elevated border border-border z-10 max-h-96 overflow-y-auto">
                  <div className="mb-4">
                    <p className="text-sm text-foreground leading-relaxed">{aiResponse}</p>
                  </div>

                  {products.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground mb-3">Productos recomendados:</p>
                      {products.map((product) => (
                        <Link
                          key={product.id}
                          href={`/producto/${product.id}`}
                          className="flex gap-3 rounded-lg bg-secondary/50 p-3 hover:bg-secondary transition-colors cursor-pointer"
                        >
                          {product.main_image_url && (
                            <img
                              src={product.main_image_url}
                              alt={product.name}
                              className="h-12 w-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground truncate">{product.name}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm font-bold text-primary">${product.retail_price}</p>
                              <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  <Button
                    className="mt-4 w-full rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
                    onClick={() => {
                      setAiResponse("")
                      setProducts([])
                      setSearchQuery("")
                      setIsFocused(false)
                    }}
                  >
                    Nueva búsqueda
                  </Button>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="absolute left-0 right-0 top-full mt-2 animate-fade-in rounded-xl bg-destructive/10 border border-destructive/30 p-4 shadow-elevated z-10">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/productos">
              <Button
                size="lg"
                className="w-full rounded-xl bg-primary px-8 py-6 text-base font-medium hover:bg-primary/90 sm:w-auto cursor-pointer"
              >
                Explorar productos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/asistente">
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-xl border-2 border-primary/20 bg-card px-8 py-6 text-base font-medium hover:bg-primary/10 sm:w-auto cursor-pointer"
              >
                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                Chat completo
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-5 shadow-soft transition-lift cursor-pointer"
              >
                <div
                  className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg ${feature.color}`}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
