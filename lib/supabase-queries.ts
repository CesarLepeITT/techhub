import { supabase } from "./supabase"

// Products queries
export async function getProducts(limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      image_url,
      price,
      wholesale_price,
      minimum_wholesale_quantity,
      stock,
      rating,
      reviews_count,
      sellers(store_name)
      `,
      { count: "exact" }
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  return { data, error }
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      description,
      image_url,
      images_array,
      price,
      wholesale_price,
      minimum_wholesale_quantity,
      stock,
      rating,
      reviews_count,
      sellers(id, store_name, is_verified, rating),
      categories(name)
      `
    )
    .eq("id", id)
    .single()

  return { data, error }
}

export async function getProductsByCategory(categoryId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return { data, error }
}

export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      image_url,
      price,
      stock,
      rating,
      sellers(store_name)
      `
    )
    .ilike("name", `%${query}%`)
    .eq("is_active", true)
    .limit(20)

  return { data, error }
}

// Cart queries
export async function getCart(userId: string) {
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      product_id,
      quantity,
      products(id, name, image_url, price, wholesale_price, minimum_wholesale_quantity, stock)
      `
    )
    .eq("user_id", userId)

  return { data, error }
}

export async function addToCart(userId: string, productId: string, quantity: number) {
  const { data, error } = await supabase
    .from("cart_items")
    .upsert(
      { user_id: userId, product_id: productId, quantity },
      { onConflict: "user_id,product_id" }
    )
    .select()

  return { data, error }
}

export async function removeFromCart(cartItemId: string) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)

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
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)

  return { error }
}

// Orders queries
export async function createOrder(
  userId: string,
  orderData: {
    order_number: string
    subtotal: number
    shipping_cost: number
    tax: number
    total: number
    shipping_method: string
    payment_method: string
    shipping_address: string
    shipping_city: string
    shipping_state: string
    shipping_postal_code: string
    customer_phone: string
    customer_email: string
    estimated_delivery: string
  }
) {
  const { data, error } = await supabase
    .from("orders")
    .insert({ user_id: userId, ...orderData })
    .select()
    .single()

  return { data, error }
}

export async function addOrderItems(
  orderId: string,
  items: Array<{
    product_id: string
    quantity: number
    price: number
  }>
) {
  const itemsWithOrderId = items.map(item => ({
    order_id: orderId,
    ...item
  }))

  const { error } = await supabase
    .from("order_items")
    .insert(itemsWithOrderId)

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
      estimated_delivery,
      order_items(
        product_id,
        quantity,
        price,
        products(name, image_url)
      )
      `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return { data, error }
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
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_postal_code,
      customer_phone,
      customer_email,
      tracking_number,
      estimated_delivery,
      created_at,
      order_items(
        product_id,
        quantity,
        price,
        products(name, image_url)
      )
      `
    )
    .eq("id", orderId)
    .single()

  return { data, error }
}

// Reviews queries
export async function getProductReviews(productId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      rating,
      title,
      content,
      helpful_count,
      created_at,
      users(nombre)
      `
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  return { data, error }
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
    .from("reviews")
    .upsert({
      product_id: productId,
      user_id: userId,
      ...review
    })
    .select()

  return { data, error }
}

// Wishlist queries
export async function getWishlist(userId: string) {
  const { data, error } = await supabase
    .from("wishlist")
    .select(
      `
      id,
      products(id, name, image_url, price, stock)
      `
    )
    .eq("user_id", userId)

  return { data, error }
}

export async function addToWishlist(userId: string, productId: string) {
  const { data, error } = await supabase
    .from("wishlist")
    .insert({ user_id: userId, product_id: productId })
    .select()

  return { data, error }
}

export async function removeFromWishlist(userId: string, productId: string) {
  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId)

  return { error }
}

export async function isInWishlist(userId: string, productId: string) {
  const { data, error } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single()

  return { exists: !!data, error }
}

// Categories queries
export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  return { data, error }
}

// Seller products
export async function getSellerProducts(sellerId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", sellerId)
    .eq("is_active", true)

  return { data, error }
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
    .insert({ seller_id: sellerId, ...product })
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
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", productId)
    .select()
    .single()

  return { data, error }
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)

  return { error }
}

// Admin queries
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
      users(nombre, email)
      `
    )
    .order("created_at", { ascending: false })

  return { data, error }
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, nombre, user_type, created_at")
    .order("created_at", { ascending: false })

  return { data, error }
}

export async function getAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      price,
      stock,
      rating,
      is_active,
      sellers(store_name)
      `
    )
    .order("created_at", { ascending: false })

  return { data, error }
}
