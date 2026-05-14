"use client"

import { useState, useRef, useEffect } from "react"
import { Sparkles, Send, ArrowRight, Package, Zap, GraduationCap, Puzzle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductRecommendationCard, type ChatProduct } from "@/components/asistente/product-recommendation-card"

const suggestedPrompts = [
  { icon: Puzzle, text: "Necesito armar un robot seguidor de línea para la escuela" },
  { icon: Zap, text: "Quiero automatizar el riego de mi jardín con IoT" },
  { icon: GraduationCap, text: "Busco un kit para aprender electrónica básica" },
  { icon: Package, text: "Necesito componentes para una estación meteorológica" },
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
    return <div className="flex justify-end"><div className="max-w-[80%] rounded-xl rounded-br-lg bg-primary px-5 py-3 text-primary-foreground"><p className="text-sm">{message.content}</p></div></div>
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10"><Sparkles className="h-5 w-5 text-primary" /></div>
      <div className="flex-1 space-y-3">
        <div className="max-w-[90%] rounded-xl rounded-tl-lg bg-card px-5 py-3 shadow-soft">
          <p className="text-sm leading-relaxed text-foreground">{message.content}</p>
        </div>
        {message.products && message.products.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {message.products.map((product) => <ProductRecommendationCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
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

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.response,
        products: data.products,
        timestamp: new Date(),
      }])
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "No pude procesar tu solicitud ahora mismo. Cuéntame tu presupuesto, categoría y tipo de proyecto para ayudarte mejor.",
        timestamp: new Date(),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col pb-8 pt-20 md:pt-24">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12">
              <div className="mb-8 text-center"><div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 shadow-soft"><Sparkles className="h-8 w-8 text-primary" /></div><h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">Asistente de compras IA</h1></div>
              <div className="mb-8 w-full max-w-2xl"><form onSubmit={(e) => { e.preventDefault(); handleSubmit(inputValue) }} className="flex items-center gap-3 rounded-lg bg-card/80 px-4 py-3"><input type="text" placeholder="Describe lo que quieres construir..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none" /><Button type="submit" className="rounded-xl bg-primary px-5 hover:bg-primary/90" disabled={!inputValue.trim() || isTyping}><Send className="h-4 w-4" /></Button></form></div>
              <div className="w-full max-w-2xl"><p className="mb-4 text-center text-sm font-medium text-muted-foreground">Prueba con estos ejemplos</p><div className="grid gap-3 sm:grid-cols-2">{suggestedPrompts.map((prompt, index) => <button key={index} className="group flex items-center gap-3 rounded-lg bg-card p-4 text-left shadow-soft transition-lift" onClick={() => handleSubmit(prompt.text)}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground"><prompt.icon className="h-5 w-5" /></div><span className="text-sm text-foreground">{prompt.text}</span><ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" /></button>)}</div></div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col"><div className="flex-1 space-y-6 py-6">{messages.map((message) => <MessageBubble key={message.id} message={message} />)}{isTyping && <div className="flex gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10"><Sparkles className="h-5 w-5 text-primary animate-pulse-soft" /></div><div className="max-w-[90%] rounded-xl rounded-tl-lg bg-card px-5 py-3 shadow-soft"><div className="flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin text-primary" /><span className="text-sm text-muted-foreground">Buscando productos...</span></div></div></div>}<div ref={messagesEndRef} /></div>
              <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pb-6 pt-4"><form onSubmit={(e) => { e.preventDefault(); handleSubmit(inputValue) }} className="flex items-center gap-3 rounded-lg bg-card/80 px-4 py-3"><input type="text" placeholder="Escribe un mensaje..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none" /><Button type="submit" size="icon" className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90" disabled={!inputValue.trim() || isTyping}><Send className="h-4 w-4" /></Button></form></div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
