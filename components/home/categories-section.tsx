"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"

const categories = [
  {
    name: "Microcontroladores",
    count: 234,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop",
    bgColor: "bg-primary/5",
  },
  {
    name: "Sensores",
    count: 456,
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=200&fit=crop",
    bgColor: "bg-accent/10",
  },
  {
    name: "Módulos IoT",
    count: 189,
    image: "https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=300&h=200&fit=crop",
    bgColor: "bg-[#84bcbf]/10",
  },
  {
    name: "Single Board",
    count: 78,
    image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=300&h=200&fit=crop",
    bgColor: "bg-secondary",
  },
  {
    name: "Herramientas",
    count: 312,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop",
    bgColor: "bg-primary/5",
  },
  {
    name: "Kits educativos",
    count: 156,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop",
    bgColor: "bg-[#9cccc4]/10",
  },
]

export function CategoriesSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Explora por categoría</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
              Encuentra lo que necesitas
            </h2>
            <p className="text-muted-foreground">
              Navega por nuestras categorías más populares
            </p>
          </div>
          <Link href="/productos">
            <Button variant="outline" className="w-fit rounded-lg border-primary/20 hover:bg-primary/10 cursor-pointer">
              Ver todas las categorías
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/productos?categoria=${encodeURIComponent(category.name)}`}
              className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-lift text-left cursor-pointer"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover opacity-15 transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 ${category.bgColor}`} />
              </div>

              {/* Content */}
              <div className="relative flex items-center justify-between p-6">
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-foreground">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} productos</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card/80 text-muted-foreground shadow-sm transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
