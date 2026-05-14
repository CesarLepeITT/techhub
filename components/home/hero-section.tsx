"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Sparkles, ArrowRight, Truck, TrendingUp, Package, Play } from "lucide-react"
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

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()

  const handleSearch = () => {
    const query = searchQuery.trim()
    router.push(query ? `/productos?buscar=${encodeURIComponent(query)}` : "/productos")
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
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSearch()
                      }
                    }}
                    className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none cursor-text"
                  />
                </div>
                <Button
                  className="w-full rounded-lg bg-primary px-6 hover:bg-primary/90 sm:w-auto cursor-pointer"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleSearch}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
              </div>

              {/* Search Suggestions */}
              {isFocused && (
                <div className="absolute left-0 right-0 top-full mt-2 animate-fade-in rounded-xl bg-card p-3 shadow-elevated border border-border">
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
                          router.push(`/productos?buscar=${encodeURIComponent(suggestion)}`)
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
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
                Probar asistente IA
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
