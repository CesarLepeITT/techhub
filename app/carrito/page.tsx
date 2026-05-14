"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  AlertCircle,
  Loader,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { getCart, removeFromCart, updateCartQuantity, clearCart } from "@/lib/supabase-queries"
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
    stock: number
  } | null
}

export default function CarritoPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useSession()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!authLoading && user) {
      loadCart()
    }
  }, [user, authLoading])

  const loadCart = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const res = await getCart(user.id)
      if (res.error) throw res.error
      setCartItems(res.data || [])
    } catch (err) {
      setError("Error al cargar el carrito")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    try {
      const res = await updateCartQuantity(cartItemId, newQuantity)
      if (res.error) throw res.error
      setCartItems(
        cartItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      )
      window.dispatchEvent(new Event("cart-updated"))
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      const res = await removeFromCart(cartItemId)
      if (res.error) throw res.error
      setCartItems(cartItems.filter((item) => item.id !== cartItemId))
      window.dispatchEvent(new Event("cart-updated"))
    } catch (err) {
      console.error(err)
    }
  }

  const handleClearCart = async () => {
    if (!user || !confirm("¿Estás seguro?")) return
    try {
      const res = await clearCart(user.id)
      if (res.error) throw res.error
      setCartItems([])
      window.dispatchEvent(new Event("cart-updated"))
    } catch (err) {
      console.error(err)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => {
    if (!item.products) return sum
    const isWholesale = item.quantity >= (item.products.minimum_wholesale_quantity || 10)
    const price = isWholesale && item.products.wholesale_price
      ? item.products.wholesale_price
      : item.products.price
    return sum + price * item.quantity
  }, 0)

  const shipping = subtotal > 0 ? 79 : 0
  const tax = subtotal * 0.05
  const total = subtotal + shipping + tax

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">No autorizado</h1>
          <p className="text-muted-foreground mb-4">Por favor inicia sesión para ver tu carrito</p>
          <Link href="/iniciar-sesion">
            <Button>Ir a iniciar sesión</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground">Carrito de compras</h1>
          {cartItems.length === 0 ? (
            <div className="mt-8 rounded-xl border border-border bg-card p-12 text-center shadow-soft">
              <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Carrito vacío</h2>
              <Link href="/productos" className="mt-4 inline-block">
                <Button className="rounded-lg bg-primary hover:bg-primary/90 cursor-pointer">
                  Ver productos
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  if (!item.products) return null

                  const isWholesale = item.quantity >= (item.products.minimum_wholesale_quantity || 10)
                  const price = isWholesale && item.products.wholesale_price
                    ? item.products.wholesale_price
                    : item.products.price
                  const itemTotal = price * item.quantity

                  return (
                    <div key={item.id} className="rounded-xl border border-border bg-card p-4 shadow-soft">
                      <div className="flex gap-4">
                        <img loading="lazy" src={item.products.image_url} alt={item.products.name} className="h-24 w-24 rounded-lg object-cover bg-secondary" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{item.products.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">${price.toFixed(2)}</p>
                          <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-background w-fit p-1">
                            <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="rounded p-1 hover:bg-secondary cursor-pointer" disabled={item.quantity <= 1}>
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="rounded p-1 hover:bg-secondary cursor-pointer">
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <p className="text-lg font-bold text-primary">${itemTotal.toFixed(2)}</p>
                          <button onClick={() => handleRemoveItem(item.id)} className="rounded-lg p-2 text-destructive hover:bg-destructive/10 cursor-pointer">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="h-fit rounded-xl border border-border bg-card p-6 shadow-soft sticky top-4">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Resumen</h3>
                <div className="space-y-3 border-b border-border pb-4 mb-4">
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
                <div className="mb-6 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                </div>
                <Link href="/checkout" className="w-full block">
                  <Button className="w-full rounded-lg bg-primary hover:bg-primary/90 cursor-pointer">
                    Ir a pagar
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
