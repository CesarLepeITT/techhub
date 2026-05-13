"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { 
  Sparkles, 
  Send, 
  ArrowRight,
  ShoppingCart,
  Star,
  Package,
  Zap,
  GraduationCap,
  Puzzle,
  BadgeCheck,
  Plus,
  Check,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { cn } from "@/lib/utils"

const suggestedPrompts = [
  {
    icon: Puzzle,
    text: "Necesito armar un robot seguidor de línea para la escuela",
  },
  {
    icon: Zap,
    text: "Quiero automatizar el riego de mi jardín con IoT",
  },
  {
    icon: GraduationCap,
    text: "Busco un kit para aprender electrónica básica",
  },
  {
    icon: Package,
    text: "Necesito componentes para una estación meteorológica",
  },
]

interface RecommendedProduct {
  id: string
  name: string
  image: string
  price: number
  wholesalePrice?: number
  rating: number
  badge?: string
  explanation: string
}

interface BundleRecommendation {
  id: string
  name: string
  products: RecommendedProduct[]
  totalPrice: number
  savings: number
}

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  products?: RecommendedProduct[]
  bundle?: BundleRecommendation
  timestamp: Date
}

const mockProducts: RecommendedProduct[] = [
  {
    id: "1",
    name: "Arduino Nano V3.0 ATmega328P",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&fit=crop",
    price: 149,
    wholesalePrice: 119,
    rating: 4.8,
    badge: "Recomendado",
    explanation: "Coincide con tu intención",
  },
  {
    id: "2",
    name: "Sensor Ultrasónico HC-SR04",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=300&fit=crop",
    price: 89,
    wholesalePrice: 69,
    rating: 4.6,
    explanation: "Compatible con Arduino",
  },
  {
    id: "3",
    name: "Módulo Driver L298N",
    image: "https://images.unsplash.com/photo-1601132359864-c974e79890ac?w=300&h=300&fit=crop",
    price: 129,
    rating: 4.7,
    explanation: "Ideal para motores DC",
  },
  {
    id: "4",
    name: "Motor DC 6V con Rueda",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=300&fit=crop",
    price: 59,
    wholesalePrice: 49,
    rating: 4.5,
    badge: "Mayoreo",
    explanation: "Precio mayoreo disponible",
  },
]

const mockBundle: BundleRecommendation = {
  id: "bundle-1",
  name: "Kit Robot Seguidor de Línea Completo",
  products: mockProducts,
  totalPrice: 389,
  savings: 37,
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(price)
}

