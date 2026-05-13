"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Package,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Calendar,
  Truck,
  Download,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface OrderItem {
  id: number
  name: string
  quantity: number
  price: number
  image: string
}

export default function ConfirmacionOrdenPage() {
  const [orderData] = useState({
    orderNumber: "ORD-2024-001",
    date: "1 de Diciembre de 2024",
    total: 2499.99,
    subtotal: 2299.99,
    shipping: 79.00,
    tax: 121.00,
    estimatedDelivery: "6 de Diciembre de 2024",
    status: "shipped",
    trackingNumber: "TRK123456789",
  })

  const [items] = useState<OrderItem[]>([
    {
      id: 1,
      name: "Laptop Gaming ASUS ROG",
      quantity: 1,
      price: 2299.99,
      image: "https://images.unsplash.com/photo-1588872657840-790ff3bde08f?w=150&h=150&fit=crop",
    },
  ])

  const [shippingInfo] = useState({
    name: "Carlos Mendoza",
    address: "Calle Principal 123, Apt 4B",
    city: "Tijuana",
    state: "Baja California",
    postalCode: "22000",
    phone: "+52 664 123 4567",
    email: "carlos@example.com",
  })

  const [paymentInfo] = useState({
    method: "Tarjeta de Crédito",
    last4: "4242",
    type: "Visa",
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-600 bg-green-50"
      case "shipped":
        return "text-blue-600 bg-blue-50"
      case "processing":
        return "text-yellow-600 bg-yellow-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      delivered: "Entregado",
      shipped: "En tránsito",
      processing: "Procesando",
    }
    return labels[status] || status
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
            <Link href="/perfil">
              <Button variant="ghost" className="rounded-lg cursor-pointer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a órdenes
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Success Header */}
        <div className="mb-8 rounded-xl border border-border bg-card p-8 text-center shadow-soft">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">¡Pedido confirmado!</h1>
          <p className="text-muted-foreground">
            Tu orden ha sido procesada exitosamente. Aquí está el resumen de tu compra.
          </p>
        </div>

        {/* Order Number and Status */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <p className="text-sm text-muted-foreground mb-1">Número de orden</p>
            <p className="font-semibold text-lg text-foreground">{orderData.orderNumber}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <p className="text-sm text-muted-foreground mb-1">Fecha</p>
            <p className="font-semibold text-lg text-foreground">{orderData.date}</p>
          </div>
          <div className={`rounded-xl border border-border p-4 shadow-soft ${getStatusColor(orderData.status)}`}>
            <p className="text-sm font-medium mb-1">Estado</p>
            <p className="font-semibold text-lg">{getStatusLabel(orderData.status)}</p>
          </div>
        </div>

        {/* Tracking */}
        {orderData.status === "shipped" && (
          <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Seguimiento de envío</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Número de seguimiento</p>
                <p className="font-mono text-foreground">{orderData.trackingNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Entrega estimada</p>
                <p className="font-semibold text-foreground">{orderData.estimatedDelivery}</p>
              </div>
            </div>
            <Button className="mt-4 w-full rounded-lg bg-primary hover:bg-primary/90 cursor-pointer">
              Rastrear paquete
            </Button>
          </div>
        )}

        {/* Order Items */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Artículos pedidos</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-border pb-4 last:border-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 rounded-lg object-cover bg-secondary"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">${item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Resumen de pago</h2>
          <div className="space-y-3 border-b border-border pb-4 mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">${orderData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span className="font-medium text-foreground">${orderData.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Impuestos</span>
              <span className="font-medium text-foreground">${orderData.tax.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-lg font-semibold text-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">${orderData.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          {/* Shipping Address */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Dirección de envío</h2>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{shippingInfo.name}</p>
              <p>{shippingInfo.address}</p>
              <p>{shippingInfo.city}, {shippingInfo.state}</p>
              <p>{shippingInfo.postalCode}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Método de pago</h2>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">{paymentInfo.method}</p>
              <p className="font-medium text-foreground">{paymentInfo.type} ••••{paymentInfo.last4}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Información de contacto</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Correo electrónico</p>
                <p className="text-foreground">{shippingInfo.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="text-foreground">{shippingInfo.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1 rounded-lg bg-primary hover:bg-primary/90 cursor-pointer">
            <Download className="mr-2 h-4 w-4" />
            Descargar recibo
          </Button>
          <Button variant="outline" className="flex-1 rounded-lg cursor-pointer">
            <MessageCircle className="mr-2 h-4 w-4" />
            Contactar soporte
          </Button>
          <Link href="/productos" className="flex-1">
            <Button variant="outline" className="w-full rounded-lg cursor-pointer">
              Seguir comprando
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
