"use client"

import { useState, useRef, useEffect } from "react"
import { Sparkles, Send, ArrowRight, Package, Zap, GraduationCap, Puzzle, RefreshCw, ImageUp, Camera, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductRecommendationCard, type ChatProduct } from "@/components/asistente/product-recommendation-card"

// --- Constantes y Utilidades ---

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
  imagePreview?: string
  products?: ChatProduct[]
  timestamp: Date
}

function stripIdsFromAssistantText(input: string): string {
  return input
    .replace(/\(\s*id\s*:\s*[a-f0-9\-]{36}\s*\)/gi, "")
    .replace(/\[\s*id\s*:\s*[a-f0-9\-]{36}\s*\]/gi, "")
    .replace(/\b(id|uuid)\s*:\s*[a-f0-9\-]{36}\b/gi, "")
    .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

// --- Sub-componentes ---

function MessageBubble({ message }: { message: Message }) {
  if (message.type === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-xl rounded-br-lg bg-primary px-5 py-3 text-primary-foreground">
          {message.imagePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={message.imagePreview} alt="Imagen enviada" className="mb-3 max-h-64 rounded-lg object-contain" />
          )}
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
          <p className="text-sm leading-relaxed text-foreground">{message.content}</p>
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

function Composer({
  inputValue,
  isTyping,
  placeholder,
  onInputChange,
  onSubmit,
  onUploadClick,
  onCameraClick,
}: {
  inputValue: string
  isTyping: boolean
  placeholder: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  onUploadClick: () => void
  onCameraClick: () => void
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="flex items-center gap-2 rounded-lg bg-card/80 px-3 py-3 sm:gap-3 sm:px-4 backdrop-blur-md border border-border/50 shadow-lg"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0 rounded-xl hover:bg-secondary"
        disabled={isTyping}
        onClick={onUploadClick}
      >
        <ImageUp className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0 rounded-xl hover:bg-secondary"
        disabled={isTyping}
        onClick={onCameraClick}
      >
        <Camera className="h-4 w-4" />
      </Button>
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <Button 
        type="submit" 
        size="icon" 
        className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/90" 
        disabled={!inputValue.trim() || isTyping}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}

// --- Componente Principal ---

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  
  // Referencias corregidas
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)

  // Scroll automático al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Limpieza de la cámara al desmontar el componente
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const handleSubmit = async (prompt: string) => {
    if (!prompt.trim() || isTyping) return
    
    const userMessage: Message = { 
      id: Date.now().toString(), 
      type: "user", 
      content: prompt, 
      timestamp: new Date() 
    }
    
    setMessages((prev) => [...prev, userMessage])
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
        content: stripIdsFromAssistantText(data.response ?? ""),
        products: data.products,
        timestamp: new Date(),
      }])
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "No pude procesar tu solicitud ahora mismo. Intenta describiendo los componentes que buscas.",
        timestamp: new Date(),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleImageFile = async (file: File | undefined) => {
    if (!file || isTyping) return
    
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido.")
      return
    }

    setIsTyping(true)
    try {
      const imageDataUrl = await readFileAsDataUrl(file)
      const prompt = "Analiza esta imagen y busca componentes relacionados"
      
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        type: "user",
        content: "Te he enviado una imagen para analizar.",
        imagePreview: imageDataUrl,
        timestamp: new Date(),
      }])

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, imageDataUrl }),
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Error en el servidor")

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: stripIdsFromAssistantText(data.response ?? "Aquí tienes lo que encontré:"),
        products: data.products,
        timestamp: new Date(),
      }])
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "No pude analizar la fotografía. Intenta subirla de nuevo o describe el producto.",
        timestamp: new Date(),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = "" // Reset para permitir subir la misma foto
    void handleImageFile(file)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex flex-1 flex-col pb-8 pt-20 md:pt-24">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 sm:px-6">
          
          {/* Inputs de archivos ocultos */}
          <input 
            ref={uploadInputRef} 
            type="file" 
            accept="image/png,image/jpeg,image/webp" 
            className="hidden" 
            onChange={handleFileInputChange} 
          />
          <input 
            ref={cameraInputRef} 
            type="file" 
            accept="image/png,image/jpeg,image/webp" 
            capture="environment" 
            className="hidden" 
            onChange={handleFileInputChange} 
          />

          {messages.length === 0 ? (
            // --- Vista Inicial ---
            <div className="flex flex-1 flex-col items-center justify-center py-12">
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-soft">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">Asistente de compras IA</h1>
                <p className="text-sm text-muted-foreground">Encuentra componentes electrónicos mediante texto o fotos.</p>
              </div>

              <div className="mb-8 w-full max-w-2xl">
                <Composer
                  inputValue={inputValue}
                  isTyping={isTyping}
                  placeholder="Describe lo que quieres construir..."
                  onInputChange={setInputValue}
                  onSubmit={() => handleSubmit(inputValue)}
                  onUploadClick={() => uploadInputRef.current?.click()}
                  onCameraClick={() => cameraInputRef.current?.click()}
                />
              </div>

              <div className="w-full max-w-2xl">
                <p className="mb-4 text-center text-sm font-medium text-muted-foreground">Prueba con estos ejemplos</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <button 
                      key={index} 
                      className="group flex items-center gap-3 rounded-xl bg-card p-4 text-left shadow-soft transition-all hover:scale-[1.02] active:scale-95 border border-border/50" 
                      onClick={() => handleSubmit(prompt.text)}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
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
            // --- Vista de Chat ---
            <div className="flex flex-1 flex-col">
              <div className="flex-1 space-y-6 py-6">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    </div>
                    <div className="max-w-[90%] rounded-xl rounded-tl-lg bg-card px-5 py-3 shadow-soft border border-border/50">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Analizando componentes...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input fijo al final */}
              <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pb-6 pt-4">
                <Composer
                  inputValue={inputValue}
                  isTyping={isTyping}
                  placeholder="Escribe un mensaje..."
                  onInputChange={setInputValue}
                  onSubmit={() => handleSubmit(inputValue)}
                  onUploadClick={() => uploadInputRef.current?.click()}
                  onCameraClick={() => cameraInputRef.current?.click()}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
