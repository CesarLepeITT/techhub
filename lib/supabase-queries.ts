import { supabase } from "./supabase"

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop"

type RawProductRow = {
  id: string
  seller_id?: string
  category_id?: string
  name: string
  short_description?: string | null
  full_description?: string | null
  image_url?: string | null
  main_image_url?: string | null
  video_url?: string | null
  images_json?: unknown
  retail_price: number | string
  wholesale_price?: number | string | null
  wholesale_min_quantity?: number | null
  stock: number
  avg_rating?: number | string | null
  review_count?: number | null
  specifications_json?: unknown
  sellers?: {
    id?: string
    store_name: string
    is_verified?: boolean
    rating?: number | string | null
  } | null
  categories?: {
    id?: string
    name: string
    slug?: string
  } | null
}

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string" && item.length > 0)
}

function normalizeProduct(row: RawProductRow) {
  const images = toStringArray(row.images_json)
  const imageUrl = row.image_url || row.main_image_url || images[0] || FALLBACK_PRODUCT_IMAGE

  return {
    id: row.id,
    seller_id: row.seller_id,
    category_id: row.category_id,
    name: row.name,
    description: row.full_description || row.short_description || "",
    image_url: imageUrl,
    video_url: row.video_url ?? null,
    images_array: images.length > 0 ? images : [imageUrl],
    price: toNumber(row.retail_price),
    wholesale_price:
      row.wholesale_price == null ? null : toNumber(row.wholesale_price),
    minimum_wholesale_quantity: row.wholesale_min_quantity ?? 10,
    stock: row.stock ?? 0,
    rating: toNumber(row.avg_rating),
    reviews_count: row.review_count ?? 0,
    specifications_json:
      row.specifications_json && typeof row.specifications_json === "object"
        ? row.specifications_json
        : {},
    sellers: row.sellers
      ? {
          id: row.sellers.id ?? "",
          store_name: row.sellers.store_name,
          is_verified: row.sellers.is_verified ?? false,
          rating: toNumber(row.sellers.rating),
        }
      : null,
    categories: row.categories
      ? {
          id: row.categories.id ?? "",
          name: row.categories.name,
          slug: row.categories.slug ?? "",
        }
      : null,
  }
}

async function getOrCreateCart(userId: string) {
  const existingCart = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingCart.error) {
    return { data: null, error: existingCart.error }
  }

  if (existingCart.data) {
    return { data: existingCart.data, error: null }
  }

  const sessionId = `user-${userId}`
  const createdCart = await supabase
    .from("carts")
    .insert({
      user_id: userId,
      session_id: sessionId,
    })
    .select("id")
    .single()

  return createdCart
}

export async function getProducts(limit = 20, offset = 0) {
  const { data, error, count } = await supabase
    .from("products")
    .select(
      `
      id,
      seller_id,
      category_id,
      name,
      short_description,
      full_description,
      image_url,
      main_image_url,
      video_url,
      images_json,
      retail_price,
      wholesale_price,
      wholesale_min_quantity,
      stock,
      avg_rating,
      review_count,
      sellers(store_name),
      categories(id, name, slug)
      `,
      { count: "exact" }
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  return {
    data: data?.map((row) => normalizeProduct(row as RawProductRow)) ?? [],
    error,
    count,
  }
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      seller_id,
      category_id,
      name,
      short_description,
      full_description,
      image_url,
      main_image_url,
      video_url,
      images_json,
      retail_price,
      wholesale_price,
      wholesale_min_quantity,
      stock,
      avg_rating,
      review_count,
      specifications_json,
      sellers(id, store_name, is_verified, rating),
      categories(id, name, slug)
      `
    )
    .eq("id", id)
    .eq("is_active", true)
    .single()

  return {
    data: data ? normalizeProduct(data as RawProductRow) : null,
    error,
  }
}

export async function getProductsByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      seller_id,
      category_id,
      name,
      short_description,
      full_description,
      image_url,
      main_image_url,
      images_json,
      retail_price,
      wholesale_price,
      wholesale_min_quantity,
      stock,
      avg_rating,
      review_count,
      sellers(store_name),
      categories(id, name, slug)
      `
    )
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return {
    data: data?.map((row) => normalizeProduct(row as RawProductRow)) ?? [],
    error,
  }
}