function ProductRecommendationCard({ product }: { product: RecommendedProduct }) {
  const [isAdded, setIsAdded] = useState(false)

  return (
    <div className="group flex gap-4 rounded-lg bg-card/80 p-4 shadow-soft transition-lift">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary/30">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
        {product.badge && (
          <div className="absolute -right-1 -top-1 rounded-lg bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
            {product.badge}
          </div>
        )}
      </div>
      
      <div className="flex flex-1 flex-col">
        <h4 className="mb-1 text-sm font-semibold leading-tight text-foreground line-clamp-2">
          {product.name}
        </h4>
        
        <div className="mb-2 flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-muted-foreground">{product.rating}</span>
          </div>
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            {product.explanation}
          </span>
        </div>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-foreground">{formatPrice(product.price)}</span>
            {product.wholesalePrice && (
              <span className="text-xs text-primary">{formatPrice(product.wholesalePrice)}</span>
            )}
          </div>
          <Button
            size="sm"
            className={cn(
              "h-8 rounded-lg px-3 transition-all",
              isAdded
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onClick={() => setIsAdded(!isAdded)}
          >
            {isAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

function BundleCard({ bundle }: { bundle: BundleRecommendation }) {
  const [isAdded, setIsAdded] = useState(false)

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5 shadow-soft">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Kit recomendado</span>
          </div>
          <h3 className="text-lg font-bold text-foreground">{bundle.name}</h3>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-foreground">{formatPrice(bundle.totalPrice)}</div>
          <div className="text-sm font-medium text-primary">Ahorras {formatPrice(bundle.savings)}</div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {bundle.products.map((product) => (
          <div key={product.id} className="flex items-center gap-2 rounded-xl bg-card/80 px-3 py-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-secondary/30">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            </div>
            <span className="text-xs font-medium text-foreground line-clamp-1 max-w-[120px]">
              {product.name}
            </span>
          </div>
        ))}
      </div>

      <Button
        className={cn(
          "w-full rounded-xl transition-all",
          isAdded
            ? "bg-primary/10 text-primary hover:bg-primary/20"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
        onClick={() => setIsAdded(!isAdded)}
      >
        {isAdded ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Kit agregado al carrito
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Agregar kit completo al carrito
          </>
        )}
      </Button>
    </div>
  )
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
      <div className="flex-1 space-y-4">
        <div className="max-w-[90%] rounded-xl rounded-tl-lg bg-card px-5 py-3 shadow-soft">
          <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
        </div>
        
        {message.products && message.products.length > 0 && (
          <div className="space-y-3">
            {message.products.map((product) => (
              <ProductRecommendationCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        {message.bundle && <BundleCard bundle={message.bundle} />}
      </div>
    </div>
  )
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (prompt: string) => {
    if (!prompt.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: prompt,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Entiendo que quieres armar un robot seguidor de línea. He analizado tu proyecto y te recomiendo los siguientes componentes que son compatibles entre sí y tienen excelentes reseñas de la comunidad maker:",
        products: mockProducts,
        bundle: mockBundle,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handlePromptClick = (prompt: string) => {
    handleSubmit(prompt)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex flex-1 flex-col pb-8 pt-20 md:pt-24">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 sm:px-6">
          {messages.length === 0 ? (
            /* Empty State - Welcome Screen */
            <div className="flex flex-1 flex-col items-center justify-center py-12">
              {/* Logo and Title */}
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 shadow-soft">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
                  Asistente de compras IA
                </h1>
                <p className="max-w-md text-muted-foreground">
                  Describe tu proyecto y te recomendaré los mejores componentes, kits compatibles y alternativas económicas.
                </p>
              </div>

              {/* Main Input */}
              <div className="mb-8 w-full max-w-2xl">
                <div className="glass-strong rounded-xl p-1.5 shadow-elevated">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSubmit(inputValue)
                    }}
                    className="flex items-center gap-3 rounded-lg bg-card/80 px-4 py-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <input
                      type="text"
                      placeholder="Describe lo que quieres construir..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <Button 
                      type="submit"
                      className="rounded-xl bg-primary px-5 hover:bg-primary/90"
                      disabled={!inputValue.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>

              {/* Suggested Prompts */}
              <div className="w-full max-w-2xl">
                <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
                  Prueba con estos ejemplos
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      className="group flex items-center gap-3 rounded-lg bg-card p-4 text-left shadow-soft transition-lift"
                      onClick={() => handlePromptClick(prompt.text)}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <prompt.icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm text-foreground">{prompt.text}</span>
                      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <div className="flex flex-1 flex-col">
              {/* Messages */}
              <div className="flex-1 space-y-6 py-6">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary animate-pulse-soft" />
                    </div>
                    <div className="max-w-[90%] rounded-xl rounded-tl-lg bg-card px-5 py-3 shadow-soft">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Analizando tu proyecto...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pb-6 pt-4">
                <div className="glass-strong rounded-xl p-1.5 shadow-elevated">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSubmit(inputValue)
                    }}
                    className="flex items-center gap-3 rounded-lg bg-card/80 px-4 py-3"
                  >
                    <input
                      type="text"
                      placeholder="Escribe un mensaje..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <Button 
                      type="submit"
                      size="icon"
                      className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90"
                      disabled={!inputValue.trim() || isTyping}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
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
