"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  Sparkles,
  Search,
  Trash2,
  ShoppingCart,
  User,
  Link2,
  Check,
  Loader,
  Package,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSession } from "@/components/SessionProvider"
import {
  getSharedListByToken,
  addProductToSharedList,
  removeProductFromSharedList,
  searchProducts,
  addToCart,
} from "@/lib/supabase-queries"

type ListItem = {
  item_id: string
  product_id: string
  name: string
  image_url: string
  price: number
  stock: number
}

type SharedList = {
  id: string
  name: string
  is_shared: boolean
  share_token: string
  user_id: string
  creator_name: string
  items: ListItem[]
}

type Suggestion = {
  id: string
  name: string
  image_url: string
  price: number
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(price)
}

export default function SharedListPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const { user } = useSession()

  const [list, setList] = useState<SharedList | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // UI state
  const [addingId, setAddingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [buyingAll, setBuyingAll] = useState(false)

  const isCreator = !!user && list?.user_id === user.id

  const total = list?.items.reduce((sum, item) => sum + item.price, 0) ?? 0

  // Ghost text from suggestions
  const ghostCompletion = useMemo(() => {
    const q = searchQuery.trim()
    if (!q || suggestions.length === 0) return ""
    const lower = q.toLowerCase()
    const match = suggestions.find((s) => s.name.toLowerCase().startsWith(lower))
    if (!match || match.name.toLowerCase() === lower) return ""
    return match.name.slice(searchQuery.length)
  }, [searchQuery, suggestions])

  useEffect(() => {
    const load = async () => {
      const { data } = await getSharedListByToken(token)
      if (!data) {
        setNotFound(true)
      } else {
        setList(data)
      }
      setIsLoading(false)
    }
    void load()
  }, [token])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleQueryChange = (value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      const { data } = await searchProducts(value.trim())
      setSuggestions(data.slice(0, 6) as Suggestion[])
      setShowSuggestions(data.length > 0)
    }, 280)
  }

  const acceptGhost = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      ghostCompletion &&
      (e.key === "Tab" ||
        (e.key === "ArrowRight" && e.currentTarget.selectionStart === searchQuery.length))
    ) {
      e.preventDefault()
      setSearchQuery(searchQuery + ghostCompletion)
      setShowSuggestions(false)
    }
    if (e.key === "Escape") setShowSuggestions(false)
  }

  const handleAddProduct = async (suggestion: Suggestion) => {
    if (!list) return
    // Check already in list
    if (list.items.some((i) => i.product_id === suggestion.id)) {
      setSearchQuery("")
      setShowSuggestions(false)
      return
    }
    setAddingId(suggestion.id)
    const { error } = await addProductToSharedList(list.id, suggestion.id)
    if (!error) {
      setList((prev) =>
        prev
          ? {
              ...prev,
              items: [
                ...prev.items,
                {
                  item_id: `${list.id}-${suggestion.id}`,
                  product_id: suggestion.id,
                  name: suggestion.name,
                  image_url: suggestion.image_url,
                  price: suggestion.price,
                  stock: 0,
                },
              ],
            }
          : prev
      )
    }
    setAddingId(null)
    setSearchQuery("")
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleRemove = async (item: ListItem) => {
    if (!list) return
    setRemovingId(item.product_id)
    const { error } = await removeProductFromSharedList(list.id, item.product_id)
    if (!error) {
      setList((prev) =>
        prev
          ? { ...prev, items: prev.items.filter((i) => i.product_id !== item.product_id) }
          : prev
      )
    }
    setRemovingId(null)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://crafter-professed-cannon.ngrok-free.dev/lista/${token}`)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleBuyAll = async () => {
    if (!user || !list || list.items.length === 0) return
    setBuyingAll(true)
    await Promise.all(list.items.map((item) => addToCart(user.id, item.product_id, 1)))
    window.dispatchEvent(new Event("cart-updated"))
    setBuyingAll(false)
    router.push("/carrito")
  }

  // ── Loading / Not found ────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (notFound || !list) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4 px-4 text-center">
        <Package className="h-14 w-14 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Lista no encontrada</h1>
        <p className="max-w-sm text-muted-foreground">
          Este enlace no es válido o la lista ya no está disponible.
        </p>
        <Link href="/productos">
          <Button className="rounded-xl bg-primary hover:bg-primary/90">
            Explorar productos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  // ── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-card/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">techHub</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg cursor-pointer gap-1.5"
              onClick={handleCopyLink}
            >
              {linkCopied ? (
                <><Check className="h-4 w-4 text-primary" /><span className="text-xs">Copiado</span></>
              ) : (
                <><Link2 className="h-4 w-4" /><span className="text-xs hidden sm:inline">Copiar enlace</span></>
              )}
            </Button>
            {!user && (
              <Link href="/iniciar-sesion">
                <Button size="sm" variant="outline" className="rounded-lg cursor-pointer">
                  <User className="mr-1.5 h-4 w-4" />
                  Iniciar sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* List header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{list.name}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            Lista de <span className="font-medium text-foreground">{list.creator_name}</span>
          </p>
        </div>

        {/* Search to add products */}
        <div className="mb-8">
          <p className="mb-2.5 text-sm font-medium text-foreground">Agregar producto a la lista</p>
          <div ref={searchContainerRef} className="relative">
            <div className="relative w-full rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-primary/30">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              {ghostCompletion && (
                <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center overflow-hidden pl-10 pr-4">
                  <span className="whitespace-pre text-transparent">{searchQuery}</span>
                  <span className="whitespace-pre text-muted-foreground/50">{ghostCompletion}</span>
                </div>
              )}
              <input
                type="text"
                placeholder="Buscar y agregar productos..."
                value={searchQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
                onKeyDown={acceptGhost}
                className="relative w-full bg-transparent py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
                {suggestions.map((s) => {
                  const alreadyAdded = list.items.some((i) => i.product_id === s.id)
                  return (
                    <button
                      key={s.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleAddProduct(s)}
                      disabled={alreadyAdded || addingId === s.id}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer",
                        alreadyAdded ? "opacity-50 cursor-not-allowed" : "hover:bg-secondary"
                      )}
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        <Image src={s.image_url} alt={s.name} width={40} height={40} unoptimized className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
                        <p className="text-xs text-primary">{formatPrice(s.price)}</p>
                      </div>
                      {alreadyAdded ? (
                        <span className="shrink-0 text-xs text-muted-foreground">Ya en lista</span>
                      ) : addingId === s.id ? (
                        <Loader className="h-4 w-4 shrink-0 animate-spin text-primary" />
                      ) : (
                        <span className="shrink-0 rounded-full bg-primary/10 p-1 text-primary">
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Products */}
        {list.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-14 text-center">
            <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
            <p className="font-medium text-foreground">Lista vacía</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Usa el buscador de arriba para agregar productos.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.items.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-secondary/30">
                  <Image src={item.image_url} alt={item.name} fill unoptimized className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/producto/${item.product_id}`} className="group">
                    <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </p>
                  </Link>
                  <p className="mt-0.5 text-base font-bold text-primary">{formatPrice(item.price)}</p>
                </div>
                {isCreator && (
                  <button
                    onClick={() => handleRemove(item)}
                    disabled={removingId === item.product_id}
                    className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                  >
                    {removingId === item.product_id ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Total + Checkout */}
        {list.items.length > 0 && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{list.items.length} producto{list.items.length !== 1 ? "s" : ""}</span>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total estimado</p>
                <p className="text-2xl font-bold text-foreground">{formatPrice(total)}</p>
              </div>
            </div>

            {isCreator ? (
              <Button
                className="w-full rounded-xl bg-primary py-6 text-base hover:bg-primary/90 cursor-pointer"
                onClick={handleBuyAll}
                disabled={buyingAll}
              >
                {buyingAll ? (
                  <><Loader className="mr-2 h-5 w-5 animate-spin" />Agregando al carrito...</>
                ) : (
                  <><ShoppingCart className="mr-2 h-5 w-5" />Comprar lista</>
                )}
              </Button>
            ) : (
              <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3 text-center text-sm text-muted-foreground">
                Solo el creador de la lista puede comprarla.{" "}
                {!user && (
                  <Link href="/iniciar-sesion" className="font-medium text-primary hover:underline">
                    Inicia sesión
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
