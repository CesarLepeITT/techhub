"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, RotateCcw, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type CameraCaptureProps = {
  onClose: () => void
  onSend?: (imageData: string) => void
}

export function CameraCapture({ onClose, onSend }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    void startCamera()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    setError(null)
    setIsReady(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      const e = err as DOMException
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setError("Permiso denegado. Acepta el acceso a la cámara cuando el navegador lo solicite.")
      } else if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError") {
        setError("No se encontró ninguna cámara en este dispositivo.")
      } else if (e.name === "NotReadableError") {
        setError("La cámara está siendo usada por otra aplicación.")
      } else {
        setError("No se pudo acceder a la cámara. Revisa los permisos del navegador.")
      }
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0)
    const imageData = canvas.toDataURL("image/jpeg", 0.85)
    setCapturedImage(imageData)
    stopCamera()
  }

  const retake = () => {
    setCapturedImage(null)
    void startCamera()
  }

  const handleSend = () => {
    if (capturedImage) {
      onSend?.(capturedImage)
    }
    stopCamera()
    onClose()
  }

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
      {/* Viewfinder */}
      <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
        {error ? (
          <div className="flex h-full min-h-[180px] items-center justify-center p-6 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Foto capturada"
            className="h-full w-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onCanPlay={() => setIsReady(true)}
            className="h-full w-full object-cover"
          />
        )}

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80 cursor-pointer"
          aria-label="Cerrar cámara"
        >
          <X className="h-4 w-4" />
        </button>

        {/* "Captured" label */}
        {capturedImage && (
          <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            Foto tomada
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 px-4 py-3">
        {capturedImage ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={retake}
              className="rounded-lg cursor-pointer"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Volver a tomar
            </Button>
            <Button
              size="sm"
              onClick={handleSend}
              className="rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Usar foto
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onClick={takePhoto}
            disabled={!!error || !isReady}
            className="rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
          >
            <Camera className="mr-1.5 h-3.5 w-3.5" />
            Tomar foto
          </Button>
        )}
      </div>
    </div>
  )
}
