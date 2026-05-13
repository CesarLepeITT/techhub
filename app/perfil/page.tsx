"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Settings,
  LogOut,
  Edit2,
  ShoppingBag,
  Star,
  Package,
  Clock,
  Check,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Order {
  id: string
  number: string
  date: string
  total: number
  status: "pending" | "processing" | "shipped" | "delivered"
  items: number
  image: string
}

type TabType = "overview" | "orders" | "settings"

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    nombre: "Carlos Mendoza",
    email: "carlos@example.com",
    telefono: "+52 664 123 4567",
    ubicacion: "Tijuana, Baja California",
  })
  const [editData, setEditData] = useState(userData)

  const orders: Order[] = [
    {
      id: "1",
      number: "ORD-2024-001",
      date: "2024-12-01",
      total: 2499.99,
      status: "delivered",
      items: 2,
      image: "https://images.unsplash.com/photo-1588872657840-790ff3bde08f?w=80&h=80&fit=crop",
    },
    {
      id: "2",
      number: "ORD-2024-002",
      date: "2024-11-28",
      total: 1899.99,
      status: "shipped",
      items: 1,
      image: "https://images.unsplash.com/photo-1603468620905-8fe5e0e8b640?w=80&h=80&fit=crop",
    },
    {
      id: "3",
      number: "ORD-2024-003",
      date: "2024-11-15",
      total: 599.99,
      status: "processing",
      items: 3,
      image: "https://images.unsplash.com/photo-1599298881974-bc20f26ae475?w=80&h=80&fit=crop",
    },
  ]

  const handleSaveChanges = () => {
    setUserData(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(userData)
    setIsEditing(false)
  }

  const getStatusLabel = (status: Order["status"]) => {
    const labels = {
      pending: "Pendiente",
      processing: "Procesando",
      shipped: "Enviado",
      delivered: "Entregado",
    }
    return labels[status]
  }

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
    }
    return colors[status]
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return <Check className="h-4 w-4" />
      case "shipped":
        return <Package className="h-4 w-4" />
      case "processing":
        return <Clock className="h-4 w-4" />
      default:
        return <ShoppingBag className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="navbar-solid shadow-soft">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">TechMarket</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="rounded-lg cursor-pointer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* Profile Header */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{userData.nombre}</h1>
                <p className="text-sm text-muted-foreground">Cliente desde 2024</p>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="ghost"
              className="rounded-lg cursor-pointer"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-4 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "overview"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Información
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-4 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "orders"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Órdenes
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`pb-4 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "settings"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Configuración
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Personal Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Información personal</h2>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={editData.nombre}
                        onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={editData.telefono}
                        onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        value={editData.ubicacion}
                        onChange={(e) => setEditData({ ...editData, ubicacion: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={handleSaveChanges}
                        className="flex-1 rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
                      >
                        Guardar cambios
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="flex-1 rounded-lg cursor-pointer"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Nombre</p>
                        <p className="text-foreground font-medium">{userData.nombre}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Correo</p>
                        <p className="text-foreground font-medium">{userData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Teléfono</p>
                        <p className="text-foreground font-medium">{userData.telefono}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Ubicación</p>
                        <p className="text-foreground font-medium">{userData.ubicacion}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <ShoppingBag className="mb-3 h-6 w-6 text-primary" />
                <p className="text-sm text-muted-foreground">Órdenes totales</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <Star className="mb-3 h-6 w-6 text-primary" />
                <p className="text-sm text-muted-foreground">Calificación</p>
                <p className="text-2xl font-bold text-foreground">4.8/5</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <Package className="mb-3 h-6 w-6 text-primary" />
                <p className="text-sm text-muted-foreground">En proceso</p>
                <p className="text-2xl font-bold text-foreground">1</p>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-border bg-card p-6 shadow-soft hover:shadow-elevated transition-shadow">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    <img
                      src={order.image}
                      alt="Product"
                      className="h-20 w-20 rounded-lg object-cover bg-secondary"
                    />
                    <div>
                      <p className="text-sm text-muted-foreground">Pedido #{order.number}</p>
                      <p className="font-semibold text-foreground">${order.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{order.items} artículo(s) • {order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </div>
                    <Link href={`/confirmacion-orden/${order.id}`}>
                      <Button variant="ghost" className="rounded-lg cursor-pointer">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Cambiar contraseña</h3>
                  <p className="text-sm text-muted-foreground">Actualiza tu contraseña regularmente</p>
                </div>
                <Button variant="outline" className="rounded-lg cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Cambiar
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Notificaciones</h3>
                  <p className="text-sm text-muted-foreground">Gestiona tus preferencias de notificaciones</p>
                </div>
                <Button variant="outline" className="rounded-lg cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Dirección de envío</h3>
                  <p className="text-sm text-muted-foreground">Administra tus direcciones de envío</p>
                </div>
                <Button variant="outline" className="rounded-lg cursor-pointer">
                  <MapPin className="h-4 w-4 mr-2" />
                  Gestionar
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Cerrar sesión</h3>
                  <p className="text-sm text-muted-foreground">Salir de tu cuenta en este dispositivo</p>
                </div>
                <Button variant="destructive" className="rounded-lg cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Salir
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
