"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Users,
  Eye,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Brain,
  Activity,
  Filter,
  Download,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const sidebarNavigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/vendedor", active: true },
  { name: "Productos", icon: Package, href: "/vendedor/productos", active: false },
  { name: "Pedidos", icon: ShoppingCart, href: "/vendedor/pedidos", active: false },
  { name: "AnalÃ­ticas", icon: BarChart3, href: "/vendedor/analiticas", active: false },
  { name: "ConfiguraciÃ³n", icon: Settings, href: "/vendedor/configuracion", active: false },
]

const statsCards = [
  {
    title: "Ventas del mes",
    value: "$48,520",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Pedidos",
    value: "156",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
    color: "bg-accent/30 text-accent-foreground",
  },
  {
    title: "Visitantes",
    value: "2,847",
    change: "-3.1%",
    trend: "down",
    icon: Users,
    color: "bg-[#84bcbf]/20 text-foreground",
  },
  {
    title: "ConversiÃ³n",
    value: "5.4%",
    change: "+0.8%",
    trend: "up",
    icon: TrendingUp,
    color: "bg-secondary text-secondary-foreground",
  },
]

const recentOrders = [
  {
    id: "ORD-001",
    customer: "Carlos Mendoza",
    products: 3,
    total: 1499,
    status: "completed",
    date: "Hace 2 horas",
  },
  {
    id: "ORD-002",
    customer: "MarÃ­a GarcÃ­a",
    products: 5,
    total: 2890,
    status: "processing",
    date: "Hace 4 horas",
  },
  {
    id: "ORD-003",
    customer: "Roberto JimÃ©nez",
    products: 1,
    total: 189,
    status: "shipped",
    date: "Hace 6 horas",
  },
  {
    id: "ORD-004",
    customer: "Ana LÃ³pez",
    products: 8,
    total: 4250,
    status: "pending",
    date: "Hace 8 horas",
  },
  {
    id: "ORD-005",
    customer: "Pedro SÃ¡nchez",
    products: 2,
    total: 649,
    status: "completed",
    date: "Hace 12 horas",
  },
]

const lowStockProducts = [
  {
    id: "1",
    name: "Arduino Nano V3.0",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop",
    stock: 5,
    minStock: 20,
    price: 149,
  },
  {
    id: "2",
    name: "ESP32 DevKit V1",
    image: "https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=100&h=100&fit=crop",
    stock: 3,
    minStock: 15,
    price: 189,
  },
  {
    id: "3",
    name: "Raspberry Pi 4 4GB",
    image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=100&h=100&fit=crop",
    stock: 2,
    minStock: 10,
    price: 2499,
  },
]

const aiPredictions = [
  {
    id: "1",
    type: "demand",
    title: "Aumento de demanda esperado",
    description: "Arduino Nano tendrÃ¡ +45% de demanda en las prÃ³ximas 2 semanas",
    confidence: 87,
    action: "Reabastecer",
  },
  {
    id: "2",
    type: "price",
    title: "Oportunidad de precio",
    description: "ESP32 competidores subieron precios. Margen de mejora: +8%",
    confidence: 72,
    action: "Ajustar precio",
  },
  {
    id: "3",
    type: "trend",
    title: "Tendencia emergente",
    description: "Sensores de CO2 en aumento. Considera agregar al catÃ¡logo.",
    confidence: 65,
    action: "Explorar",
  },
]

const statusStyles = {
  completed: { label: "Completado", className: "bg-primary/10 text-primary" },
  processing: { label: "Procesando", className: "bg-amber-500/10 text-amber-600" },
  shipped: { label: "Enviado", className: "bg-[#84bcbf]/20 text-[#4a8c8f]" },
  pending: { label: "Pendiente", className: "bg-secondary text-secondary-foreground" },
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(price)
}

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border/50 bg-card lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border/50 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">techHub</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {sidebarNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-border/50 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">IA Analytics</p>
              <p className="text-xs text-muted-foreground">3 predicciones nuevas</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function TopBar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-border/50 bg-card/80 backdrop-blur-sm lg:left-64">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">Vendedor</span>
        </div>

        {/* Search */}
        <div className="hidden max-w-md flex-1 lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar productos, pedidos..."
              className="w-full rounded-xl border border-border/50 bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative rounded-xl">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
          </Button>
          <Button className="hidden rounded-xl bg-primary hover:bg-primary/90 sm:flex">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Button>
          <div className="relative h-9 w-9 overflow-hidden rounded-xl">
            <Image
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

