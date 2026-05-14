"use client"

import { useState, useRef, useEffect } from "react"
import { Sparkles, Send, ArrowRight, Package, Zap, GraduationCap, Puzzle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SmartInput } from "@/components/ui/smart-input"
import { CameraCapture } from "@/components/ui/camera-capture"
import { ProductRecommendationCard, type ChatProduct } from "@/components/asistente/product-recommendation-card"

// --- Constantes ---
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

// --- Utilidades ---
const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const stripIdsFromAssistantText = (text: string) => {
  return text.replace(/\[.*?\]/g, "").trim()
}

// --- Componentes Auxiliares ---
function MessageBubble({ message }: { message: Message }) {
  if (message.type === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-xl rounded-br-lg bg-primary px-5 py-3 text-primary-foreground">
          {message.imagePreview && (
            <img src={message.imagePreview} alt="Captura" className="mb-3 max-h-64 rounded-lg object-contain" />
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
        <div className="max-w-[90%] rounded-xl rounded-tl-lg bg-card px-5 py-3 shadow-soft border border-border/50">
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

// --- Página Principal ---
export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    if (isCameraOpen && videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current
    }
  }, [isCameraOpen])

  useEffect(() => () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  const closeCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop())
    cameraStreamRef.current = null
    setIsCameraOpen(false)
  }

  const openCamera = async () => {
    if (isTyping) return
    setCameraError("")

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Tu navegador no permite abrir la cámara desde esta página. Usa el botón de subir fotografía.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })
      cameraStreamRef.current = stream
      setIsCameraOpen(true)
    } catch {
      setCameraError("No pude abrir la cámara. Revisa los permisos del navegador o usa el botón de subir fotografía.")
    }
  }

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
      
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.response || "Aquí tienes lo que encontré:",
        products: data.products,
        timestamp: new Date(),
      }])
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Lo siento, hubo un error al procesar tu solicitud.",
        timestamp: new Date(),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const submitImageDataUrl = async (imageDataUrl: string) => {
    if (isTyping) return

    setInputValue("")
    setIsTyping(true)

    try {
      const prompt = "Buscar productos relacionados con esta fotografía"
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        type: "user",
        content: prompt,
        imagePreview: imageDataUrl,
        timestamp: new Date(),
      }])

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, imageDataUrl }),
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
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "No pude analizar la fotografía ahora mismo. Intenta con otra imagen o describe el componente que quieres encontrar.",
        timestamp: new Date(),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleImageFile = async (file: File | undefined) => {
    if (!file || isTyping) return
    if (!file.type.startsWith("image/")) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        type: "assistant",
        content: "El archivo seleccionado no parece ser una imagen. Intenta con una fotografía en PNG, JPG o WebP.",
        timestamp: new Date(),
      }])
      return
    }

    try {
      await submitImageDataUrl(await readFileAsDataUrl(file))
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        type: "assistant",
        content: "No pude leer la imagen seleccionada. Intenta con otra fotografía.",
        timestamp: new Date(),
      }])
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("La cámara aún no está lista. Espera un momento e intenta de nuevo.")
      return
    }

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.85)
    closeCamera()
    void submitImageDataUrl(imageDataUrl)
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (file && isCameraOpen) closeCamera()
    void handleImageFile(file)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex flex-1 flex-col pb-8 pt-20 md:pt-24">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 sm:px-6">
          
          {/* Mostramos errores de cámara si los hay */}
          {cameraError && (
             <div className="mb-4 rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
               {cameraError}
             </div>
          )}

          {messages.length === 0 ? (
            // VISTA INICIAL (Sin mensajes)
            <div className="flex flex-1 flex-col items-center justify-center py-12">
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-soft">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">Asistente IA</h1>
                <p className="text-sm text-muted-foreground">Usa texto o la cámara para encontrar componentes.</p>
              </div>

              <div className="mb-8 w-full max-w-2xl">
                {isCameraOpen ? (
                  <CameraCapture onClose={() => setIsCameraOpen(false)} />
                ) : (
                  <div className="relative rounded-xl border border-border bg-card p-1.5 shadow-elevated">
                    <div className="flex items-center gap-3 bg-card px-4 py-3">
                      <SmartInput
                        value={inputValue}
                        onValueChange={setInputValue}
                        onSubmit={() => handleSubmit(inputValue)}
                        onCameraClick={() => setIsCameraOpen(true)}
                        placeholder="Describe lo que quieres construir..."
                        leftIcon={<Sparkles className="h-5 w-5 text-primary" />}
                        wrapperClassName="flex-1 min-w-0"
                        inputClassName="h-12 rounded-xl border-border bg-background text-base shadow-none"
                      />
                      <Button 
                        onClick={() => handleSubmit(inputValue)}
                        disabled={!inputValue.trim() || isTyping}
                        className="rounded-xl h-12 px-5"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="rounded-lg border-t border-border bg-card p-4">
                      <p className="mb-3 text-center text-xs font-medium text-muted-foreground">Prueba estos ejemplos</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {suggestedPrompts.map((prompt, index) => (
                          <button
                            key={index}
                            className="group flex items-center gap-3 rounded-lg bg-secondary p-3 text-left text-sm text-foreground transition-colors hover:bg-primary/10"
                            onClick={() => handleSubmit(prompt.text)}
                          >
                            <prompt.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="line-clamp-1">{prompt.text}</span>
                            <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // VISTA DE CHAT (Con mensajes)
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
                    <div className="max-w-[90%] rounded-xl bg-card px-5 py-3 shadow-soft border border-border/50 flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Buscando productos...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Fijo Abajo */}
              <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pb-6 pt-4">
                {isCameraOpen ? (
                  <div className="rounded-xl border border-border bg-card overflow-hidden shadow-elevated">
                    <CameraCapture onClose={() => setIsCameraOpen(false)} />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-card/80 backdrop-blur-md p-2 rounded-2xl border border-border/50 shadow-lg">
                    <SmartInput
                      value={inputValue}
                      onValueChange={setInputValue}
                      onSubmit={() => handleSubmit(inputValue)}
                      onCameraClick={() => setIsCameraOpen(true)}
                      placeholder="Escribe un mensaje..."
                      leftIcon={<Sparkles className="h-5 w-5 text-primary" />}
                      wrapperClassName="flex-1"
                      inputClassName="h-11 border-none bg-transparent shadow-none"
                    />
                    <Button 
                      size="icon" 
                      onClick={() => handleSubmit(inputValue)}
                      className="h-10 w-10 rounded-xl"
                      disabled={!inputValue.trim() || isTyping}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