export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      seller_id,
      category_id,
      name,
      short_description,
      full_description,
      image_url,
      main_image_url,
      images_json,
      retail_price,
      wholesale_price,
      wholesale_min_quantity,
      stock,
      avg_rating,
      review_count,
      sellers(store_name)
      `
    )
    .ilike("name", `%${query}%`)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20)

  return {
    data: data?.map((row) => normalizeProduct(row as RawProductRow)) ?? [],
    error,
  }
}

export async function getCart(userId: string) {
  const cart = await getOrCreateCart(userId)
  if (cart.error || !cart.data) {
    return { data: null, error: cart.error }
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      product_id,
      quantity,
      applied_price_type,
      subtotal,
      products(
        id,
        seller_id,
        name,
        image_url,
        main_image_url,
        retail_price,
        wholesale_price,
        wholesale_min_quantity,
        stock
      )
      `
    )
    .eq("cart_id", cart.data.id)
    .order("added_at", { ascending: false })

  return {
    data:
      data?.map((item) => {
        const product = item.products as {
          id: string
          seller_id: string
          name: string
          image_url: string | null
          main_image_url: string | null
          retail_price: number | string
          wholesale_price: number | string | null
          wholesale_min_quantity: number | null
          stock: number
        } | null

        return {
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          applied_price_type: item.applied_price_type,
          subtotal: toNumber(item.subtotal),
          products: product
            ? {
                id: product.id,
                seller_id: product.seller_id,
                name: product.name,
                image_url: product.image_url || product.main_image_url || FALLBACK_PRODUCT_IMAGE,
                price: toNumber(product.retail_price),
                wholesale_price:
                  product.wholesale_price == null ? null : toNumber(product.wholesale_price),
                minimum_wholesale_quantity: product.wholesale_min_quantity ?? 10,
                stock: product.stock,
              }
            : null,
        }
      }) ?? [],
    error,
  }
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  const cart = await getOrCreateCart(userId)
  if (cart.error || !cart.data) {
    return { data: null, error: cart.error }
  }

  const { data, error } = await supabase
    .from("cart_items")
    .upsert(
      {
        cart_id: cart.data.id,
        product_id: productId,
        quantity,
      },
      { onConflict: "cart_id,product_id" }
    )
    .select()

  return { data, error }
}

export async function removeFromCart(cartItemId: string) {
  const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId)
  return { error }
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const { data, error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId)
    .select()

  return { data, error }
}

export async function clearCart(userId: string) {
  const cart = await getOrCreateCart(userId)
  if (cart.error || !cart.data) {
    return { error: cart.error }
  }

  const { error } = await supabase.from("cart_items").delete().eq("cart_id", cart.data.id)
  return { error }
}

export async function createOrder(
  userId: string,
  orderData: {
    customer_name: string
    customer_email: string
    customer_phone: string
    subtotal: number
    shipping_cost: number
    tax: number
    total: number
    shipping_method: "standard" | "express" | "pickup"
    payment_method: "cash_on_delivery" | "transfer" | "pickup_payment" | "card" | "crypto"
    shipping_address: string
    shipping_city: string
    shipping_state: string
    shipping_postal_code: string
    estimated_delivery: string
    notes?: string
  }
) {
  const cart = await getOrCreateCart(userId)

  const { data, error } = await supabase
    .from("orders")
    .insert({
      cart_id: cart.data?.id ?? null,
      user_id: userId,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      subtotal: orderData.subtotal,
      shipping_cost: orderData.shipping_cost,
      tax: orderData.tax,
      total: orderData.total,
      shipping_method: orderData.shipping_method,
      payment_method: orderData.payment_method,
      shipping_address: orderData.shipping_address,
      shipping_city: orderData.shipping_city,
      shipping_state: orderData.shipping_state,
      shipping_postal_code: orderData.shipping_postal_code,
      estimated_delivery_date: orderData.estimated_delivery,
      notes: orderData.notes,
    })
    .select()
    .single()

  return { data, error }
}