function StatsCard({ stat }: { stat: typeof statsCards[0] }) {
  return (
    <div className="rounded-xl bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", stat.color)}>
          <stat.icon className="h-5 w-5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium",
          stat.trend === "up" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
        )}>
          {stat.trend === "up" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {stat.change}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{stat.title}</p>
      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
    </div>
  )
}

function RecentOrdersTable() {
  return (
    <div className="rounded-xl bg-card shadow-soft">
      <div className="flex items-center justify-between border-b border-border/50 p-5">
        <h2 className="text-lg font-semibold text-foreground">Pedidos recientes</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 text-left">
              <th className="px-5 py-4 text-xs font-medium text-muted-foreground">ID Pedido</th>
              <th className="px-5 py-4 text-xs font-medium text-muted-foreground">Cliente</th>
              <th className="px-5 py-4 text-xs font-medium text-muted-foreground">Productos</th>
              <th className="px-5 py-4 text-xs font-medium text-muted-foreground">Total</th>
              <th className="px-5 py-4 text-xs font-medium text-muted-foreground">Estado</th>
              <th className="px-5 py-4 text-xs font-medium text-muted-foreground">Fecha</th>
              <th className="px-5 py-4 text-xs font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-border/30 last:border-0">
                <td className="px-5 py-4 text-sm font-medium text-foreground">{order.id}</td>
                <td className="px-5 py-4 text-sm text-foreground">{order.customer}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{order.products} items</td>
                <td className="px-5 py-4 text-sm font-medium text-foreground">{formatPrice(order.total)}</td>
                <td className="px-5 py-4">
                  <span className={cn(
                    "inline-flex rounded-lg px-2.5 py-1 text-xs font-medium",
                    statusStyles[order.status as keyof typeof statusStyles].className
                  )}>
                    {statusStyles[order.status as keyof typeof statusStyles].label}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{order.date}</td>
                <td className="px-5 py-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center border-t border-border/50 p-4">
        <Button variant="ghost" className="rounded-xl text-primary hover:bg-primary/10">
          Ver todos los pedidos
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function LowStockAlert() {
  return (
    <div className="rounded-xl bg-card shadow-soft">
      <div className="flex items-center justify-between border-b border-border/50 p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-foreground">Stock bajo</h2>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reabastecer
        </Button>
      </div>

      <div className="divide-y divide-border/30">
        {lowStockProducts.map((product) => (
          <div key={product.id} className="flex items-center gap-4 p-5">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-secondary/30">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground truncate">{product.name}</h3>
              <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-amber-500">{product.stock}</p>
              <p className="text-xs text-muted-foreground">de {product.minStock}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AIPredictionsPanel() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between border-b border-border/50 p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Predicciones IA</h2>
        </div>
        <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
          XGBoost
        </span>
      </div>

      <div className="divide-y divide-border/30">
        {aiPredictions.map((prediction) => (
          <div key={prediction.id} className="p-5">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{prediction.title}</span>
              </div>
              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {prediction.confidence}% confianza
              </span>
            </div>
            <p className="mb-3 text-sm text-muted-foreground">{prediction.description}</p>
            <Button size="sm" variant="outline" className="rounded-lg">
              {prediction.action}
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SellerDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      
      <main className="pt-16 lg:pl-64">
        <div className="p-4 lg:p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Bienvenido de vuelta, TechStore TJ</p>
          </div>

          {/* Stats Grid */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((stat) => (
              <StatsCard key={stat.title} stat={stat} />
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Orders Table - 2 columns */}
            <div className="lg:col-span-2">
              <RecentOrdersTable />
            </div>

            {/* Side Panels - 1 column */}
            <div className="space-y-6">
              <LowStockAlert />
              <AIPredictionsPanel />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

