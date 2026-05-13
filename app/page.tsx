import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { CategoriesSection } from "@/components/home/categories-section"
import { FeaturesSection } from "@/components/home/features-section"
import { StatsSection } from "@/components/home/stats-section"

export default function HomePage() {
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
