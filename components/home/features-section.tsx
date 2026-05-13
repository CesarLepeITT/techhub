"use client"

import { Sparkles, Zap, TrendingUp, ShieldCheck, Truck, Users } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "Asistente IA inteligente",
    description:
      "Describe tu proyecto y obtén recomendaciones precisas de componentes, kits compatibles y alternativas económicas.",
  },
  {
    icon: Zap,
    title: "Comparativa instantánea",
    description:
      "Compara precios, especificaciones y disponibilidad entre múltiples proveedores en tiempo real.",
  },
  {
    icon: TrendingUp,
    title: "Predicción de demanda",
    description:
      "Algoritmos XGBoost que anticipan stock y precios para que compres en el mejor momento.",
  },
  {
    icon: ShieldCheck,
    title: "Garantía maker",
    description:
      "Todos los productos con garantía de funcionamiento. Si no enciende, te devolvemos tu dinero.",
  },
  {
    icon: Truck,
    title: "Entrega local express",
    description:
      "Recibe el mismo día en Tijuana. Envíos a todo México con tarifas preferenciales.",
  },
  {
    icon: Users,
    title: "Comunidad activa",
    description:
      "Conecta con otros makers, comparte proyectos y obtén soporte técnico de expertos locales.",
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-card py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Potenciado por IA
          </span>
          <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
            El marketplace que entiende a los makers
          </h2>
          <p className="text-muted-foreground">
            No solo vendemos componentes. Te ayudamos a encontrar exactamente lo que necesitas para tu proyecto.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-background p-6 shadow-soft transition-lift cursor-pointer"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
