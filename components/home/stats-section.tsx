"use client"

import { Package, TrendingUp, Users, Truck } from "lucide-react"

const stats = [
  {
    icon: Package,
    value: "12,500+",
    label: "Productos disponibles",
    color: "text-primary",
  },
  {
    icon: Users,
    value: "3,200+",
    label: "Makers activos",
    color: "text-accent-foreground",
  },
  {
    icon: Truck,
    value: "24hrs",
    label: "Entrega promedio TJ",
    color: "text-primary",
  },
  {
    icon: TrendingUp,
    value: "95%",
    label: "Satisfacción",
    color: "text-accent-foreground",
  },
]

export function StatsSection() {
  return (
    <section className="bg-gradient-to-br from-secondary via-background to-accent/10 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-3xl bg-card/80 p-8 text-center shadow-soft backdrop-blur-sm"
            >
              <div className={`mb-4 ${stat.color}`}>
                <stat.icon className="h-8 w-8" />
              </div>
              <span className="mb-1 text-3xl font-bold text-foreground sm:text-4xl">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
