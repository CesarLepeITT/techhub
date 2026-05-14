"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Truck,
  CreditCard,
  Lock,
  MapPin,
  User,
  Mail,
  Phone,
  AlertCircle,
  Loader,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getCart, createOrder, addOrderItems, clearCart } from "@/lib/supabase-queries"
import { useSession } from "@/components/SessionProvider"

type CartItem = {
  id: string
  product_id: string
  quantity: number
  products: {
    id: string
    seller_id: string
    name: string
    image_url: string
    price: number
    wholesale_price: number | null
    minimum_wholesale_quantity: number | null
  } | null
}

type Step = "shipping" | "payment" | "confirmation"

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useSession()
  const [currentStep, setCurrentStep] = useState<Step>("shipping")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [orderId, setOrderId] = useState("")

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    shippingMethod: "standard",
    paymentMethod: "transfer",
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/iniciar-sesion")
    } else if (user) {
      loadCart()
    }
  }, [user, authLoading])

  const loadCart = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const res = await getCart(user.id)
      if (res.error) throw res.error
      if (!res.data || res.data.length === 0) {
        router.push("/carrito")
        return
      }
      setCartItems(res.data)
    } catch (err) {
      setError("Error al cargar el carrito")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const shippingCosts = {
    standard: 79,
    express: 149,
    local: 0,
  }

  const subtotal = cartItems.reduce((sum, item) => {
    if (!item.products) return sum
    const isWholesale = item.quantity >= (item.products.minimum_wholesale_quantity || 10)
    const price = isWholesale && item.products.wholesale_price
      ? item.products.wholesale_price
      : item.products.price
    return sum + price * item.quantity
  }, 0)

  const shipping = shippingCosts[formData.shippingMethod as keyof typeof shippingCosts] || 0
  const tax = subtotal * 0.05
  const total = subtotal + shipping + tax

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsProcessing(true)
    setError("")

    try {
      const estimatedDelivery = new Date()
      if (formData.shippingMethod === "express") {
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 2)
      } else if (formData.shippingMethod === "standard") {
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 6)
      } else {
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 1)
      }

      const orderRes = await createOrder(user.id, {
        customer_name: formData.nombre,
        subtotal,
        shipping_cost: shipping,
        tax,
        total,
        shipping_method:
          formData.shippingMethod === "local" ? "pickup" : (formData.shippingMethod as "standard" | "express"),
        payment_method:
          formData.paymentMethod === "cash"
            ? "cash_on_delivery"
            : formData.paymentMethod === "credit"
              ? "card"
              : "transfer",
        shipping_address: formData.direccion,
        shipping_city: formData.ciudad,
        shipping_state: formData.estado,
        shipping_postal_code: formData.codigoPostal,
        customer_phone: formData.telefono,
        customer_email: formData.email,
        estimated_delivery: estimatedDelivery.toISOString().split("T")[0],
      })

      if (orderRes.error) throw orderRes.error
      if (!orderRes.data) throw new Error("No se creó la orden")

      const itemsToAdd = cartItems.flatMap((item) => {
        if (!item.products) return []

        const isWholesale = item.quantity >= (item.products.minimum_wholesale_quantity || 10)
        const price = isWholesale && item.products.wholesale_price
          ? item.products.wholesale_price
          : item.products.price
        return {
          product_id: item.product_id,
          seller_id: item.products.seller_id,
          product_name: item.products.name,
          quantity: item.quantity,
          unit_price: price,
          price_type: isWholesale ? "wholesale" : "retail",
          subtotal: price * item.quantity,
        }
      })

      const itemsRes = await addOrderItems(orderRes.data.id, itemsToAdd)
      if (itemsRes.error) throw itemsRes.error

      await clearCart(user.id)

      setOrderId(orderRes.data.id)
      setCurrentStep("confirmation")
    } catch (err) {
      setError("Error al procesar la orden")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-lg bg-destructive/10 p-4 flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {currentStep === "confirmation" ? (
            <div className="max-w-2xl mx-auto">
              <div className="rounded-xl border border-border bg-card p-8 text-center shadow-soft">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-foreground">¡Orden confirmada!</h1>
                <p className="mt-2 text-muted-foreground">Tu pedido ha sido procesado exitosamente</p>
                <Link href={`/confirmacion-orden/${orderId}`} className="mt-6 inline-block">
                  <Button className="rounded-lg bg-primary hover:bg-primary/90 cursor-pointer">
                    Ver detalles de orden
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Form */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
                </div>

                <form onSubmit={handleSubmitOrder} className="space-y-6">
                  {/* Shipping Info */}
                  {currentStep === "shipping" && (
                    <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                      <h2 className="mb-4 text-lg font-semibold text-foreground">Dirección de envío</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Nombre</label>
                          <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            placeholder="Tu nombre"
                            className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="tu@email.com"
                            className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Teléfono</label>
                          <input
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleInputChange}
                            placeholder="+52 664 123 4567"
                            className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Dirección</label>
                          <input
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleInputChange}
                            placeholder="Calle y número"
                            className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Ciudad</label>
                            <input
                              type="text"
                              name="ciudad"
                              value={formData.ciudad}
                              onChange={handleInputChange}
                              placeholder="Ciudad"
                              className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                              required
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Estado</label>
                            <input
                              type="text"
                              name="estado"
                              value={formData.estado}
                              onChange={handleInputChange}
                              placeholder="Estado"
                              className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Código postal</label>
                          <input
                            type="text"
                            name="codigoPostal"
                            value={formData.codigoPostal}
                            onChange={handleInputChange}
                            placeholder="22000"
                            className="w-full rounded-lg border border-border bg-background py-2.5 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                            required
                          />
                        </div>
                      </div>

                      <h3 className="mt-6 mb-4 font-semibold text-foreground">Método de envío</h3>
                      <div className="space-y-3">
                        {[
                          { value: "standard", label: "Estándar", cost: 79, days: "5-7" },
                          { value: "express", label: "Express", cost: 149, days: "2-3" },
                          { value: "local", label: "Local", cost: 0, days: "1-2" },
                        ].map((method) => (
                          <label key={method.value} className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-secondary transition-colors">
                            <input
                              type="radio"
                              name="shippingMethod"
                              value={method.value}
                              checked={formData.shippingMethod === method.value}
                              onChange={handleInputChange}
                              className="cursor-pointer"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{method.label}</p>
                              <p className="text-sm text-muted-foreground">{method.days} días</p>
                            </div>
                            <p className="font-semibold text-primary">${method.cost}</p>
                          </label>
                        ))}
                      </div>

                      <Button
                        type="button"
                        onClick={() => setCurrentStep("payment")}
                        className="mt-6 w-full rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
                      >
                        Continuar a pago
                      </Button>
                    </div>
                  )}

                  {/* Payment Info */}
                  {currentStep === "payment" && (
                    <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                      <h2 className="mb-4 text-lg font-semibold text-foreground">Método de pago</h2>
                      <div className="space-y-3 mb-6">
                        {[
                          { value: "transfer", label: "Transferencia bancaria" },
                          { value: "cash", label: "Pago en efectivo" },
                          { value: "credit", label: "Tarjeta de crédito" },
                        ].map((method) => (
                          <label key={method.value} className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-secondary transition-colors">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.value}
                              checked={formData.paymentMethod === method.value}
                              onChange={handleInputChange}
                              className="cursor-pointer"
                            />
                            <p className="font-medium text-foreground">{method.label}</p>
                          </label>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={() => setCurrentStep("shipping")}
                          variant="outline"
                          className="flex-1 rounded-lg cursor-pointer"
                        >
                          Atrás
                        </Button>
                        <Button
                          type="submit"
                          disabled={isProcessing}
                          className="flex-1 rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
                        >
                          {isProcessing ? "Procesando..." : "Confirmar orden"}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Summary */}
              <div className="h-fit rounded-xl border border-border bg-card p-6 shadow-soft sticky top-4">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Resumen de orden</h3>
                <div className="mb-4 space-y-3 border-b border-border pb-4">
                  {cartItems.map((item) => (
                    item.products ? (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.products.name} x{item.quantity}</span>
                        <span className="font-medium text-foreground">
                          ${(
                            item.quantity *
                            ((item.quantity >= (item.products.minimum_wholesale_quantity || 10) &&
                              item.products.wholesale_price) ||
                              item.products.price)
                          ).toFixed(2)}
                        </span>
                      </div>
                    ) : null
                  ))}
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impuestos</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
