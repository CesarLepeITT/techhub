# CircuitMarket TJ - Esquema de Base de Datos Completo

## Descripción General

Este documento contiene el esquema SQL completo para CircuitMarket TJ, un marketplace de tecnología y electrónica para Raspberry Pi 4. El esquema está diseñado para soportar:

- Gestión de usuarios con roles (comprador, vendedor, admin)
- Catálogo completo de productos
- Carrito persistente y checkout
- Órdenes y gestión de stock
- Sistema de mayoreo/menudeo
- Tracking de eventos de comportamiento
- Recomendaciones personalizadas
- Predicciones de compra (XGBoost)
- Búsqueda y autocomplete
- Carrito compartible
- Métricas y analytics

---

## Creación de la Base de Datos

```sql
CREATE DATABASE IF NOT EXISTS circuitmarket_tj 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE circuitmarket_tj;
```

---

## Tabla: users

Almacena información de todos los usuarios del marketplace (compradores, vendedores y administradores).

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(120) NOT NULL UNIQUE,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(160),
  phone VARCHAR(20),
  avatar_url VARCHAR(255),
  role ENUM('buyer', 'seller', 'admin') DEFAULT 'buyer',
  is_active TINYINT DEFAULT 1,
  is_email_verified TINYINT DEFAULT 0,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_created_at (created_at),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: sellers

Información adicional de vendedores. Relación uno-a-uno con users.

```sql
CREATE TABLE IF NOT EXISTS sellers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  store_name VARCHAR(160) NOT NULL,
  location VARCHAR(160),
  description TEXT,
  store_logo_url VARCHAR(255),
  store_banner_url VARCHAR(255),
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_products INT DEFAULT 0,
  total_sales INT DEFAULT 0,
  is_verified TINYINT DEFAULT 0,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_store_name (store_name),
  INDEX idx_rating (rating),
  INDEX idx_is_verified (is_verified),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: categories

Categorías de productos.

```sql
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  slug VARCHAR(140) NOT NULL UNIQUE,
  description TEXT,
  icon_name VARCHAR(50),
  parent_category_id INT NULL,
  display_order INT DEFAULT 0,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_parent_category_id (parent_category_id),
  INDEX idx_is_active (is_active),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: products

Catálogo principal de productos.

```sql
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  short_description VARCHAR(255),
  full_description TEXT,
  
  -- Precios
  retail_price DECIMAL(10,2) NOT NULL,
  wholesale_price DECIMAL(10,2),
  wholesale_min_quantity INT DEFAULT 10,
  
  -- Inventario
  stock INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  
  -- Multimedia
  main_image_url VARCHAR(255),
  images_json TEXT,
  video_url VARCHAR(255),
  
  -- Información de producto
  tags VARCHAR(500),
  specifications_json TEXT,
  sku VARCHAR(80) UNIQUE,
  
  -- Ratings y reviews
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  
  -- Estado
  is_active TINYINT DEFAULT 1,
  is_featured TINYINT DEFAULT 0,
  is_wholesale_available TINYINT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_seller_id (seller_id),
  INDEX idx_category_id (category_id),
  INDEX idx_slug (slug),
  INDEX idx_is_active (is_active),
  INDEX idx_is_featured (is_featured),
  INDEX idx_stock (stock),
  INDEX idx_rating (avg_rating),
  INDEX idx_created_at (created_at),
  INDEX idx_name (name),
  FULLTEXT INDEX ft_search (name, short_description, full_description, tags)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: product_reviews

Reseñas y calificaciones de productos.

```sql
CREATE TABLE IF NOT EXISTS product_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  order_item_id INT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(160),
  comment TEXT,
  helpful_count INT DEFAULT 0,
  is_verified_purchase TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_user_id (user_id),
  INDEX idx_rating (rating),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: carts

Carritos persistentes de usuarios.