export async function addOrderItems(
  orderId: string,
  items: Array<{
    product_id: string
    seller_id: string
    product_name: string
    quantity: number
    unit_price: number
    price_type: "retail" | "wholesale"
    subtotal: number
  }>
) {
  const { error } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      seller_id: item.seller_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      price_type: item.price_type,
      subtotal: item.subtotal,
    }))
  )

  return { error }
}

export async function getUserOrders(userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      status,
      total,
      created_at,
      estimated_delivery_date,
      order_items(
        product_id,
        quantity,
        unit_price,
        subtotal,
        product_name,
        products(image_url, main_image_url)
      )
      `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return {
    data:
      data?.map((order) => ({
        ...order,
        estimated_delivery: order.estimated_delivery_date,
        order_items:
          order.order_items?.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: toNumber(item.unit_price),
            subtotal: toNumber(item.subtotal),
            product_name: item.product_name,
            products: {
              name: item.product_name,
              image_url:
                (item.products as { image_url?: string | null; main_image_url?: string | null } | null)?.image_url ||
                (item.products as { image_url?: string | null; main_image_url?: string | null } | null)?.main_image_url ||
                FALLBACK_PRODUCT_IMAGE,
            },
          })) ?? [],
      })) ?? [],
    error,
  }
}

export async function getOrderById(orderId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      status,
      subtotal,
      shipping_cost,
      tax,
      total,
      shipping_method,
      payment_method,
      notes,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_postal_code,
      customer_name,
      customer_phone,
      customer_email,
      tracking_number,
      estimated_delivery_date,
      created_at,
      order_items(
        id,
        product_id,
        quantity,
        unit_price,
        subtotal,
        product_name,
        products(image_url, main_image_url)
      )
      `
    )
    .eq("id", orderId)
    .single()

  return {
    data: data
      ? {
          ...data,
          estimated_delivery: data.estimated_delivery_date,
          notes: data.notes,
          order_items:
            data.order_items?.map((item) => ({
              id: item.id,
              product_id: item.product_id,
              quantity: item.quantity,
              price: toNumber(item.unit_price),
              subtotal: toNumber(item.subtotal),
              name: item.product_name,
              image:
                (item.products as { image_url?: string | null; main_image_url?: string | null } | null)?.image_url ||
                (item.products as { image_url?: string | null; main_image_url?: string | null } | null)?.main_image_url ||
                FALLBACK_PRODUCT_IMAGE,
            })) ?? [],
        }
      : null,
    error,
  }
}

export async function getProductReviews(productId: string) {
  const { data, error } = await supabase
    .from("product_reviews")
    .select(
      `
      id,
      rating,
      title,
      comment,
      helpful_count,
      created_at,
      users(full_name)
      `
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  return {
    data:
      data?.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.comment,
        helpful_count: review.helpful_count,
        created_at: review.created_at,
        users: {
          nombre:
            (review.users as { full_name?: string | null } | null)?.full_name || "Usuario",
        },
      })) ?? [],
    error,
  }
}

export async function addReview(
  productId: string,
  userId: string,
  review: {
    rating: number
    title: string
    content: string
  }
) {
  const { data, error } = await supabase
    .from("product_reviews")
    .insert({
      product_id: productId,
      user_id: userId,
      rating: review.rating,
      title: review.title,
      comment: review.content,
    })
    .select()

  return { data, error }
}

export async function getWishlist(userId: string) {
  const { data, error } = await supabase
    .from("product_favorites")
    .select(
      `
      id,
      products(
        id,
        name,
        image_url,
        main_image_url,
        retail_price,
        stock
      )
      `
    )
    .eq("user_id", userId)

  return {
    data:
      data?.map((item) => ({
        id: item.id,
        products: item.products
          ? {
              id: (item.products as { id: string }).id,
              name: (item.products as { name: string }).name,
              image_url:
                (item.products as { image_url?: string | null }).image_url ||
                (item.products as { main_image_url?: string | null }).main_image_url ||
                FALLBACK_PRODUCT_IMAGE,
              price: toNumber((item.products as { retail_price: number | string }).retail_price),
              stock: (item.products as { stock: number }).stock,
            }
          : null,
      })) ?? [],
    error,
  }
}

