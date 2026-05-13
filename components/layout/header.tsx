"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ShoppingCart, User, Search, Sparkles, LayoutGrid, Clapperboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Productos", href: "/productos", icon: LayoutGrid },
  { name: "Asistente IA", href: "/asistente", icon: Sparkles },
  { name: "TechReels", href: "/reels", icon: Clapperboard },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cartItemCount = 3

  return (
    <>
      {/* Desktop Header */}
      <header className="fixed top-0 left-0 right-0 z-50 hidden md:block">
        <div className="navbar-solid shadow-soft">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 cursor-pointer">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-foreground">TechMarket</span>
              </Link>

              {/* Navigation */}
              <nav className="flex items-center gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-lg cursor-pointer">
                  <Search className="h-5 w-5" />
                </Button>
                <Link href="/carrito">
                  <Button variant="ghost" size="icon" className="relative rounded-lg cursor-pointer">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        {cartItemCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/iniciar-sesion">
                  <Button variant="outline" className="ml-2 rounded-lg cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 md:hidden">
        <div className="navbar-solid shadow-soft">
          <div className="flex h-14 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-base font-semibold text-foreground">TechMarket</span>
            </Link>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg cursor-pointer">
                <Search className="h-5 w-5" />
              </Button>
              <Link href="/carrito">
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg cursor-pointer">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg cursor-pointer"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "navbar-solid absolute left-0 right-0 top-14 overflow-hidden shadow-elevated transition-all duration-300",
            mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <nav className="flex flex-col gap-1 p-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <div className="mt-2">
              <Link href="/iniciar-sesion" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-lg cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="navbar-solid border-t border-border shadow-float">
          <div className="flex items-center justify-around py-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-muted-foreground transition-colors hover:text-primary cursor-pointer"
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  )
}
