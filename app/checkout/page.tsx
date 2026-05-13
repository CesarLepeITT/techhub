"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Check,
  Truck,
  CreditCard,
  Lock,
  MapPin,
  User,
  Mail,
  Phone,
  Package,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { cn } from "@/lib/utils"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

const cartItems: CartItem[] = [
  {
    id: "1",
    name: "Arduino Nano V3.0 ATmega328P",
    price: 149,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    name: "Sensor Ultrasónico HC-SR04",
    price: 89,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=100&h=100&fit=crop",
  },
]

const steps = [
  { number: 1, name: "Envío", icon: Truck, active: true, completed: false },
  { number: 2, name: "Pago", icon: CreditCard, active: false, completed: false },
  { number: 3, name: "Confirmación", icon: Check, active: false, completed: false },
]

const shippingOptions = [
  { id: "standard", name: "Estándar", price: 79, days: "5-7 días" },
  { id: "express", name: "Express", price: 149, days: "2-3 días" },
  { id: "local", name: "Entrega local", price: 0, days: "1-2 días" },
]

const paymentMethods = [
  { id: "transfer", name: "Transferencia bancaria", description: "Transferencia al banco" },
  { id: "cash", name: "Pago contra entrega", description: "Paga al recibir" },
  { id: "card", name: "Tarjeta de crédito/débito", description: "Visa, Mastercard, Amex" },
]

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(price)
}

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [selectedShipping, setSelectedShipping] = useState("local")
  const [selectedPayment, setSelectedPayment] = useState("cash")
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = shippingOptions.find(s => s.id === selectedShipping)?.price || 0
  const total = subtotal + shippingCost

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-12 pt-20 md:pt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center justify-between">
            <Link href="/carrito" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Volver al carrito
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.number as any)}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full font-semibold transition-all",
                    currentStep >= step.number
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {currentStep > step.number ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    step.number
                  )}
                </button>
                <div className="ml-3">
                  <p className="text-sm font-medium text-foreground">{step.name}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-4 h-1 flex-1 max-w-xs rounded-full transition-colors",
                      currentStep > step.number ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Form Section */}
            <div className="lg:col-span-2">
              {/* Step 1: Shipping */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="mb-4 text-xl font-semibold text-foreground">Información de envío</h2>

                    <form className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-foreground">
                            Nombre completo
                          </label>
                          <input
                            id="nombre"
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                            placeholder="Tu nombre"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                            Correo electrónico
                          </label>
                          <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                            placeholder="correo@ejemplo.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="telefono" className="mb-2 block text-sm font-medium text-foreground">
                          Teléfono
                        </label>
                        <input
                          id="telefono"
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                          placeholder="+52 664 123 4567"
                        />
                      </div>

                      <div>
                        <label htmlFor="direccion" className="mb-2 block text-sm font-medium text-foreground">
                          Dirección
                        </label>
                        <input
                          id="direccion"
                          type="text"
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                          placeholder="Calle Principal 123"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label htmlFor="ciudad" className="mb-2 block text-sm font-medium text-foreground">
                            Ciudad
                          </label>
                          <input
                            id="ciudad"
                            type="text"
                            name="ciudad"
                            value={formData.ciudad}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                            placeholder="Tijuana"
                          />
                        </div>
                        <div>
                          <label htmlFor="estado" className="mb-2 block text-sm font-medium text-foreground">
                            Estado
                          </label>
                          <input
                            id="estado"
                            type="text"
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                            placeholder="BC"
                          />
                        </div>
                        <div>
                          <label htmlFor="codigoPostal" className="mb-2 block text-sm font-medium text-foreground">
                            Código postal
                          </label>
                          <input
                            id="codigoPostal"
                            type="text"
                            name="codigoPostal"
                            value={formData.codigoPostal}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                            placeholder="22000"
                          />
                        </div>
                      </div>
                    </form>
                  </div>

                  <div>
                    <h2 className="mb-4 text-xl font-semibold text-foreground">Método de envío</h2>
                    <div className="space-y-3">
                      {shippingOptions.map((option) => (
                        <label
                          key={option.id}
                          className={cn(
                            "flex items-start gap-3 rounded-lg border-2 p-4 transition-colors cursor-pointer",
                            selectedShipping === option.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          )}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value={option.id}
                            checked={selectedShipping === option.id}
                            onChange={() => setSelectedShipping(option.id)}
                            className="sr-only"
                          />
                          <div className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            selectedShipping === option.id
                              ? "border-primary bg-primary"
                              : "border-border"
                          )}>
                            {selectedShipping === option.id && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{option.name}</p>
                            <p className="text-sm text-muted-foreground">{option.days}</p>
                          </div>
                          <span className="font-semibold text-foreground">
                            {option.price === 0 ? "Gratis" : formatPrice(option.price)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full rounded-lg bg-primary py-6 hover:bg-primary/90 cursor-pointer"
                    onClick={() => setCurrentStep(2)}
                  >
                    Continuar al pago
                  </Button>
                </div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-foreground">Selecciona tu método de pago</h2>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={cn(
                          "flex items-center gap-4 rounded-lg border-2 p-4 transition-colors cursor-pointer",
                          selectedPayment === method.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={selectedPayment === method.id}
                          onChange={() => setSelectedPayment(method.id)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          selectedPayment === method.id
                            ? "border-primary bg-primary"
                            : "border-border"
                        )}>
                          {selectedPayment === method.id && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-lg cursor-pointer"
                      onClick={() => setCurrentStep(1)}
                    >
                      Atrás
                    </Button>
                    <Button
                      className="flex-1 rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
                      onClick={() => setCurrentStep(3)}
                    >
                      Confirmar orden
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <div className="text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-foreground">¡Orden confirmada!</h2>
                  <p className="mb-6 text-muted-foreground">
                    Tu pedido ha sido recibido. Recibirás una confirmación por correo electrónico.
                  </p>
                  <div className="rounded-lg border border-border bg-card p-6 text-left">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Número de orden</p>
                    <p className="text-2xl font-bold text-foreground mb-4">#ORD-2024-00123</p>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total</p>
                    <p className="text-2xl font-bold text-foreground">{formatPrice(total)}</p>
                  </div>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link href="/productos" className="flex-1">
                      <Button variant="outline" className="w-full rounded-lg cursor-pointer">
                        Seguir comprando
                      </Button>
                    </Link>
                    <Link href="/perfil" className="flex-1">
                      <Button className="w-full rounded-lg bg-primary hover:bg-primary/90 cursor-pointer">
                        Ver mis órdenes
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-soft">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Resumen del pedido</h3>

                <div className="mb-6 space-y-3 border-b border-border pb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={50}
                        height={50}
                        className="rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-b border-border pb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="font-medium text-foreground">
                      {shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between py-4">
                  <span className="text-lg font-semibold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
                </div>

                <div className="rounded-lg bg-primary/10 p-3 text-xs text-primary flex items-center gap-2">
                  <Lock className="h-4 w-4 shrink-0" />
                  Pago seguro con encriptación SSL
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