```sql
CREATE TABLE IF NOT EXISTS carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(128) NOT NULL UNIQUE,
  is_shared TINYINT DEFAULT 0,
  shared_token VARCHAR(160) NULL,
  subtotal DECIMAL(10,2) DEFAULT 0.00,
  last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_shared_token (shared_token),
  INDEX idx_last_accessed (last_accessed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: cart_items

Ítems dentro de los carritos.

```sql
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_retail_price DECIMAL(10,2),
  unit_wholesale_price DECIMAL(10,2),
  applied_price_type ENUM('retail', 'wholesale') DEFAULT 'retail',
  subtotal DECIMAL(10,2),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_cart_id (cart_id),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: orders

Órdenes completadas.

```sql
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NULL,
  
  -- Información del cliente
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(160) NOT NULL,
  customer_phone VARCHAR(20),
  
  -- Dirección de envío
  shipping_address VARCHAR(255),
  shipping_city VARCHAR(120),
  shipping_state VARCHAR(120),
  shipping_postal_code VARCHAR(20),
  
  -- Detalles
  notes TEXT,
  
  -- Métodos
  shipping_method ENUM('standard', 'express', 'pickup') DEFAULT 'standard',
  shipping_cost DECIMAL(10,2) DEFAULT 0.00,
  payment_method ENUM('cash_on_delivery', 'transfer', 'pickup_payment', 'card') DEFAULT 'cash_on_delivery',
  
  -- Totales
  subtotal DECIMAL(10,2) NOT NULL,
  wholesale_savings DECIMAL(10,2) DEFAULT 0.00,
  tax DECIMAL(10,2) DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL,
  
  -- Estado
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  cancellation_reason VARCHAR(255),
  
  -- Tracking
  tracking_number VARCHAR(100),
  estimated_delivery_date DATE NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  shipped_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_order_number (order_number),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_customer_email (customer_email),
  INDEX idx_shipping_method (shipping_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: order_items

Ítems dentro de las órdenes.

```sql
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  seller_id INT NOT NULL,
  
  -- Información del producto
  product_name VARCHAR(160) NOT NULL,
  product_sku VARCHAR(80),
  
  -- Cantidades y precios
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  price_type ENUM('retail', 'wholesale') DEFAULT 'retail',
  subtotal DECIMAL(10,2) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE RESTRICT,
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id),
  INDEX idx_seller_id (seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: user_events

Tracking de eventos de comportamiento del usuario.

```sql
CREATE TABLE IF NOT EXISTS user_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(128),
  
  -- Información del evento
  event_type VARCHAR(50) NOT NULL,
  event_source VARCHAR(50),
  
  -- Contexto
  product_id INT NULL,
  category_id INT NULL,
  order_id INT NULL,
  
  -- Datos adicionales
  search_query VARCHAR(255),
  search_results_count INT,
  value DECIMAL(10,2),
  duration_ms INT,
  metadata JSON,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_event_type (event_type),
  INDEX idx_product_id (product_id),
  INDEX idx_created_at (created_at),
  INDEX idx_event_type_user (event_type, user_id),
  INDEX idx_event_type_created (event_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: search_logs

Historial de búsquedas realizadas.

```sql
CREATE TABLE IF NOT EXISTS search_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(128),
  
  -- Búsqueda
  query VARCHAR(255) NOT NULL,
  results_count INT DEFAULT 0,
  
  -- Filtros aplicados
  category_filter INT NULL,
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  
  -- Resultados
  selected_product_id INT NULL,
  result_position INT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (category_filter) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (selected_product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_query (query),
  INDEX idx_created_at (created_at),
  FULLTEXT INDEX ft_query (query)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: product_favorites

Productos favoritos/guardados del usuario.

```sql
CREATE TABLE IF NOT EXISTS product_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id),
  INDEX idx_user_id (user_id),
  INDEX idx_product_id (product_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: purchase_predictions

Predicciones de compra basadas en XGBoost.

```sql
CREATE TABLE IF NOT EXISTS purchase_predictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(128),
  product_id INT NOT NULL,
  
  -- Predicción
  probability DECIMAL(5,4),
  explanation TEXT,
  model_version VARCHAR(50),
  model_name VARCHAR(80),
  
  -- Features usados
  features_json TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_product_id (product_id),
  INDEX idx_probability (probability),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: assistant_queries

Consultas realizadas al asistente IA.

```sql
CREATE TABLE IF NOT EXISTS assistant_queries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(128),
  
  -- Consulta
  query TEXT NOT NULL,
  detected_intent VARCHAR(100),
  detected_categories JSON,
  detected_tags JSON,
  
  -- Respuesta
  explanation TEXT,
  recommended_products_json TEXT,
  suggested_bundle_json TEXT,
  
  -- Engagement
  products_added_to_cart INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_detected_intent (detected_intent),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: visual_searches

Búsquedas realizadas con imágenes.

```sql
CREATE TABLE IF NOT EXISTS visual_searches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(128),
  
  -- Imagen
  image_url VARCHAR(255),
  image_storage_path VARCHAR(255),
  
  -- Análisis
  extracted_tags JSON,
  confidence_scores JSON,
  
  -- Resultados
  matched_products_json TEXT,
  matched_categories JSON,
  
  -- Engagement
  selected_product_id INT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (selected_product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: tech_reels

Videos cortos estilo TechReels.

```sql
CREATE TABLE IF NOT EXISTS tech_reels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  seller_id INT NOT NULL,
  
  -- Contenido
  video_url VARCHAR(255) NOT NULL,
  poster_image_url VARCHAR(255),
  title VARCHAR(160),
  description TEXT,
  
  -- Engagement
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  add_to_cart_count INT DEFAULT 0,
  
  -- Estado
  is_active TINYINT DEFAULT 1,
  display_order INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_seller_id (seller_id),
  INDEX idx_is_active (is_active),
  INDEX idx_display_order (display_order),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: reel_interactions

Interacciones con TechReels.

```sql
CREATE TABLE IF NOT EXISTS reel_interactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reel_id INT NOT NULL,
  user_id INT NULL,
  session_id VARCHAR(128),
  
  -- Tipo de interacción
  interaction_type ENUM('view', 'like', 'save', 'share', 'add_to_cart', 'view_product') DEFAULT 'view',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (reel_id) REFERENCES tech_reels(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_reel_id (reel_id),
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_interaction_type (interaction_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: shared_carts

Carritos compartidos con token.

```sql
CREATE TABLE IF NOT EXISTS shared_carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  original_cart_id INT,
  original_user_id INT NULL,
  
  -- Token de compartir
  share_token VARCHAR(160) NOT NULL UNIQUE,
  share_link VARCHAR(255),
  qr_code_url VARCHAR(255),
  
  -- Datos del carrito
  cart_data_snapshot JSON,
  subtotal DECIMAL(10,2),
  
  -- Accesos
  access_count INT DEFAULT 0,
  last_accessed TIMESTAMP NULL,
  
  -- Expiración
  expires_at TIMESTAMP NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (original_cart_id) REFERENCES carts(id) ON DELETE SET NULL,
  FOREIGN KEY (original_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_share_token (share_token),
  INDEX idx_original_user_id (original_user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: recommendations

Recomendaciones personalizadas pre-calculadas.

```sql
CREATE TABLE IF NOT EXISTS recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(128),
  
  -- Producto recomendado
  product_id INT NOT NULL,
  
  -- Razones de recomendación
  recommendation_reason VARCHAR(100),
  confidence_score DECIMAL(5,4),
  
  -- Features que influyeron
  influencing_features JSON,
  
  -- Timestamps
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  displayed_at TIMESTAMP NULL,
  clicked_at TIMESTAMP NULL,
  added_to_cart_at TIMESTAMP NULL,
  purchased_at TIMESTAMP NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_product_id (product_id),
  INDEX idx_confidence_score (confidence_score),
  INDEX idx_calculated_at (calculated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: user_sessions

Sesiones de usuario para tracking.

```sql
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(128) NOT NULL UNIQUE,
  
  -- Información de sesión
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  device_type VARCHAR(50),
  
  -- Actividad
  events_count INT DEFAULT 0,
  products_viewed INT DEFAULT 0,
  search_count INT DEFAULT 0,
  
  -- Conversión
  orders_placed INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  
  -- Timestamps
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_started_at (started_at),
  INDEX idx_last_activity (last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: inventory_logs

Historial de cambios en el inventario.

```sql
CREATE TABLE IF NOT EXISTS inventory_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  seller_id INT NOT NULL,
  
  -- Cambio
  old_quantity INT,
  new_quantity INT,
  change_quantity INT,
  change_reason ENUM('purchase', 'restock', 'adjustment', 'return', 'damage') DEFAULT 'adjustment',
  
  -- Contexto
  order_id INT NULL,
  notes VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_product_id (product_id),
  INDEX idx_seller_id (seller_id),
  INDEX idx_change_reason (change_reason),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: order_status_history

Historial de cambios de estado de órdenes.

```sql
CREATE TABLE IF NOT EXISTS order_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  
  -- Estado
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  
  -- Información
  notes TEXT,
  updated_by INT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_order_id (order_id),
  INDEX idx_new_status (new_status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: promotional_codes

Códigos promocionales y cupones.

```sql
CREATE TABLE IF NOT EXISTS promotional_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  
  -- Descuento
  discount_type ENUM('fixed', 'percentage') DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL,
  maximum_discount DECIMAL(10,2),
  
  -- Restricciones
  min_purchase_amount DECIMAL(10,2),
  max_uses INT,
  current_uses INT DEFAULT 0,
  max_uses_per_user INT DEFAULT 1,
  
  -- Validez
  valid_from DATETIME,
  valid_until DATETIME,
  is_active TINYINT DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_code (code),
  INDEX idx_is_active (is_active),
  INDEX idx_valid_until (valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: promotional_code_usage

Uso de códigos promocionales.

```sql
CREATE TABLE IF NOT EXISTS promotional_code_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code_id INT NOT NULL,
  order_id INT,
  user_id INT,
  
  -- Aplicación
  discount_applied DECIMAL(10,2),
  
  -- Timestamps
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (code_id) REFERENCES promotional_codes(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_code_id (code_id),
  INDEX idx_user_id (user_id),
  INDEX idx_used_at (used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: seller_ratings

Calificaciones de vendedores.

```sql
CREATE TABLE IF NOT EXISTS seller_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  user_id INT NOT NULL,
  order_id INT,
  
  -- Calificación
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  -- Aspectos evaluados
  product_quality INT CHECK (product_quality >= 1 AND product_quality <= 5),
  shipping_speed INT CHECK (shipping_speed >= 1 AND shipping_speed <= 5),
  communication INT CHECK (communication >= 1 AND communication <= 5),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_seller_id (seller_id),
  INDEX idx_user_id (user_id),
  INDEX idx_rating (rating),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: api_keys

Claves de API para integraciones.

```sql
CREATE TABLE IF NOT EXISTS api_keys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT,
  admin_id INT,
  
  -- Clave
  key_name VARCHAR(120) NOT NULL,
  api_key VARCHAR(255) NOT NULL UNIQUE,
  api_secret VARCHAR(255),
  
  -- Permisos
  permissions JSON,
  
  -- Uso
  last_used TIMESTAMP NULL,
  request_count INT DEFAULT 0,
  
  -- Estado
  is_active TINYINT DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_api_key (api_key),
  INDEX idx_seller_id (seller_id),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: analytics_daily_snapshot

Snapshot diario de analytics.

```sql
CREATE TABLE IF NOT EXISTS analytics_daily_snapshot (
  id INT AUTO_INCREMENT PRIMARY KEY,
  snapshot_date DATE NOT NULL UNIQUE,
  
  -- Usuarios
  total_users INT DEFAULT 0,
  new_users INT DEFAULT 0,
  active_users INT DEFAULT 0,
  
  -- Productos
  total_products INT DEFAULT 0,
  active_products INT DEFAULT 0,
  low_stock_products INT DEFAULT 0,
  
  -- Órdenes
  total_orders INT DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0.00,
  avg_order_value DECIMAL(10,2) DEFAULT 0.00,
  
  -- Engagement
  total_searches INT DEFAULT 0,
  total_product_views INT DEFAULT 0,
  total_add_to_cart INT DEFAULT 0,
  
  -- Conversión
  conversion_rate DECIMAL(5,4) DEFAULT 0.00,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_snapshot_date (snapshot_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabla: contact_messages

Mensajes de contacto de usuarios.

```sql
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  sender_email VARCHAR(160),
  subject VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  
  -- Clasificación
  message_type VARCHAR(50),
  status ENUM('new', 'read', 'responded', 'closed') DEFAULT 'new',
  
  -- Respuesta
  response_text TEXT,
  responded_by INT,
  responded_at TIMESTAMP NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Índices de Rendimiento Adicionales

```sql
-- Índices para búsquedas comunes
CREATE INDEX idx_products_active_stock ON products(is_active, stock);
CREATE INDEX idx_products_featured ON products(is_featured, created_at);
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- Índices para reportes
CREATE INDEX idx_events_date_range ON user_events(created_at, event_type);
CREATE INDEX idx_orders_revenue ON orders(status, created_at, total);
```

---

## Vistas (Views) para Reportes

```sql
-- Vista: Productos con información de vendedor
CREATE OR REPLACE VIEW v_products_with_seller AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.retail_price,
  p.wholesale_price,
  p.stock,
  p.avg_rating,
  p.review_count,
  p.view_count,
  s.id as seller_id,
  s.store_name,
  s.location,
  s.rating as seller_rating,
  c.name as category_name,
  p.created_at,
  p.is_active
FROM products p
JOIN sellers s ON p.seller_id = s.id
JOIN categories c ON p.category_id = c.id;

-- Vista: Órdenes con totales y estado
CREATE OR REPLACE VIEW v_orders_summary AS
SELECT 
  o.id,
  o.order_number,
  o.user_id,
  o.customer_name,
  o.customer_email,
  o.subtotal,
  o.wholesale_savings,
  o.total,
  o.status,
  o.shipping_method,
  COUNT(oi.id) as item_count,
  o.created_at,
  o.shipped_at,
  o.delivered_at
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.user_id, o.customer_name, o.customer_email, 
         o.subtotal, o.wholesale_savings, o.total, o.status, o.shipping_method, 
         o.created_at, o.shipped_at, o.delivered_at;

-- Vista: Vendedores con estadísticas
CREATE OR REPLACE VIEW v_seller_statistics AS
SELECT 
  s.id,
  s.user_id,
  s.store_name,
  s.location,
  COUNT(DISTINCT p.id) as product_count,
  COUNT(DISTINCT CASE WHEN p.stock > 0 THEN p.id END) as products_in_stock,
  SUM(p.stock) as total_stock,
  COUNT(DISTINCT oi.order_id) as total_orders,
  SUM(oi.quantity) as items_sold,
  SUM(oi.subtotal) as total_revenue,
  AVG(sr.rating) as avg_seller_rating,
  s.is_verified,
  s.created_at
FROM sellers s
LEFT JOIN products p ON s.id = p.seller_id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN seller_ratings sr ON s.id = sr.seller_id
GROUP BY s.id, s.user_id, s.store_name, s.location, s.is_verified, s.created_at;

-- Vista: Productos de bajo stock
CREATE OR REPLACE VIEW v_low_stock_products AS
SELECT 
  p.id,
  p.name,
  p.sku,
  p.stock,
  p.low_stock_threshold,
  s.store_name,
  s.user_id,
  c.name as category_name,
  p.retail_price,
  p.updated_at
FROM products p
JOIN sellers s ON p.seller_id = s.id
JOIN categories c ON p.category_id = c.id
WHERE p.stock <= p.low_stock_threshold AND p.is_active = 1;
```

---

## Procedimientos Almacenados (Stored Procedures)

```sql
-- Actualizar stock después de una orden
DELIMITER //
CREATE PROCEDURE sp_update_stock_from_order(IN order_id INT)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  
  START TRANSACTION;
  
  UPDATE products p
  JOIN order_items oi ON p.id = oi.product_id
  SET p.stock = p.stock - oi.quantity
  WHERE oi.order_id = order_id;
  
  INSERT INTO inventory_logs (product_id, seller_id, old_quantity, change_quantity, change_reason, order_id)
  SELECT 
    oi.product_id,
    oi.seller_id,
    p.stock + oi.quantity,
    -oi.quantity,
    'purchase',
    order_id
  FROM order_items oi
  JOIN products p ON oi.product_id = p.id
  WHERE oi.order_id = order_id;
  
  COMMIT;
END //
DELIMITER ;

-- Calcular recomendaciones para un usuario
DELIMITER //
CREATE PROCEDURE sp_calculate_user_recommendations(IN p_user_id INT, IN p_session_id VARCHAR(128))
BEGIN
  INSERT INTO recommendations (user_id, session_id, product_id, recommendation_reason, confidence_score)
  SELECT 
    p_user_id,
    p_session_id,
    p.id,
    'viewed_similar',
    0.75
  FROM products p
  WHERE p.id NOT IN (
    SELECT DISTINCT product_id FROM user_events 
    WHERE user_id = p_user_id OR session_id = p_session_id
  )
  LIMIT 10;
END //
DELIMITER ;

-- Limpiar datos antiguos
DELIMITER //
CREATE PROCEDURE sp_cleanup_old_data()
BEGIN
  DELETE FROM user_events WHERE created_at < DATE_SUB(NOW(), INTERVAL 180 DAY);
  DELETE FROM search_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 180 DAY);
  DELETE FROM user_sessions WHERE ended_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
  DELETE FROM shared_carts WHERE expires_at < NOW();
END //
DELIMITER ;
```

---

## Consultas de Ejemplo Útiles

```sql
-- Productos más vistos
SELECT 
  p.id,
  p.name,
  p.view_count,
  c.name as category,
  s.store_name,
  p.retail_price
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN sellers s ON p.seller_id = s.id
WHERE p.is_active = 1
ORDER BY p.view_count DESC
LIMIT 20;

-- Términos de búsqueda más populares
SELECT 
  query,
  COUNT(*) as frequency,
  COUNT(DISTINCT session_id) as unique_sessions,
  SUM(CASE WHEN selected_product_id IS NOT NULL THEN 1 ELSE 0 END) as click_through_count
FROM search_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY query
ORDER BY frequency DESC
LIMIT 30;

-- Usuarios más activos
SELECT 
  u.id,
  u.username,
  u.email,
  COUNT(DISTINCT CASE WHEN ue.event_type IN ('product_view', 'search_submit', 'product_click') THEN ue.id END) as activity_count,
  COUNT(DISTINCT ue.session_id) as sessions,
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.total) as total_spent
FROM users u
LEFT JOIN user_events ue ON u.id = ue.user_id
LEFT JOIN orders o ON u.id = o.user_id
WHERE ue.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.id, u.username, u.email
ORDER BY activity_count DESC;

-- Rendimiento de vendedores
SELECT 
  s.id,
  s.store_name,
  COUNT(DISTINCT p.id) as productos_activos,
  COUNT(DISTINCT oi.order_id) as ordenes_completas,
  SUM(oi.quantity) as unidades_vendidas,
  SUM(oi.subtotal) as ingresos_totales,
  AVG(sr.rating) as calificacion_promedio,
  s.is_verified
FROM sellers s
LEFT JOIN products p ON s.id = p.seller_id AND p.is_active = 1
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN seller_ratings sr ON s.id = sr.seller_id
WHERE s.is_active = 1
GROUP BY s.id, s.store_name, s.is_verified
ORDER BY ingresos_totales DESC;

-- Análisis de carrito abandonado
SELECT 
  c.id as cart_id,
  c.user_id,
  u.email,
  COUNT(ci.id) as item_count,
  SUM(ci.subtotal) as cart_total,
  TIMESTAMPDIFF(HOUR, c.last_accessed, NOW()) as hours_since_access,
  c.created_at
FROM carts c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
LEFT JOIN users u ON c.user_id = u.id
WHERE c.id NOT IN (SELECT DISTINCT cart_id FROM orders)
  AND c.last_accessed < DATE_SUB(NOW(), INTERVAL 24 HOUR)
  AND ci.id IS NOT NULL
GROUP BY c.id, c.user_id, u.email, c.created_at
ORDER BY cart_total DESC;
```

---

## Restricciones y Validaciones

```sql
-- Validar precios
ALTER TABLE products 
ADD CONSTRAINT chk_prices CHECK (retail_price > 0 AND (wholesale_price IS NULL OR wholesale_price > 0));

-- Validar cantidades
ALTER TABLE cart_items 
ADD CONSTRAINT chk_quantity CHECK (quantity > 0);

-- Validar stock
ALTER TABLE products 
ADD CONSTRAINT chk_stock CHECK (stock >= 0);

-- Validar descuentos
ALTER TABLE promotional_codes 
ADD CONSTRAINT chk_discount CHECK (discount_value > 0);
```

---

## Configuración de Backups

Se recomienda realizar backups diarios:

```bash
# Backup completo
mysqldump -u root -p circuitmarket_tj > circuitmarket_tj_$(date +%Y%m%d).sql

# Backup solo estructura
mysqldump -u root -p --no-data circuitmarket_tj > circuitmarket_tj_schema_$(date +%Y%m%d).sql

# Backup comprimido
mysqldump -u root -p circuitmarket_tj | gzip > circuitmarket_tj_$(date +%Y%m%d).sql.gz
```

---

## Notas de Migración y Implementación

1. **Orden de creación**: Las tablas deben crearse en este orden:
   - Tablas base (users, sellers, categories)
   - Tablas de productos
   - Tablas de órdenes
   - Tablas de tracking
   - Tablas de recomendaciones

2. **Datos de prueba**: Se proporcionarán scripts de seed con datos iniciales

3. **Performance**: 
   - Crear índices después de insertar datos iniciales
   - Usar `EXPLAIN` para optimizar queries lentas
   - Monitorear tamaño de tablas grandes (user_events, search_logs)

4. **Seguridad**:
   - Usar prepared statements en el backend
   - Nunca usar concatenación de strings en queries
   - Validar todas las entradas del usuario
   - Usar contraseñas con hash (bcrypt o argon2)

5. **Mantenimiento**:
   - Ejecutar `OPTIMIZE TABLE` mensualmente
   - Monitorear crecimiento de tablas
   - Hacer backups regularmente
   - Revisar logs de errores periódicamente

---

## Compatibilidad

- **MariaDB**: 10.5+
- **MySQL**: 5.7+
- **Charset**: utf8mb4 (soporta emojis y caracteres especiales)
- **Storage Engine**: InnoDB (transacciones, foreign keys)

---

## Total de Tablas: 23

- users
- sellers
- categories
- products
- product_reviews
- carts
- cart_items
- orders
- order_items
- user_events
- search_logs
- product_favorites
- purchase_predictions
- assistant_queries
- visual_searches
- tech_reels
- reel_interactions
- shared_carts
- recommendations
- user_sessions
- inventory_logs
- order_status_history
- promotional_codes
- promotional_code_usage
- seller_ratings
- api_keys
- analytics_daily_snapshot
- contact_messages
