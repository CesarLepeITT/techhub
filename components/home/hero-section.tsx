"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Search, Sparkles, ArrowRight, Truck, TrendingUp, Package, Play, Send, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductRecommendationCard, type ChatProduct } from "@/components/asistente/product-recommendation-card"

const suggestions = [
  "Arduino Nano para proyecto IoT",
  "Componentes para robot seguidor de línea",
  "Kit de soldadura para principiantes",
  "Sensores para invernadero automatizado",
]

const features = [
  {
    icon: Package,
    title: "Mayoreo activo",
    description: "Precios especiales desde 10 piezas",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: TrendingUp,
    title: "Predicción IA",
    description: "Recomendaciones inteligentes",
    color: "bg-accent/30 text-accent-foreground",
  },
  {
    icon: Truck,
    title: "Entrega local",
    description: "Mismo día en Tijuana",
    color: "bg-secondary text-secondary-foreground",
  },
  {
    icon: Play,
    title: "TechReels",
    description: "Videos de productos",
    color: "bg-[#84bcbf]/20 text-foreground",
  },
]

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  products?: ChatProduct[]
  timestamp: Date
}

function MessageBubble({ message }: { message: Message }) {
  if (message.type === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-xl rounded-br-lg bg-primary px-5 py-3 text-primary-foreground">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="max-w-[90%] rounded-xl rounded-tl-lg bg-card px-5 py-3 shadow-soft">
          <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
        </div>
        {message.products && message.products.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {message.products.map((product) => (
              <ProductRecommendationCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function HeroSection() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSubmit = async (prompt: string) => {
    if (!prompt.trim() || isTyping) return
    setMessages((prev) => [...prev, { id: Date.now().toString(), type: "user", content: prompt, timestamp: new Date() }])
    setInputValue("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Error desconocido")

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: data.response,
          products: data.products,
          timestamp: new Date(),
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "No pude procesar tu solicitud ahora mismo. Cuéntame tu presupuesto, categoría y tipo de proyecto para ayudarte mejor.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <section className="relative overflow-hidden bg-secondary/30 md:min-h-[90vh]">
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Hero Title */}
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Tecnología, componentes y electrónica para{" "}
            <span className="text-primary">makers de Tijuana</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
            Compra hardware, kits, refacciones y accesorios tech con recomendaciones inteligentes.
          </p>

          {/* Chat or Search Box */}
          {messages.length === 0 ? (
            <div className="mx-auto mb-8 max-w-2xl">
              <div className="relative rounded-xl border border-border bg-card p-1.5 shadow-elevated">
                <div className="flex flex-col gap-3 rounded-lg bg-card px-4 py-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <input
                      type="text"
                      placeholder="Describe lo que necesitas construir..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleSubmit(inputValue)
                        }
                      }}
                      className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none cursor-text"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="rounded-xl bg-primary px-5 hover:bg-primary/90 cursor-pointer"
                    disabled={!inputValue.trim() || isTyping}
                    onClick={() => handleSubmit(inputValue)}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Suggestions */}
                <div className="rounded-lg border-t border-border bg-card p-4">
                  <p className="mb-3 text-center text-xs font-medium text-muted-foreground">Prueba con estos ejemplos</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="group flex items-center gap-3 rounded-lg bg-secondary p-3 text-left text-sm text-foreground transition-colors hover:bg-primary/10 cursor-pointer"
                        onClick={() => handleSubmit(suggestion)}
                      >
                        <span className="line-clamp-2">{suggestion}</span>
                        <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-border bg-card shadow-elevated overflow-hidden flex flex-col h-96">
              {/* Chat Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    </div>
                    <div className="max-w-[90%] rounded-xl rounded-tl-lg bg-card px-5 py-3 shadow-soft">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Buscando productos...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="sticky bottom-0 border-t border-border bg-card px-4 py-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmit(inputValue)
                  }}
                  className="flex items-center gap-3"
                >
                  <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none cursor-text"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 cursor-pointer"
                    disabled={!inputValue.trim() || isTyping}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/productos">
              <Button
                size="lg"
                className="w-full rounded-xl bg-primary px-8 py-6 text-base font-medium hover:bg-primary/90 sm:w-auto cursor-pointer"
              >
                Explorar productos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/asistente">
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-xl border-2 border-primary/20 bg-card px-8 py-6 text-base font-medium hover:bg-primary/10 sm:w-auto cursor-pointer"
              >
                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                Chat completo
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-5 shadow-soft transition-lift cursor-pointer"
              >
                <div
                  className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg ${feature.color}`}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
