"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Upload,
  Search,
  Sparkles,
  ImageIcon,
  AlertCircle,
  Grid,
  List,
  Loader,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchResult {
  id: number
  name: string
  image: string
  price: number
  seller: string
  match: number
  category: string
}

export default function BuscarImagenPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [uploadError, setUploadError] = useState("")

  const mockResults: SearchResult[] = [
    {
      id: 1,
      name: "Laptop Gaming ROG",
      image: "https://images.unsplash.com/photo-1588872657840-790ff3bde08f?w=300&h=300&fit=crop",
      price: 2499.99,
      seller: "TechHub Store",
      match: 94,
      category: "Laptops",
    },
    {
      id: 2,
      name: "Laptop Gamer ASUS TUF",
      image: "https://images.unsplash.com/photo-1603468620905-8fe5e0e8b640?w=300&h=300&fit=crop",
      price: 1899.99,
      seller: "ElectroMart",
      match: 89,
      category: "Laptops",
    },
    {
      id: 3,
      name: "Gaming Laptop Pro Max",
      image: "https://images.unsplash.com/photo-1599298881974-bc20f26ae475?w=300&h=300&fit=crop",
      price: 3199.99,
      seller: "Premium Electronics",
      match: 85,
      category: "Laptops",
    },
    {
      id: 4,
      name: "Laptop Ultraportátil",
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop",
      price: 1299.99,
      seller: "TechWorld",
      match: 78,
      category: "Laptops",
    },
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setUploadError("Por favor sube un archivo de imagen válido")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("La imagen no debe exceder 10MB")
      return
    }

    setUploadError("")
    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSearch = () => {
    if (!uploadedImage) {
      setUploadError("Por favor sube una imagen primero")
      return
    }

    setIsSearching(true)
    setTimeout(() => {
      setSearchResults(mockResults)
      setIsSearching(false)
    }, 2000)
  }

  const handleRemoveImage = () => {
    setUploadedImage(null)
    setSearchResults([])
    setUploadError("")
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

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
            Buscar por imagen
          </h1>
          <p className="text-muted-foreground">
            Sube una foto y encontraremos productos similares en nuestro catálogo
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Sube tu imagen</h2>

              {/* Upload Area */}
              <div className="mb-4">
                {!uploadedImage ? (
                  <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 p-8 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-secondary/50">
                    <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="mb-1 text-sm font-medium text-foreground">
                      Arrastra tu imagen aquí
                    </p>
                    <p className="text-xs text-muted-foreground">
                      o haz clic para seleccionar
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative rounded-lg overflow-hidden bg-secondary">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="h-40 w-full object-cover"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 rounded-full bg-destructive/90 p-2 text-white hover:bg-destructive transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="mb-4 rounded-lg bg-destructive/10 p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{uploadError}</p>
                </div>
              )}

              <Button
                onClick={handleSearch}
                disabled={!uploadedImage || isSearching}
                className="w-full rounded-lg bg-primary hover:bg-primary/90 cursor-pointer"
              >
                {isSearching ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar productos
                  </>
                )}
              </Button>

              {/* Tips */}
              <div className="mt-6 space-y-3 rounded-lg bg-secondary/30 p-4">
                <h3 className="text-sm font-medium text-foreground">Consejos para mejores resultados:</h3>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>• Usa imágenes claras y bien iluminadas</li>
                  <li>• Asegúrate de que el producto sea el enfoque principal</li>
                  <li>• Evita imágenes borrosas o pixeladas</li>
                  <li>• Formatos: JPG, PNG, WEBP (máx 10MB)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {searchResults.length > 0 && (
              <>
                {/* View Mode Toggle */}
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Se encontraron <span className="font-semibold text-foreground">{searchResults.length}</span> productos similares
                  </p>
                  <div className="flex gap-2 rounded-lg border border-border bg-card p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`rounded p-2 transition-colors cursor-pointer ${
                        viewMode === "grid"
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`rounded p-2 transition-colors cursor-pointer ${
                        viewMode === "list"
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Grid View */}
                {viewMode === "grid" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={`/producto/${result.id}`}
                        className="group rounded-xl border border-border bg-card overflow-hidden shadow-soft transition-all hover:shadow-elevated hover:border-primary/50 cursor-pointer"
                      >
                        <div className="relative h-40 overflow-hidden bg-secondary">
                          <img
                            src={result.image}
                            alt={result.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                          />
                          <div className="absolute top-2 right-2 rounded-full bg-primary/90 px-2 py-1 text-xs font-semibold text-primary-foreground">
                            {result.match}% coincidencia
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="mb-1 text-xs text-muted-foreground">{result.category}</p>
                          <h3 className="mb-2 text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {result.name}
                          </h3>
                          <p className="mb-2 text-xs text-muted-foreground">{result.seller}</p>
                          <p className="text-lg font-bold text-primary">${result.price.toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* List View */}
                {viewMode === "list" && (
                  <div className="space-y-3">
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={`/producto/${result.id}`}
                        className="group flex gap-4 rounded-xl border border-border bg-card p-4 shadow-soft transition-all hover:shadow-elevated hover:border-primary/50 cursor-pointer"
                      >
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                          <img
                            src={result.image}
                            alt={result.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute top-1 right-1 rounded-full bg-primary/90 px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                            {result.match}%
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">{result.category}</p>
                          <h3 className="mb-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {result.name}
                          </h3>
                          <p className="mb-2 text-xs text-muted-foreground">{result.seller}</p>
                          <p className="text-base font-bold text-primary">${result.price.toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {searchResults.length === 0 && uploadedImage && !isSearching && (
              <div className="rounded-xl border border-border bg-card p-12 text-center shadow-soft">
                <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-foreground font-medium">No se encontraron resultados</p>
                <p className="text-sm text-muted-foreground">
                  Intenta con una imagen diferente o busca usando palabras clave
                </p>
              </div>
            )}

            {searchResults.length === 0 && !uploadedImage && !isSearching && (
              <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-12 text-center">
                <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Sube una imagen en el panel izquierdo para comenzar la búsqueda
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
