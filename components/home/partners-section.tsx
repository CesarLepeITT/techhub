"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ExternalLink, Gamepad2, Coins, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

const PARTNER_IMAGES = [
  "/partners1.png",
  "/partners2.png",
  "/partners3.png",
  "/partners4.png",
]

const BG_STATS = [
  { label: "Juegos activos", value: "2", sub: "Outer Ring · RacerLoop" },
  { label: "Suministro $BG", value: "10B", sub: "Ecosistema · Comunidad" },
  { label: "Blockchain", value: "SKALE", sub: "Nuestra red nativa" },
  { label: "Activos", value: "NFT", sub: "100% en blockchain" },
]

const BG_FEATURES = [
  {
    icon: Coins,
    title: "Economía de jugadores",
    desc: "Cada transacción, comercio y batalla da forma al universo. $BG impulsa el ecosistema de todos los juegos.",
  },
  {
    icon: Shield,
    title: "Propiedad digital real",
    desc: "Tus activos son tuyos. Todos los activos NFT viven en blockchain, intercámbialos, véndelos o llévalos al ecosistema.",
  },
  {
    icon: Zap,
    title: "Una identidad para todo",
    desc: "Tu Blink Passport gratuito es la llave de todo el universo BlinkGalaxy — juegos, mercado, ranking y más.",
  },
]

export function PartnersSection() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  // Duplicate images for seamless infinite scroll
  const allImages = [...PARTNER_IMAGES, ...PARTNER_IMAGES]

  return (
    <section className="overflow-hidden bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            <Gamepad2 className="h-3.5 w-3.5" />
            Partners
          </span>
          <h2 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">
            Conoce a nuestros partners
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Trabajamos con proyectos que comparten nuestra visión: tecnología accesible, comunidades reales y ecosistemas que crecen juntos.
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative mb-16 -mx-4 sm:-mx-6 lg:-mx-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Fade masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />

          <div className="flex overflow-hidden">
            <div
              ref={trackRef}
              className="flex gap-6 will-change-transform"
              style={{
                animation: isPaused ? "none" : "partners-scroll 22s linear infinite",
              }}
            >
              {allImages.map((src, i) => (
                <div
                  key={i}
                  className="relative h-52 w-80 shrink-0 overflow-hidden rounded-2xl"
                  style={{ boxShadow: "0 4px 32px 0 rgba(0,0,0,0.10)" }}
                >
                  <Image
                    src={src}
                    alt={`Partner ${(i % PARTNER_IMAGES.length) + 1}`}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Blink Galaxy partner card */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d0d1a] via-[#111827] to-[#0d0d1a]">
          {/* Top accent */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <div className="p-8 md:p-12">
            {/* Brand */}
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                    Gaming · Web3
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/60">
                    Impulsado por SKALE
                  </span>
                </div>
                <a
                  href="https://blinkgalaxy.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <h3 className="text-2xl font-bold text-white md:text-3xl">BlinkGalaxy</h3>
                  <ExternalLink className="h-4 w-4 text-white/40 group-hover:text-primary transition-colors" />
                </a>
                <p className="mt-1 text-sm text-white/50">
                  Dos juegos activos · Una economía · Misiones infinitas
                </p>
              </div>
              <a
                href="https://portal.blinkgalaxy.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Entrar al Portal
                </Button>
              </a>
            </div>

            {/* Stats row */}
            <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {BG_STATS.map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/5 p-4 text-center">
                  <p className="text-xl font-bold text-white md:text-2xl">{s.value}</p>
                  <p className="mt-0.5 text-xs font-medium text-primary">{s.label}</p>
                  <p className="mt-0.5 text-[10px] text-white/40">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="mb-10 grid gap-5 sm:grid-cols-3">
              {BG_FEATURES.map((f) => (
                <div key={f.title} className="rounded-2xl bg-white/5 p-5">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mb-1.5 text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs leading-relaxed text-white/50">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              <a href="https://portal.blinkgalaxy.com" target="_blank" rel="noopener noreferrer">
                <Button className="rounded-xl bg-primary px-6 hover:bg-primary/90 cursor-pointer">
                  Únete a la Galaxia
                </Button>
              </a>
              <a href="https://blinkgalaxy.com" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="rounded-xl border-white/20 bg-transparent px-6 text-white/80 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  Explorar juegos
                </Button>
              </a>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>
      </div>

      {/* Keyframe animation injected as style tag */}
      <style>{`
        @keyframes partners-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 2)); }
        }
      `}</style>
    </section>
  )
}
