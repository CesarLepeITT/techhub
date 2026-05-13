"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  User,
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  MapPin,
  Phone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type UserType = "usuario" | "vendedor" | null

export default function RegistroPage() {
  const [userType, setUserType] = useState<UserType>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    ubicacion: "",
    storeName: "",
  })
  const [agreed, setAgreed] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="navbar-solid shadow-soft">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">TechMarket</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="rounded-lg cursor-pointer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
            Crear cuenta
          </h1>
          <p className="text-muted-foreground">
            Selecciona tu tipo de cuenta para comenzar
          </p>
        </div>

        {/* User Type Selection */}
        {!userType ? (
          <div className="space-y-4">
            <button
              onClick={() => setUserType("usuario")}
              className="group w-full rounded-xl border border-border bg-card p-6 text-left shadow-soft transition-all hover:border-primary/50 hover:shadow-elevated cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <User className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-foreground">Comprador</h3>
                  <p className="text-sm text-muted-foreground">
                    Acceso a catálogo completo, carrito, checkout seguro y panel de pedidos.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setUserType("vendedor")}
              className="group w-full rounded-xl border border-border bg-card p-6 text-left shadow-soft transition-all hover:border-primary/50 hover:shadow-elevated cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Store className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-foreground">Vendedor</h3>
                  <p className="text-sm text-muted-foreground">
                    Crea tu tienda, gestiona productos, órdenes y accede a analytics.
                  </p>
                </div>
              </div>
            </button>

            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link href="/iniciar-sesion" className="font-medium text-primary hover:underline cursor-pointer">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
            {/* Selected Type Header */}
            <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
              <button
                onClick={() => setUserType(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {userType === "usuario" ? <User className="h-5 w-5" /> : <Store className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {userType === "usuario" ? "Crear cuenta de comprador" : "Crear tienda"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {userType === "usuario" ? "Acceso como comprador" : "Acceso como vendedor"}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <form className="space-y-4">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-foreground">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="nombre"
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="mb-1.5 block text-sm font-medium text-foreground">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="telefono"
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="+52 664 123 4567"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                  />
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <label htmlFor="ubicacion" className="mb-1.5 block text-sm font-medium text-foreground">
                  Ubicación
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="ubicacion"
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    placeholder="Ciudad, Estado"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                  />
                </div>
              </div>

              {/* Store Name - Solo para vendedores */}
              {userType === "vendedor" && (
                <div>
                  <label htmlFor="storeName" className="mb-1.5 block text-sm font-medium text-foreground">
                    Nombre de la tienda
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="storeName"
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                      placeholder="Mi tienda tech"
                      className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-foreground">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repite tu contraseña"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">
                  Acepto los <Link href="#" className="text-primary hover:underline">términos y condiciones</Link> y la <Link href="#" className="text-primary hover:underline">política de privacidad</Link>
                </span>
              </label>

              <Button
                type="submit"
                className="w-full rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
                disabled={!agreed}
              >
                <Check className="mr-2 h-4 w-4" />
                Crear cuenta
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link href="/iniciar-sesion" className="font-medium text-primary hover:underline cursor-pointer">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
