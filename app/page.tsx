"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/components/SessionProvider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { CategoriesSection } from "@/components/home/categories-section"
import { FeaturesSection } from "@/components/home/features-section"
import { StatsSection } from "@/components/home/stats-section"

export default function HomePage() {
  const { user, isLoading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user?.role === "seller") {
      router.replace("/vendedor")
    }
  }, [user, isLoading, router])

  if (isLoading || user?.role === "seller") {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <CategoriesSection />
        <StatsSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  )
}
