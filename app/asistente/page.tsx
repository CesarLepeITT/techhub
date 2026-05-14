"use client"

import { useState, useRef, useEffect } from "react"
import { Sparkles, Send, ArrowRight, Package, Zap, GraduationCap, Puzzle, RefreshCw, ImageUp, Camera } from "lucide-react"
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

function MessageBubble({ message }: { message: Message }) {
  if (message.type === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-xl rounded-br-lg bg-primary px-5 py-3 text-primary-foreground">
          {message.imagePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={message.imagePreview} alt="Imagen enviada al asistente" className="mb-3 max-h-64 rounded-lg object-contain" />
          )}
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    )
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
      className="flex items-center gap-2 rounded-lg bg-card/80 px-3 py-3 sm:gap-3 sm:px-4"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0 rounded-xl"
        disabled={isTyping}
        title="Subir fotografía"
        aria-label="Subir fotografía"
        onClick={onUploadClick}
      >
        <ImageUp className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0 rounded-xl"
        disabled={isTyping}
        title="Tomar fotografía"
        aria-label="Tomar fotografía"
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
      <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/90" disabled={!inputValue.trim() || isTyping}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}

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
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream
      }, 0)
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
        content: "No pude procesar tu solicitud ahora mismo. Cuéntame tu presupuesto, categoría y tipo de proyecto para ayudarte mejor.",
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
    void handleImageFile(file)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col pb-8 pt-20 md:pt-24">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 sm:px-6">
          <input ref={uploadInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileInputChange} />
          {cameraError && <p className="mb-3 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{cameraError}</p>}
          {isCameraOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-xl bg-card p-4 shadow-soft">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-foreground">Tomar fotografía</h2>
                  <Button type="button" variant="ghost" onClick={closeCamera}>Cerrar</Button>
                </div>
                <video ref={videoRef} autoPlay playsInline muted className="max-h-[70vh] w-full rounded-lg bg-black object-contain" />
                <div className="mt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={closeCamera}>Cancelar</Button>
                  <Button type="button" onClick={capturePhoto}>Usar foto</Button>
                </div>
              </div>
            </div>
          )}
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12">
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 shadow-soft"><Sparkles className="h-8 w-8 text-primary" /></div>
                <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">Asistente de compras IA</h1>
                <p className="text-sm text-muted-foreground">Describe tu proyecto o sube/toma una foto del componente que necesitas.</p>
              </div>
              <div className="mb-8 w-full max-w-2xl">
                <Composer
                  inputValue={inputValue}
                  isTyping={isTyping}
                  placeholder="Describe lo que quieres construir..."
                  onInputChange={setInputValue}
                  onSubmit={() => handleSubmit(inputValue)}
                  onUploadClick={() => uploadInputRef.current?.click()}
                  onCameraClick={openCamera}
                />
              </div>
              <div className="w-full max-w-2xl"><p className="mb-4 text-center text-sm font-medium text-muted-foreground">Prueba con estos ejemplos</p><div className="grid gap-3 sm:grid-cols-2">{suggestedPrompts.map((prompt, index) => <button key={index} className="group flex items-center gap-3 rounded-lg bg-card p-4 text-left shadow-soft transition-lift" onClick={() => handleSubmit(prompt.text)}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground"><prompt.icon className="h-5 w-5" /></div><span className="text-sm text-foreground">{prompt.text}</span><ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" /></button>)}</div></div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col"><div className="flex-1 space-y-6 py-6">{messages.map((message) => <MessageBubble key={message.id} message={message} />)}{isTyping && <div className="flex gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10"><Sparkles className="h-5 w-5 text-primary animate-pulse-soft" /></div><div className="max-w-[90%] rounded-xl rounded-tl-lg bg-card px-5 py-3 shadow-soft"><div className="flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin text-primary" /><span className="text-sm text-muted-foreground">Analizando y buscando productos...</span></div></div></div>}<div ref={messagesEndRef} /></div>
              <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent pb-6 pt-4">
                <Composer
                  inputValue={inputValue}
                  isTyping={isTyping}
                  placeholder="Escribe un mensaje..."
                  onInputChange={setInputValue}
                  onSubmit={() => handleSubmit(inputValue)}
                  onUploadClick={() => uploadInputRef.current?.click()}
                  onCameraClick={openCamera}
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