export async function addToWishlist(userId: string, productId: string) {
  const { data, error } = await supabase
    .from("product_favorites")
    .insert({ user_id: userId, product_id: productId })
    .select()

  return { data, error }
}

export async function removeFromWishlist(userId: string, productId: string) {
  const { error } = await supabase
    .from("product_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId)

  return { error }
}

export async function isInWishlist(userId: string, productId: string) {
  const { data, error } = await supabase
    .from("product_favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle()

  return { exists: !!data, error }
}

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order")
    .order("name")

  return { data, error }
}

export async function getSellerProducts(sellerId: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      seller_id,
      category_id,
      name,
      short_description,
      full_description,
      image_url,
      main_image_url,
      images_json,
      retail_price,
      wholesale_price,
      wholesale_min_quantity,
      stock,
      avg_rating,
      review_count,
      categories(id, name, slug)
      `
    )
    .eq("seller_id", sellerId)
    .eq("is_active", true)

  return {
    data: data?.map((row) => normalizeProduct(row as RawProductRow)) ?? [],
    error,
  }
}

export async function createProduct(
  sellerId: string,
  product: {
    category_id: string
    name: string
    description: string
    image_url: string
    images_array?: string[]
    price: number
    wholesale_price?: number
    minimum_wholesale_quantity?: number
    stock: number
  }
) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      seller_id: sellerId,
      category_id: product.category_id,
      name: product.name,
      slug: `${product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      short_description: product.description.slice(0, 255),
      full_description: product.description,
      main_image_url: product.image_url,
      images_json: product.images_array ?? [product.image_url],
      retail_price: product.price,
      wholesale_price: product.wholesale_price ?? null,
      wholesale_min_quantity: product.minimum_wholesale_quantity ?? 10,
      stock: product.stock,
      is_wholesale_available: !!product.wholesale_price,
    })
    .select()
    .single()

  return { data, error }
}

export async function updateProduct(
  productId: string,
  updates: Partial<{
    name: string
    description: string
    image_url: string
    images_array: string[]
    price: number
    wholesale_price: number
    minimum_wholesale_quantity: number
    stock: number
  }>
) {
  const payload: Record<string, unknown> = {}

  if (updates.name !== undefined) payload.name = updates.name
  if (updates.description !== undefined) {
    payload.short_description = updates.description.slice(0, 255)
    payload.full_description = updates.description
  }
  if (updates.image_url !== undefined) payload.main_image_url = updates.image_url
  if (updates.images_array !== undefined) payload.images_json = updates.images_array
  if (updates.price !== undefined) payload.retail_price = updates.price
  if (updates.wholesale_price !== undefined) payload.wholesale_price = updates.wholesale_price
  if (updates.minimum_wholesale_quantity !== undefined) {
    payload.wholesale_min_quantity = updates.minimum_wholesale_quantity
  }
  if (updates.stock !== undefined) payload.stock = updates.stock

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", productId)
    .select()
    .single()

  return { data, error }
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase.from("products").delete().eq("id", productId)
  return { error }
}

export async function getAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      status,
      total,
      created_at,
      users(full_name, email)
      `
    )
    .order("created_at", { ascending: false })

  return {
    data:
      data?.map((order) => ({
        ...order,
        users: {
          nombre: (order.users as { full_name?: string | null } | null)?.full_name || "",
          email: (order.users as { email?: string | null } | null)?.email || "",
        },
      })) ?? [],
    error,
  }
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false })

  return {
    data:
      data?.map((user) => ({
        id: user.id,
        email: user.email,
        nombre: user.full_name,
        user_type: user.role,
        created_at: user.created_at,
      })) ?? [],
    error,
  }
}

export async function getAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      seller_id,
      name,
      short_description,
      full_description,
      image_url,
      main_image_url,
      images_json,
      retail_price,
      wholesale_price,
      wholesale_min_quantity,
      stock,
      avg_rating,
      review_count,
      is_active,
      sellers(store_name)
      `
    )
    .order("created_at", { ascending: false })

  return {
    data:
      data?.map((row) => ({
        ...normalizeProduct(row as RawProductRow),
        is_active: (row as { is_active: boolean }).is_active,
      })) ?? [],
    error,
  }
}

