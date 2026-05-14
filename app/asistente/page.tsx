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
      // Línea corregida aquí:
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
             <div className="mb-4 rounded-lg bg-destructive/15 p-3 text-sm text-
