"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "./product-card"

const products = [
  {
    id: "1",
    name: "Arduino Nano V3.0 ATmega328P Compatible con Cable USB",
    category: "Microcontroladores",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
    retailPrice: 149.00,
    wholesalePrice: 119.00,
    wholesaleMinQty: 10,
    rating: 4.8,
    reviewCount: 234,
    stock: "in_stock" as const,
    badge: "Más vendido",
  },
  {
    id: "2",
    name: "Kit Sensor Ultrasónico HC-SR04 con Cables Dupont",
    category: "Sensores",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=400&fit=crop",
    retailPrice: 89.00,
    wholesalePrice: 69.00,
    wholesaleMinQty: 15,
    rating: 4.6,
    reviewCount: 156,
    stock: "in_stock" as const,
  },
  {
    id: "3",
    name: "Raspberry Pi 4 Model B 4GB RAM con Disipadores",
    category: "Single Board",
    image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&h=400&fit=crop",
    retailPrice: 2499.00,
    wholesalePrice: 2199.00,
    wholesaleMinQty: 5,
    rating: 4.9,
    reviewCount: 89,
    stock: "low_stock" as const,
    badge: "Oferta",
  },
  {
    id: "4",
    name: "ESP32 DevKit V1 WiFi + Bluetooth Dual Core",
    category: "IoT",
    image: "https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=400&h=400&fit=crop",
    retailPrice: 189.00,
    wholesalePrice: 149.00,
    wholesaleMinQty: 10,
    rating: 4.7,
    reviewCount: 312,
    stock: "in_stock" as const,
  },
  {
    id: "5",
    name: "Kit Soldadura Completo: Cautín 60W + Pasta + Estaño",
    category: "Herramientas",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop",
    retailPrice: 399.00,
    rating: 4.5,
    reviewCount: 178,
    stock: "in_stock" as const,
  },
  {
    id: "6",
    name: "Módulo Relé 4 Canales 5V con Optoacoplador",
    category: "Módulos",
    image: "https://images.unsplash.com/photo-1597733336794-12d05021d510?w=400&h=400&fit=crop",
    retailPrice: 129.00,
    wholesalePrice: 99.00,
    wholesaleMinQty: 20,
    rating: 4.4,
    reviewCount: 92,
    stock: "in_stock" as const,
  },
  {
    id: "7",
    name: "Pantalla OLED 0.96\" I2C 128x64 SSD1306 Azul",
    category: "Displays",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop",
    retailPrice: 79.00,
    wholesalePrice: 59.00,
    wholesaleMinQty: 25,
    rating: 4.8,
    reviewCount: 267,
    stock: "in_stock" as const,
    badge: "Nuevo",
  },
  {
    id: "8",
    name: "Motor Paso a Paso NEMA 17 con Driver A4988",
    category: "Motores",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop",
    retailPrice: 349.00,
    wholesalePrice: 299.00,
    wholesaleMinQty: 5,
    rating: 4.6,
    reviewCount: 134,
    stock: "low_stock" as const,
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
              Productos destacados
            </h2>
            <p className="text-muted-foreground">
              Los favoritos de la comunidad maker de Tijuana
            </p>
          </div>
          <Button variant="outline" className="w-fit rounded-xl border-primary/20 hover:bg-primary/10">
            Ver todo el catálogo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  )
}