export async function registerUser(userData: {
  nombre: string
  email: string
  password: string
  telefono: string
  role?: "buyer" | "seller"
  storeName?: string
}) {
  const role = userData.role || "buyer"
  const source = (userData.nombre.split(" ")[0] || "usuario").toLowerCase()
  const base = source.replace(/[^a-z0-9]+/g, "").slice(0, 18) || "usuario"
  const username = `${base}${Math.floor(Math.random() * 10000)}`

  const { data, error } = await supabase
    .from("users")
    .insert({
      username,
      email: userData.email,
      password_hash: userData.password,
      full_name: userData.nombre,
      phone: userData.telefono,
      role,
    })
    .select("id, email, full_name, phone, role")
    .single()

  if (error) {
    return { data: null, error }
  }

  if (role === "seller" && userData.storeName && data) {
    const { error: sellerError } = await supabase.from("sellers").insert({
      user_id: data.id,
      store_name: userData.storeName,
      location: "",
      description: "",
    })
    if (sellerError) {
      return { data: null, error: sellerError }
    }
  }

  return { data, error: null }
}

export async function getSellerByUserId(userId: string) {
  const { data, error } = await supabase
    .from("sellers")
    .select("id, store_name, description, location, is_verified, rating, user_id")
    .eq("user_id", userId)
    .single()

  return { data, error }
}

export async function updateSellerProfile(
  sellerId: string,
  updates: { store_name?: string; description?: string; location?: string }
) {
  const { data, error } = await supabase
    .from("sellers")
    .update(updates)
    .eq("id", sellerId)
    .select()
    .single()

  return { data, error }
}

export async function getAllSellerProducts(sellerId: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      seller_id,
      category_id,
      name,
      short_description,
      full_description,
      image_url,
      main_image_url,
      video_url,
      images_json,
      retail_price,
      wholesale_price,
      wholesale_min_quantity,
      stock,
      avg_rating,
      review_count,
      is_active,
      created_at,
      categories(id, name, slug)
      `
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })

  return {
    data:
      data?.map((row) => ({
        ...normalizeProduct(row as RawProductRow),
        is_active: (row as { is_active: boolean }).is_active,
        created_at: (row as { created_at: string }).created_at,
      })) ?? [],
    error,
  }
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  const { data, error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId)
    .select()
    .single()

  return { data, error }
}

export async function getSellerOrderItems(sellerId: string) {
  const { data: sellerProducts, error: prodError } = await supabase
    .from("products")
    .select("id")
    .eq("seller_id", sellerId)

  if (prodError || !sellerProducts?.length) return { data: [], error: prodError }

  const productIds = sellerProducts.map((p) => p.id)

  const { data, error } = await supabase
    .from("order_items")
    .select(
      `
      id,
      product_id,
      quantity,
      unit_price,
      subtotal,
      product_name,
      orders(id, order_number, status, total, created_at, customer_name, customer_email)
      `
    )
    .in("product_id", productIds)
    .order("created_at", { foreignTable: "orders", ascending: false })
    .limit(100)

  type RawOrderItem = {
    id: string
    product_id: string
    quantity: number
    unit_price: number | string
    subtotal: number | string
    product_name: string
    orders: {
      id: string
      order_number: string
      status: string
      total: number | string
      created_at: string
      customer_name: string
      customer_email: string
    } | null
  }

  return {
    data:
      data?.map((item) => {
        const raw = item as unknown as RawOrderItem
        return {
          id: raw.id,
          product_id: raw.product_id,
          quantity: raw.quantity,
          unit_price: toNumber(raw.unit_price),
          subtotal: toNumber(raw.subtotal),
          product_name: raw.product_name,
          order: raw.orders
            ? {
                id: raw.orders.id,
                order_number: raw.orders.order_number,
                status: raw.orders.status,
                total: toNumber(raw.orders.total),
                created_at: raw.orders.created_at,
                customer_name: raw.orders.customer_name,
                customer_email: raw.orders.customer_email,
              }
            : null,
        }
      }) ?? [],
    error,
  }
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, phone, role")
    .eq("email", email)
    .eq("password_hash", password)
    .single()

  return { data, error }
}

export async function getProductsForReels(ids: string[]) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      short_description,
      image_url,
      main_image_url,
      video_url,
      retail_price,
      wholesale_price,
      wholesale_min_quantity,
      stock,
      avg_rating,
      review_count,
      sellers(id, store_name, is_verified),
      categories(name)
      `
    )
    .in("id", ids)
    .eq("is_active", true)

  return {
    data: data?.map((row) => normalizeProduct(row as RawProductRow)) ?? [],
    error,
  }
}

