"use client"

import * as React from "react"
import { Camera, Mic, MicOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type SmartInputProps = Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & {
  value: string
  onValueChange: (value: string) => void
  onSubmit?: () => void
  leftIcon?: React.ReactNode
  onCameraClick?: () => void
  enableVoice?: boolean
  wrapperClassName?: string
  inputClassName?: string
}

type SpeechRecognitionInstance = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

const SPEECH_ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Acepta el permiso del micrófono cuando el navegador lo solicite.",
  "network": "La función de voz requiere conexión a internet.",
  "no-speech": "No se detectó voz. Habla más cerca del micrófono.",
  "audio-capture": "No se encontró micrófono en este dispositivo.",
  "service-not-allowed": "El servicio de voz no está disponible en este contexto.",
}

export function SmartInput({
  value,
  onValueChange,
  onSubmit,
  leftIcon,
  onCameraClick,
  enableVoice = true,
  wrapperClassName,
  inputClassName,
  onKeyDown,
  ...props
}: SmartInputProps) {
  const recognitionRef = React.useRef<SpeechRecognitionInstance | null>(null)
  const baseValueRef = React.useRef("")
  const [isListening, setIsListening] = React.useState(false)
  const [isSupported, setIsSupported] = React.useState(false)

  React.useEffect(() => {
    const win = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionInstance
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance
    }
    setIsSupported(Boolean(win.SpeechRecognition || win.webkitSpeechRecognition))
  }, [])

  React.useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    }
  }, [])

  const stopListening = React.useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  const startListening = React.useCallback(() => {
    if (!isSupported) {
      toast({
        title: "Dictado no disponible",
        description: "Este navegador no soporta el reconocimiento de voz. Prueba con Chrome.",
      })
      return
    }

    if (isListening) {
      stopListening()
      return
    }

    const win = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionInstance
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance
    }
    const Recognition = win.SpeechRecognition ?? win.webkitSpeechRecognition
    if (!Recognition) return

    const recognition = new Recognition()
    baseValueRef.current = value.trim()
    recognition.lang = "es-MX"
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results as ArrayLike<any>)
        .map((result) => result[0]?.transcript || "")
        .join("")
        .trim()

      const nextValue = [baseValueRef.current, transcript].filter(Boolean).join(" ").trim()
      onValueChange(nextValue)
    }

    recognition.onerror = (event) => {
      const errorCode = event?.error as string
      if (errorCode === "aborted") return

      const description =
        SPEECH_ERROR_MESSAGES[errorCode] ??
        "Error al usar el micrófono. Revisa los permisos del navegador."

      toast({ title: "No se pudo activar el micrófono", description })
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    setIsListening(true)

    try {
      recognition.start()
    } catch {
      setIsListening(false)
      recognitionRef.current = null
      toast({
        title: "No se pudo activar el micrófono",
        description: "El navegador bloqueó el acceso. Verifica los permisos.",
      })
    }
  }, [isListening, isSupported, onValueChange, stopListening, value])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && onSubmit) {
      event.preventDefault()
      onSubmit()
    }
    onKeyDown?.(event)
  }

  const hasTrailingActions = enableVoice || Boolean(onCameraClick)

  return (
    <div className={cn("relative flex-1", wrapperClassName)}>
      {leftIcon ? (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {leftIcon}
        </div>
      ) : null}

      <Input
        {...props}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          leftIcon ? "pl-10" : "pl-3",
          hasTrailingActions ? "pr-24" : "pr-3",
          inputClassName,
        )}
      />

      {hasTrailingActions ? (
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {enableVoice ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(
                "rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary",
                isListening && "bg-primary/10 text-primary animate-pulse",
              )}
              onClick={startListening}
              aria-label={isListening ? "Detener dictado" : "Activar dictado por voz"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          ) : null}

          {onCameraClick ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
              onClick={onCameraClick}
              aria-label="Abrir cámara"
            >
              <Camera className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
