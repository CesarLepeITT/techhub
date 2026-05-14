import Link from "next/link"
import { Sparkles, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"

const footerLinks = {
  productos: [
    { name: "Microcontroladores", href: "/productos?categoria=Microcontroladores" },
    { name: "Sensores", href: "/productos?categoria=Sensores" },
    { name: "MÃ³dulos IoT", href: "/productos?categoria=IoT" },
    { name: "Herramientas", href: "/productos?categoria=Herramientas" },
    { name: "Kits educativos", href: "/productos?categoria=Kits" },
  ],
  servicios: [
    { name: "Asistente IA", href: "/asistente" },
    { name: "TechReels", href: "/reels" },
    { name: "EnvÃ­os express", href: "/envios" },
    { name: "Soporte tÃ©cnico", href: "/soporte" },
  ],
  empresa: [
    { name: "Sobre nosotros", href: "/nosotros" },
    { name: "Blog", href: "/blog" },
    { name: "Contacto", href: "/contacto" },
    { name: "Trabaja con nosotros", href: "/empleo" },
  ],
  legal: [
    { name: "TÃ©rminos de servicio", href: "/terminos" },
    { name: "PolÃ­tica de privacidad", href: "/privacidad" },
    { name: "Devoluciones", href: "/devoluciones" },
  ],
}

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "YouTube", icon: Youtube, href: "#" },
]

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      {/* Newsletter Section */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 rounded-xl bg-secondary p-8 text-center lg:flex-row lg:justify-between lg:text-left">
            <div className="max-w-md">
              <h3 className="mb-2 text-xl font-bold text-foreground">
                Ãšnete a la comunidad maker
              </h3>
              <p className="text-muted-foreground">
                Recibe ofertas exclusivas, tutoriales y novedades en componentes electrÃ³nicos.
              </p>
            </div>
            <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-text"
              />
              <Button className="rounded-lg bg-primary px-6 hover:bg-primary/90 cursor-pointer">
                Suscribir
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2 cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">techHub</span>
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              El marketplace de tecnologÃ­a y electrÃ³nica para la comunidad maker de Tijuana y todo MÃ©xico.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Zona RÃ­o, Tijuana, B.C.</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+52 (664) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>hola@techHub.mx</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Productos</h4>
            <ul className="space-y-3">
              {footerLinks.productos.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary cursor-pointer"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Servicios</h4>
            <ul className="space-y-3">
              {footerLinks.servicios.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary cursor-pointer"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary cursor-pointer"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary cursor-pointer"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Â© 2026 techHub. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer"
                aria-label={social.name}
              >
                <social.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