// ── Shared Lists ──────────────────────────────────────────────────────────────

export async function createSharedList(userId: string, name: string) {
  const { data, error } = await supabase
    .from("shared_lists")
    .insert({ user_id: userId, name })
    .select("id, name, is_shared, share_token, created_at")
    .single()
  return { data, error }
}

export async function getUserSharedLists(userId: string) {
  const { data, error } = await supabase
    .from("shared_lists")
    .select("id, name, is_shared, share_token, created_at, shared_list_items(id)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return {
    data:
      data?.map((list) => ({
        id: list.id,
        name: list.name,
        is_shared: list.is_shared,
        share_token: list.share_token as string,
        created_at: list.created_at,
        item_count: Array.isArray(list.shared_list_items) ? list.shared_list_items.length : 0,
      })) ?? [],
    error,
  }
}

export async function getSharedListByToken(token: string) {
  const { data, error } = await supabase
    .from("shared_lists")
    .select(
      `
      id,
      name,
      is_shared,
      share_token,
      user_id,
      users(full_name, username),
      shared_list_items(
        id,
        product_id,
        products(id, name, image_url, main_image_url, retail_price, stock)
      )
      `
    )
    .eq("share_token", token)
    .single()

  if (error || !data) return { data: null, error }

  type RawItem = {
    id: string
    product_id: string
    products: {
      id: string
      name: string
      image_url: string | null
      main_image_url: string | null
      retail_price: number | string
      stock: number
    } | null
  }

  const items = (data.shared_list_items as unknown as RawItem[]) ?? []
  const creator = data.users as { full_name?: string | null; username?: string | null } | null

  return {
    data: {
      id: data.id,
      name: data.name,
      is_shared: data.is_shared,
      share_token: data.share_token as string,
      user_id: data.user_id,
      creator_name: creator?.full_name || creator?.username || "Usuario",
      items: items
        .filter((item) => item.products)
        .map((item) => ({
          item_id: item.id,
          product_id: item.product_id,
          name: item.products!.name,
          image_url:
            item.products!.image_url ||
            item.products!.main_image_url ||
            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
          price: toNumber(item.products!.retail_price),
          stock: item.products!.stock,
        })),
    },
    error: null,
  }
}

export async function addProductToSharedList(listId: string, productId: string) {
  const { data, error } = await supabase
    .from("shared_list_items")
    .upsert({ list_id: listId, product_id: productId }, { onConflict: "list_id,product_id" })
    .select()
  return { data, error }
}

export async function removeProductFromSharedList(listId: string, productId: string) {
  const { error } = await supabase
    .from("shared_list_items")
    .delete()
    .eq("list_id", listId)
    .eq("product_id", productId)
  return { error }
}

export async function updateSharedList(
  listId: string,
  updates: { name?: string; is_shared?: boolean }
) {
  const { data, error } = await supabase
    .from("shared_lists")
    .update(updates)
    .eq("id", listId)
    .select("id, name, is_shared, share_token")
    .single()
  return { data, error }
}

export async function deleteSharedList(listId: string) {
  const { error } = await supabase
    .from("shared_lists")
    .delete()
    .eq("id", listId)
  return { error }
}
