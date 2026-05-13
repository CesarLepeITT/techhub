# CircuitMarket TJ — Resumen completo del chat y prompt para v0

Este documento resume todo lo trabajado en el chat sobre el hackathon **Build Your Own Marketplace** y consolida las ideas, decisiones técnicas, flujo de usuario, arquitectura, features inteligentes, estrategia de demo y prompt final para construir la app con v0.

---

## 1. Contexto del hackathon

El reto consiste en construir un marketplace funcional en 24 horas, ejecutándose en hardware real: una **Raspberry Pi 4** conectada a la red del evento. El jurado debe poder entrar desde su laptop usando la IP local de la Raspberry.

El proyecto debe parecer un marketplace real tipo Amazon, Mercado Libre, Shopify o Alibaba, pero construido y desplegado en hardware local.

### Requisitos mínimos del reto

El jurado espera que el marketplace tenga:

- Catálogo de productos.
- Búsqueda.
- Categorías.
- Detalle de producto.
- Carrito de compras.
- Checkout.
- Login y registro.
- Contraseñas con hash.
- Roles de usuario.
- Panel admin.
- CRUD de productos.
- Gestión de órdenes.
- Gestión de stock.
- Al menos dos métodos de envío.
- Diseño responsive.
- Deploy accesible en red local desde la Raspberry Pi.
- Documentación.
- Evidencia del uso de IA.

### Criterios de evaluación

- Funcionalidad: 25%.
- Documentación: 15%.
- Presentación: 15%.
- UI / UX: 10%.
- Raspberry Pi Deployment: 10%.
- Trabajo en equipo: 10%.
- Creatividad: 10%.
- Uso de IA: 5%.

La recomendación principal fue no intentar construir “Amazon completo”, sino un marketplace sólido, funcional end-to-end, desplegable en Raspberry Pi y con features creativas memorables.

---

## 2. Concepto final del proyecto

### Nombre recomendado

**CircuitMarket TJ**

### Concepto

Marketplace tech para Tijuana enfocado en:

- Componentes de PC.
- Laptops.
- Computadoras.
- Teléfonos.
- Electrónica.
- Arduino.
- Raspberry Pi.
- Cables.
- Herramientas.
- Refacciones.
- Kits para estudiantes.
- Kits para makers.
- Productos tipo Steren u OKDock, pero con identidad original.

### Tagline sugerido

> Tecnología, componentes y electrónica para makers de Tijuana.

### Pitch corto

> CircuitMarket TJ es un marketplace tech desplegado en una Raspberry Pi 4. Además del flujo completo de e-commerce, integra búsqueda conversacional, recomendaciones personalizadas por comportamiento, predicción experimental de intención de compra con XGBoost, precios mayoreo/menudeo, búsqueda con imagen, carrito compartible con link y QR, y una experiencia tipo short-video commerce llamada TechReels.

---

## 3. Stack recomendado

Para el hackathon se recomendó priorizar estabilidad y deploy sobre complejidad.

### Stack base sugerido para producción en Raspberry

- Raspberry Pi 4.
- Raspberry Pi OS.
- Apache o Nginx.
- PHP 8.
- MariaDB.
- Bootstrap/Tailwind o frontend generado con v0.
- JavaScript para tracking, autocomplete y UI dinámica.
- Python solo para modelo experimental XGBoost offline o simulado.
- Ngrok como respaldo, no como deploy principal.

### Stack sugerido para prototipo en v0

- Next.js App Router.
- TypeScript.
- React.
- Tailwind CSS.
- Estado local con `localStorage`.
- Mock data funcional.
- Capa de servicios preparada para conectar con PHP/MariaDB.

### Decisión técnica importante

Las features inteligentes no deben ser sistemas separados. Todas deben compartir una base de datos/eventos común:

- Búsquedas.
- Clicks.
- Hovers.
- Vistas de producto.
- Agregados al carrito.
- Visualizaciones de reels.
- Consultas al asistente IA.
- Búsqueda con imagen.
- Compartir carrito.

Desde esos eventos salen:

- Recomendaciones personalizadas.
- Predicción de intención de compra.
- XGBoost experimental.
- Autocomplete.
- Analytics para admin.
- Explicaciones de IA.

---

## 4. Funcionalidades definidas

Estas son todas las ideas que se decidió integrar:

### 4.1 Marketplace base obligatorio

- Home.
- Catálogo.
- Categorías.
- Búsqueda.
- Detalle de producto.
- Carrito persistente.
- Checkout.
- Login.
- Registro.
- Roles.
- Usuario comprador.
- Usuario vendedor.
- Admin.
- Panel vendedor.
- Panel admin.
- CRUD de productos.
- Gestión de stock.
- Gestión de órdenes.
- Métodos de envío.
- Diseño responsive.
- Deploy local desde Raspberry.

### 4.2 Alibaba-type chatbot

Una sección tipo asistente de compra donde el usuario escribe en lenguaje natural qué quiere o qué problema tiene.

Ejemplos:

- “Quiero armar una PC gamer barata.”
- “Necesito componentes para un robot seguidor de línea.”
- “Mi laptop está lenta, ¿qué puedo comprar para mejorarla?”
- “Busco regalos tech para alguien que estudia ingeniería.”
- “Necesito comprar cables HDMI por mayoreo.”
- “Quiero empezar con Arduino sin gastar mucho.”

El sistema debe detectar intención, mapear categorías/tags y devolver productos recomendados con explicación.

Nombre sugerido para la feature:

**Asistente de compra por intención**

### 4.3 Predictor de compra basado en comportamiento

El sistema debe inferir qué quiere comprar el usuario según:

- Búsquedas.
- Clicks.
- Productos vistos.
- Tiempo de hover.
- Productos agregados al carrito.
- Categorías visitadas.
- Reels vistos.
- Productos abiertos desde reels.
- Consultas al asistente IA.
- Búsqueda con imagen.

La recomendación principal fue implementar esto con heurísticas en tiempo real para que sea estable en demo.

### 4.4 Predictor de compra con XGBoost

Se recomendó incluir XGBoost como una capa experimental, no como dependencia crítica.

La UI debe mostrar algo como:

> Predicción experimental con XGBoost: 78% de probabilidad estimada de compra.

Y explicar:

> En el hackathon se usa inferencia simulada con eventos reales de sesión; el backend puede reemplazar este módulo por un modelo XGBoost entrenado con datos históricos.

### 4.5 Modo mayoreo y menudeo

Cada producto relevante debe tener:

- Precio menudeo.
- Precio mayoreo.
- Cantidad mínima para mayoreo.

En el carrito:

- Si la cantidad es menor al mínimo, se aplica precio menudeo.
- Si la cantidad alcanza el mínimo, se aplica precio mayoreo.
- Se muestra ahorro.
- Se muestra badge: “Mayoreo aplicado”.
- Si falta poco para mayoreo, se muestra mensaje: “Agrega X más para activar mayoreo”.

### 4.6 Predictor/autocomplete de búsqueda

Mientras el usuario escribe en la barra de búsqueda, aparecen sugerencias en vivo desde:

- Productos.
- Categorías.
- Tags.
- Búsquedas populares.
- Comportamiento del usuario.

Ejemplo:

Al escribir `ardu`:

- Arduino Uno.
- Kit Arduino.
- Sensores Arduino.
- Arduino / Raspberry Pi.

### 4.7 TechReels

Sección inspirada en short-video shopping, pero con identidad propia. No se debe copiar TikTok.

Nombre sugerido:

**TechReels**

Flujo:

- Usuario ve videos verticales de productos.
- Cada video tiene chip del producto.
- Se muestra precio, rating, vendedor y botón de agregar al carrito.
- Se puede abrir el detalle del producto.
- Cada interacción alimenta el predictor/recomendador.

### 4.8 Ngrok

Ngrok se usará como respaldo.

El deploy principal debe ser:

```text
http://IP-DE-LA-RASPBERRY/
```

Ngrok solo debe usarse si la red del evento falla o si se quiere mostrar acceso externo:

```bash
ngrok http 80
```

### 4.9 Carrito compartible con link y QR

Feature adicional de creatividad.

Flujo:

- Usuario arma un carrito.
- Presiona “Compartir carrito”.
- Se genera un link tipo `/shared-cart/demo-token`.
- Se muestra un QR.
- Otra persona abre el link y puede usar ese carrito.

Esto es fuerte para demo porque conecta con colaboración, ventas grupales y compras por mayoreo.

### 4.10 Usuarios compradores y vendedores

Roles definidos:

- Buyer / comprador.
- Seller / vendedor.
- Admin.

El vendedor puede:

- Crear productos.
- Editar productos.
- Eliminar productos.
- Ver órdenes de sus productos.
- Actualizar stock.
- Ver métricas.

El admin puede:

- Ver todos los productos.
- Ver todas las órdenes.
- Ver usuarios.
- Ver vendedores.
- Ver eventos.
- Ver analytics.
- Ver predicciones.
- Ver checklist del hackathon.

### 4.11 Búsqueda con imagen

Funcionalidad llamada:

**Buscar con imagen**

Flujo:

- Usuario sube una imagen.
- Se muestra preview.
- El sistema simula extracción de tags.
- Se sugieren productos relacionados.
- Se guarda evento `visual_search`.

Debe aclararse que en hackathon puede ser mock/inferencia simulada con contrato listo para conectar a modelo real.

---

## 5. Paleta de colores definida

Usar exactamente estos colores:

```text
#64ae63  -> verde primario
#9cccc4  -> mint suave
#84bcbf  -> teal/mint secundario
#f3f9f3  -> fondo principal
#040704  -> texto principal / negro verdoso
#D6EAD6  -> superficie suave
```

Uso recomendado:

- `#64ae63`: botones principales, CTAs, estados activos.
- `#9cccc4`: acentos suaves, chips, badges secundarios.
- `#84bcbf`: detalles de navegación, gradientes, estados hover.
- `#f3f9f3`: fondo global.
- `#040704`: texto fuerte.
- `#D6EAD6`: cards suaves, paneles, superficies elevadas.

---

## 6. Dirección visual final

La app debe ser:

- Moderna.
- Aesthetic.
- Minimalista.
- Pulida.
- Premium.
- Lista para producción.
- No debe parecer maqueta escolar.
- No debe parecer wireframe.
- No debe parecer template genérico.

Debe usar:

- Bordes suavizados.
- Cards con radios amplios.
- Sombras sutiles.
- Difuminados.
- Gradientes suaves.
- Glassmorphism controlado.
- Espaciado generoso.
- Microinteracciones.
- Estados hover.
- Estados de loading.
- Estados vacíos.
- Focus states accesibles.
- Toasts.
- Layout mobile-first.

Características visuales recomendadas:

- Cards con border-radius de 16px a 28px.
- Header sticky con blur y sombra suave.
- Bottom nav en mobile.
- Product cards premium.
- Dashboards limpios.
- Tablas estilizadas.
- Botones con hover lift.
- Search suggestions con blur.
- Modales/drawers pulidos.
- Hero con gradiente verde/mint.
- Blobs decorativos sutiles.

---

## 7. Flujo completo del usuario comprador

1. El usuario entra a Home desde la IP de la Raspberry.
2. Ve hero, categorías, productos destacados, recomendaciones y CTA para Asistente IA.
3. Busca un producto.
4. La barra muestra autocomplete.
5. Entra al detalle de producto.
6. El sistema registra vista de producto.
7. El usuario hace hover/click/agrega al carrito.
8. El sistema registra eventos.
9. El usuario aumenta cantidad.
10. Si alcanza mínimo, se activa mayoreo.
11. El carrito muestra ahorro.
12. El usuario comparte carrito con link y QR.
13. Procede a checkout.
14. Ingresa datos de envío.
15. Selecciona envío estándar, exprés o pickup.
16. Selecciona pago simulado.
17. Confirma orden.
18. Se genera resumen.
19. El admin puede ver la orden.
20. Las recomendaciones “Para ti” se actualizan con los eventos de sesión.

---

## 8. Flujo del asistente IA

1. Usuario entra a “Asistente IA”.
2. Escribe una necesidad en lenguaje natural.
3. El sistema detecta intención.
4. El sistema detecta categorías y tags.
5. El sistema calcula scores de productos.
6. Devuelve explicación en español.
7. Muestra productos recomendados.
8. Sugiere kit/bundle si aplica.
9. Permite agregar todo el kit al carrito.
10. Registra evento `assistant_query`.
11. Los productos recomendados alimentan el predictor.

Ejemplo:

Input:

```text
quiero empezar un proyecto de robótica barato
```

Output esperado:

- Arduino Uno.
- Protoboard.
- Jumpers.
- Sensor ultrasónico.
- Kit de resistencias.
- Chasis de robot.

Explicación:

> Te recomendamos estos productos porque mencionaste robótica, presupuesto bajo y proyecto inicial. Son componentes compatibles para un primer prototipo.

---

## 9. Flujo de TechReels

1. Usuario entra a TechReels.
2. Ve feed vertical mobile-first.
3. Cada reel tiene producto relacionado.
4. Puede dar like, guardar, compartir, ver producto o agregar al carrito.
5. Cada interacción registra evento.
6. Los productos vistos en reels aparecen después en recomendaciones.
7. En desktop se muestra como feed vertical dentro de marco tipo teléfono, pero con diseño original.

---

## 10. Flujo de búsqueda con imagen

1. Usuario entra a “Buscar con imagen”.
2. Sube una imagen.
3. Se muestra preview.
4. El sistema simula detección de tags.
5. Se muestran productos relacionados.
6. Se registra evento `visual_search`.
7. Los productos relacionados alimentan recomendaciones.

---

## 11. Flujo vendedor

1. Usuario se registra como vendedor.
2. Entra a Seller Dashboard.
3. Ve resumen de ventas, productos, órdenes y alertas de stock.
4. Agrega producto.
5. Define precio menudeo y mayoreo.
6. Define stock.
7. Define tags e imágenes.
8. Puede editar producto.
9. Puede ver órdenes relacionadas con sus productos.
10. Puede actualizar stock y estado de orden.

---

## 12. Flujo admin

1. Admin inicia sesión.
2. Entra a Admin Dashboard.
3. Ve KPIs:
   - Total de productos.
   - Total de órdenes.
   - Total de usuarios.
   - Total de vendedores.
   - Productos con stock bajo.
   - Revenue simulado.
   - Productos más vistos.
   - Términos más buscados.
4. Gestiona productos.
5. Gestiona órdenes.
6. Gestiona usuarios.
7. Gestiona vendedores.
8. Ve eventos.
9. Ve predicciones XGBoost mock.
10. Ve checklist del hackathon.

---

## 13. Eventos de comportamiento

Se definieron estos eventos:

```text
search_input
search_submit
autocomplete_click
product_hover
product_view
product_click
add_to_cart
quantity_change
checkout_started
shipping_selected
order_created
assistant_query
visual_search
reel_view
reel_product_click
reel_add_to_cart
share_cart_created
```

Regla especial para hover:

- Solo registrar `product_hover` si el usuario mantiene hover por al menos 800 ms.
- Evitar spam de eventos.

---

## 14. Scoring para recomendaciones

Pesos recomendados:

```text
add_to_cart: +10
checkout_started con producto en carrito: +8
product_view: +5
product_click: +4
reel_view: +4
visual_search_match: +4
search_match: +3
same_category_interest: +2
product_hover: +1
```

La sección “Para ti” debe mostrar productos con badges de explicación:

- Lo viste varias veces.
- Relacionado con tus búsquedas.
- Similar a productos en tu carrito.
- Popular en esta categoría.
- Precio mayoreo disponible.
- Coincide con tu intención.

---

## 15. Features para XGBoost experimental

Inputs sugeridos:

```text
viewsCount
clicksCount
hoverCount
searchMatches
addedToCart
sameCategoryViews
price
stock
hasWholesale
videoWatched
assistantMatched
visualSearchMatched
```

Output:

```text
probability: 0 a 1
explanation
top contributing factors
```

Texto recomendado en UI:

> Predicción experimental con XGBoost.

Nota recomendada:

> En el hackathon se usa inferencia simulada con eventos reales de sesión; el backend puede reemplazar este módulo por un modelo XGBoost entrenado con datos históricos.

---

## 16. Base de datos sugerida para backend real

Tablas principales:

```sql
users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120),
  email VARCHAR(160) UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('buyer','seller','admin') DEFAULT 'buyer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

sellers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  store_name VARCHAR(160),
  location VARCHAR(160),
  rating DECIMAL(3,2),
  verified TINYINT DEFAULT 0,
  description TEXT
);

categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120),
  slug VARCHAR(140),
  description TEXT
);

products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT,
  category_id INT,
  name VARCHAR(160),
  slug VARCHAR(180),
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2),
  wholesale_price DECIMAL(10,2),
  wholesale_min_quantity INT DEFAULT 10,
  stock INT DEFAULT 0,
  image_url VARCHAR(255),
  video_url VARCHAR(255),
  tags TEXT,
  rating DECIMAL(3,2),
  review_count INT DEFAULT 0,
  is_active TINYINT DEFAULT 1,
  is_featured TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  customer_name VARCHAR(120),
  customer_email VARCHAR(160),
  phone VARCHAR(40),
  address TEXT,
  city VARCHAR(120),
  notes TEXT,
  shipping_method ENUM('standard','express','pickup'),
  shipping_cost DECIMAL(10,2),
  payment_method VARCHAR(80),
  subtotal DECIMAL(10,2),
  total DECIMAL(10,2),
  status ENUM('pending','confirmed','shipped','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  product_name VARCHAR(160),
  quantity INT,
  unit_price DECIMAL(10,2),
  price_type ENUM('retail','wholesale'),
  subtotal DECIMAL(10,2)
);

carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(128),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT,
  product_id INT,
  quantity INT
);

user_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(128),
  event_type VARCHAR(50),
  product_id INT NULL,
  category_id INT NULL,
  query VARCHAR(255) NULL,
  value TEXT NULL,
  duration_ms INT NULL,
  metadata TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

search_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(128),
  query VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

purchase_predictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(128),
  product_id INT,
  probability DECIMAL(5,4),
  model_name VARCHAR(80),
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

shared_carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(160) UNIQUE,
  cart_data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 17. Contratos de API sugeridos

Aunque v0 use mock data, se recomendó preparar endpoints como:

```text
GET /api/products
GET /api/products/:id
GET /api/categories
POST /api/auth/register
POST /api/auth/login
GET /api/cart
POST /api/cart/items
PATCH /api/cart/items/:id
DELETE /api/cart/items/:id
POST /api/checkout
GET /api/orders
GET /api/admin/orders
POST /api/admin/products
PATCH /api/admin/products/:id
DELETE /api/admin/products/:id
POST /api/events
POST /api/assistant/query
POST /api/visual-search
GET /api/recommendations
GET /api/search/suggestions
POST /api/cart/share
```

---

## 18. Seguridad mínima recomendada

Para backend real en PHP:

- Usar `password_hash()`.
- Usar `password_verify()`.
- Usar sesiones.
- Proteger rutas admin por rol.
- Usar PDO con consultas preparadas.
- Escapar HTML con `htmlspecialchars()`.
- No guardar contraseñas en texto plano.
- Validar stock antes de checkout.
- No permitir compra si no hay inventario suficiente.

Ejemplo de protección admin:

```php
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header('Location: /login.php');
    exit;
}
```

---

## 19. Plan de 24 horas sugerido

### Hora 0–2

- Repo.
- Raspberry lista.
- Apache/Nginx.
- PHP.
- MariaDB.
- Schema.
- Seed.
- Página visible por IP.

### Hora 2–5

- Catálogo.
- Categorías.
- Detalle de producto.
- Búsqueda normal.

### Hora 5–8

- Login.
- Registro.
- Sesiones.
- Roles.

### Hora 8–11

- Carrito.
- Cantidades.
- Persistencia.
- Mayoreo/menudeo.

### Hora 11–14

- Checkout.
- Envío estándar/exprés/pickup.
- Creación de orden.
- Reducción de stock.

### Hora 14–16

- Admin panel.
- Productos.
- Stock.
- Órdenes.

### Hora 16–18

- Tracking de eventos.
- Recomendaciones heurísticas.

### Hora 18–19.5

- Autocomplete.

### Hora 19.5–21

- Asistente IA tipo Alibaba.

### Hora 21–22

- TechReels.

### Hora 22–23

- XGBoost experimental.
- Búsqueda con imagen si aún no está integrada.
- Compartir carrito si falta.

### Hora 23–24

- Ngrok.
- README.
- AI_USAGE.
- Pitch.
- Pruebas desde otra laptop.

Regla final:

> En la última hora no agregar features nuevas. Solo probar, pulir y estabilizar.

---

## 20. Demo ideal para el jurado

Flujo de demo recomendado:

1. Abrir app desde IP de la Raspberry.
2. Mostrar Home production-ready.
3. Buscar “arduino”.
4. Mostrar autocomplete.
5. Abrir producto Arduino.
6. Agregar cantidad hasta activar mayoreo.
7. Mostrar “Mayoreo aplicado”.
8. Compartir carrito.
9. Mostrar link y QR.
10. Checkout con envío exprés.
11. Confirmar orden.
12. Entrar como admin.
13. Mostrar orden creada.
14. Mostrar analytics/eventos.
15. Abrir Asistente IA.
16. Escribir: “quiero empezar un proyecto de robótica barato”.
17. Mostrar kit recomendado.
18. Agregar kit al carrito.
19. Abrir TechReels.
20. Agregar producto desde reel.
21. Abrir Buscar con imagen.
22. Subir imagen y mostrar matches.
23. Mostrar recomendaciones “Para ti”.
24. Mostrar predicción experimental XGBoost.
25. Cerrar con documentación y checklist.

---

## 21. Prompt principal para v0

Este fue el prompt consolidado recomendado para generar la app en v0.

```text
Create a complete responsive marketplace web app for a 24-hour hackathon.

Important context:
The uploaded images are only functional context for the ideas: product grids, AI shopping assistant, short-video shopping, smart recommendations, and search UX. Do NOT copy their visual design, logos, branding, colors, layout, or trademarked UI. Build an original app.

App name:
CircuitMarket TJ

Concept:
CircuitMarket TJ is a tech marketplace for Tijuana focused on PC components, laptops, phones, electronics, Arduino/Raspberry Pi parts, cables, tools, repair items, and student/maker kits. It must feel like a real local marketplace running on a Raspberry Pi 4 during a hackathon.

Primary goal:
Build a polished, functional, mobile-first marketplace prototype that satisfies the hackathon requirements:
- Product catalog
- Product search
- Categories
- Product detail page
- Persistent cart
- Checkout
- Shipping methods with at least two options
- Login and registration
- User roles
- Admin panel
- Product CRUD
- Order management
- Stock management
- Responsive UI
- Local network deployment compatibility
- Documentation section for Raspberry Pi deploy and AI usage

Use this color palette:
- Primary green: #64ae63
- Soft mint: #9cccc4
- Muted teal: #84bcbf
- Background: #f3f9f3
- Text / ink: #040704
- Soft surface: #D6EAD6

Design direction:
Use a clean, modern, original, production-grade marketplace design with a premium minimal aesthetic, soft rounded surfaces, subtle shadows, blurred panels, polished dashboards, refined product cards, and smooth microinteractions. The app should feel technical, trustworthy, fast, and local. Avoid copying Alibaba, TikTok, Steren, OKDock, Amazon, Mercado Libre, or Shopify. Use Spanish UI copy. Use rounded cards, clear spacing, accessible contrast, and a mobile-first layout.

Visual quality requirement:
The app must look like a real production-grade marketplace, not a school project, hackathon mockup, wireframe, or generic template. It must feel modern, aesthetic, minimalistic, polished, and commercially viable.

Design style:
Create a premium minimal tech-commerce interface with soft rounded borders, refined shadows, subtle gradients, glass-like blurred surfaces, smooth hover states, clean spacing, and strong visual hierarchy. The design should feel like a startup product already in production.

Use the color palette carefully:
- #64ae63 as primary action color
- #9cccc4 and #84bcbf as secondary accents
- #f3f9f3 as main background
- #040704 as main text color
- #D6EAD6 as soft card/surface color

Do not make the UI look childish, overly colorful, academic, or like a Bootstrap default template. Avoid harsh borders, flat unstyled tables, oversized icons, random colors, and cluttered layouts.

Visual system:
- Use large clean whitespace.
- Use rounded corners between 16px and 28px for cards, modals, search bars, product cards, and panels.
- Use subtle shadows, for example soft elevation on cards and stronger elevation on floating elements.
- Use background blur for overlays, floating assistant panels, cart drawer, search suggestions, and modals.
- Use smooth transitions for hover, focus, page states, add-to-cart feedback, and dropdowns.
- Use premium-looking product cards with consistent image containers, stable aspect ratios, and elegant price hierarchy.
- Use glassmorphism only in small controlled areas such as the header, AI assistant input, search suggestions, and floating cart summary.
- Use gradients subtly, not aggressively. Good examples: soft green-to-mint hero background, blurred decorative blobs, and subtle CTA highlights.
- Use icons consistently, preferably Lucide icons.
- Use typography that feels modern and professional. Use strong headings, readable body text, and clear numeric formatting for prices.
- Use MXN price formatting, for example $1,499.00 MXN.

Layout quality:
The app should feel like a real SaaS/e-commerce platform:
- Sticky premium header on desktop with slight blur and shadow.
- Mobile bottom navigation with clean rounded active states.
- Hero section with strong product-market positioning.
- Product grids with consistent spacing and responsive behavior.
- Dashboard pages should look like real admin software, with metric cards, clean tables, filters, badges, and empty/loading states.
- Forms should look production-ready with labels, helper text, validation states, and accessible focus rings.
- Modals, drawers, dropdowns, and cards should have polished spacing and animation.

Homepage aesthetic:
Create a strong production-style homepage:
- Hero title: “Tecnología, componentes y electrónica para makers de Tijuana”
- Subtitle: “Compra hardware, kits, refacciones y accesorios tech con recomendaciones inteligentes, mayoreo y entrega local.”
- Primary CTA: “Explorar productos”
- Secondary CTA: “Probar asistente IA”
- Include a premium AI search/assistant input inside the hero.
- Include floating preview cards showing “Mayoreo activo”, “Predicción IA”, “Entrega local” and “TechReels”.

AI Assistant aesthetic:
The AI Assistant page should look like a premium conversational commerce experience:
- Large centered prompt box with rounded corners and soft glow.
- Suggested prompt chips.
- Response cards with recommended products.
- Explanation badges such as “Coincide con tu intención”, “Compatible con Arduino”, “Precio mayoreo disponible”, “Ideal para estudiantes”.
- Bundle card with “Agregar kit completo al carrito”.
- Do not make it look like a basic chat clone. It should feel like an AI sourcing interface for commerce.

TechReels aesthetic:
The TechReels page should be original and production-ready:
- On mobile, use vertical full-screen cards with product overlays.
- On desktop, center the vertical reel inside a phone-like frame, with side panels for product details and recommendations.
- Use soft translucent overlays for product chip, price, rating, seller, and action buttons.
- Do not copy TikTok branding or exact layout. The feature name is TechReels.

Product cards aesthetic:
Each product card must look polished:
- White or soft mint surface.
- Rounded 24px corners.
- Subtle shadow.
- Image area with consistent aspect ratio.
- Product category badge.
- Product title with clean line clamp.
- Retail price and wholesale price clearly separated.
- “Mayoreo desde X piezas” badge.
- Stock badge.
- Rating.
- Add-to-cart button with smooth hover.
- Product cards should slightly lift on hover.

Cart and checkout aesthetic:
Cart should look like a real checkout experience:
- Clean order summary card.
- Shipping selector cards.
- Wholesale savings highlighted elegantly.
- Shared cart link and QR panel in a polished modal.
- Checkout steps or progress indicator.
- Confirmation page with premium success state.

Admin and seller dashboard aesthetic:
Dashboards should look like real production tools:
- Sidebar or top navigation depending on screen size.
- Metric cards with subtle gradients.
- Clean data tables with rounded containers.
- Status badges.
- Low-stock warnings.
- Filters and search.
- AI analytics panel with event stream and XGBoost prediction cards.
- Avoid ugly raw HTML tables.

Microinteractions:
Implement tasteful microinteractions:
- Button hover lift.
- Card hover elevation.
- Add-to-cart success animation or toast.
- Search suggestions fade/slide in.
- Loading skeletons for product grids.
- Smooth drawer/modal transitions.
- Active nav indicator animation.

Production polish:
Every page must include:
- Empty states
- Loading states where appropriate
- Error/validation states
- Toast notifications
- Accessible focus states
- Consistent spacing
- Responsive behavior
- No placeholder lorem ipsum
- No unfinished sections
- No “coming soon” except for intentionally marked future backend integrations

Quality bar:
Assume the app will be judged visually against real e-commerce products. It must look investor-demo ready, polished enough for a live pitch, and stable enough to present from a Raspberry Pi on a local network.

Tech expectations:
Generate a Next.js App Router application with TypeScript, React, Tailwind CSS, and reusable components. Use client-side state and mock data so the app works immediately in v0. Structure the code so it can later connect to PHP + MariaDB on a Raspberry Pi. Do not require Supabase, Firebase, Stripe, external auth, cloud-only services, or paid APIs. All AI features must have deterministic mock/fallback logic so the demo works without internet.

The app must be functional, not just static screens.

Core roles:
1. Buyer
2. Seller
3. Admin

Core navigation:
- Home
- Products
- Categories
- AI Assistant
- TechReels
- Visual Search
- Cart
- Checkout
- Login
- Register
- Buyer account
- Seller dashboard
- Admin dashboard
- Hackathon docs / deployment page

Data model:
Create TypeScript interfaces and mock data for:

User:
- id
- name
- email
- role: buyer | seller | admin
- avatar
- createdAt

Seller:
- id
- userId
- storeName
- location
- rating
- verified
- description

Category:
- id
- name
- slug
- icon
- description

Product:
- id
- sellerId
- categoryId
- name
- slug
- description
- shortDescription
- price
- wholesalePrice
- wholesaleMinQuantity
- stock
- images
- videoUrl
- tags
- rating
- reviewCount
- specs
- isActive
- isFeatured
- createdAt

CartItem:
- productId
- quantity
- appliedPriceType: retail | wholesale
- unitPrice
- subtotal

Order:
- id
- userId
- items
- subtotal
- shippingMethod
- shippingCost
- total
- status
- shippingAddress
- createdAt

UserEvent:
- id
- userId or sessionId
- eventType
- productId
- categoryId
- query
- durationMs
- metadata
- createdAt

PurchasePrediction:
- productId
- probability
- explanation
- features

Product categories:
- Componentes PC
- Laptops y computadoras
- Teléfonos
- Arduino / Raspberry Pi
- Electrónica
- Cables y adaptadores
- Herramientas
- Kits para estudiantes
- Ofertas mayoreo
- Accesorios

Mock products:
Create at least 28 realistic tech products with Spanish names, prices in MXN, stock, wholesale pricing, tags, specs, and categories. Include examples like SSD, RAM, Arduino Uno, Raspberry Pi case, protoboard, jumpers, sensores, multímetro, cautín, cable HDMI, cargador USB-C, mouse, teclado, laptop reacondicionada, monitor, gabinete, fuente, audífonos, teléfono reacondicionado, kit de robótica, kit de soldadura, adaptadores, etc.

Main app flow for buyers:
1. User lands on Home.
2. Home shows hero section, search bar with autocomplete, category pills, featured products, “Para ti” recommendations, wholesale deals, and a CTA for AI Assistant.
3. User can browse categories or search products.
4. Search must show live autocomplete predictions while typing.
5. User opens a product detail page.
6. Product detail shows images, price, wholesale price, wholesale minimum quantity, stock, seller, specs, rating, related products, AI purchase probability, and buttons to add to cart.
7. User adds products to cart.
8. Cart persists in localStorage and shows retail vs wholesale pricing.
9. If quantity reaches wholesaleMinQuantity, automatically apply wholesalePrice and show a visible “Precio mayoreo aplicado” badge.
10. User can change quantities, remove items, and share the cart.
11. Cart sharing must generate a copyable link and a QR code panel. If a QR library is available, use it. If not, create a styled QR placeholder component and isolate it so it can be replaced later.
12. User proceeds to checkout.
13. Checkout asks for name, email, phone, address, city, notes, and shipping method.
14. Shipping methods:
    - Entrega estándar: 3-5 días, $99 MXN
    - Entrega exprés: 24-48 horas, $179 MXN
    - Pickup local en Tijuana / campus: $0 MXN
15. Payment is simulated. Use “Pago contra entrega”, “Transferencia simulada”, and “Pago en pickup”.
16. On confirmation, generate an order summary page and reduce stock in the mock state.
17. Buyer account shows previous orders and saved/shared carts.

Seller flow:
1. User registers as seller or switches to seller mode.
2. Seller dashboard shows sales summary, products, orders, low-stock alerts, and product performance.
3. Seller can add/edit/delete products.
4. Product form includes name, category, description, price, wholesale price, wholesale minimum, stock, tags, images, video URL, specs, and active/inactive status.
5. Seller can see incoming orders for their products.
6. Seller can update stock and order status.

Admin flow:
1. Admin dashboard shows marketplace KPIs:
   - total products
   - total orders
   - total users
   - total sellers
   - low-stock products
   - simulated revenue
   - most viewed products
   - most searched terms
2. Admin can manage products, orders, stock, categories, users, and sellers.
3. Admin can see an “AI & Analytics” panel with:
   - captured events
   - search logs
   - product views
   - hover signals
   - cart additions
   - video interactions
   - XGBoost mock predictions
4. Admin has a hackathon checklist showing whether the required features are implemented:
   - Catálogo
   - Carrito
   - Checkout
   - Login/registro
   - Roles
   - Panel admin
   - Métodos de envío
   - Responsive
   - Deploy local
   - Documentación
   - Uso de IA

AI Assistant feature:
Create a page called “Asistente IA” inspired by Alibaba-style conversational sourcing, but with original UI.

User writes natural language needs, such as:
- “Quiero armar una PC gamer barata”
- “Necesito componentes para un robot seguidor de línea”
- “Mi laptop está lenta, ¿qué puedo comprar para mejorarla?”
- “Busco regalos tech para alguien que estudia ingeniería”
- “Necesito comprar cables HDMI por mayoreo”
- “Quiero empezar con Arduino sin gastar mucho”

The assistant must:
1. Accept a free-text prompt.
2. Detect intent using deterministic local logic based on keywords, tags, categories, price intent, and use case.
3. Return a short explanation in Spanish.
4. Show recommended products.
5. Suggest a bundle/kit when appropriate.
6. Show why each product was recommended.
7. Include “Agregar todo el kit al carrito”.
8. Save the assistant query as a user event.
9. Work without an external AI API.

The assistant should appear intelligent even with fallback logic. Use functions like:
- parseIntent(query)
- scoreProductsByIntent(query, products)
- buildRecommendationExplanation(query, matchedTags)
- createSuggestedBundle(products)

Do not claim the model is perfect. In UI, call it:
“Asistente de compra por intención”.

Behavior tracking and recommendation system:
Implement client-side event tracking with localStorage.

Track these events:
- search_input
- search_submit
- autocomplete_click
- product_hover
- product_view
- product_click
- add_to_cart
- quantity_change
- checkout_started
- shipping_selected
- order_created
- assistant_query
- visual_search
- reel_view
- reel_product_click
- reel_add_to_cart
- share_cart_created

Hover tracking rule:
Only register product_hover if the user hovers over a product for at least 800ms. Do not spam events.

Use these event weights for recommendations:
- add_to_cart: +10
- checkout_started with product in cart: +8
- product_view: +5
- product_click: +4
- reel_view: +4
- visual_search_match: +4
- search_match: +3
- same_category_interest: +2
- product_hover: +1

Create a “Para ti” recommendation section that updates based on the current session. Show:
- recommended product cards
- reason badges, such as “Lo viste varias veces”, “Relacionado con tus búsquedas”, “Similar a productos en tu carrito”, “Popular en esta categoría”

XGBoost purchase predictor:
Create a mock XGBoost-style purchase propensity system. It does not need real ML training inside the UI, but the code must be structured as if a real XGBoost model could later be plugged in.

Create a module:
purchasePredictor.ts

Input features:
- viewsCount
- clicksCount
- hoverCount
- searchMatches
- addedToCart
- sameCategoryViews
- price
- stock
- hasWholesale
- videoWatched
- assistantMatched
- visualSearchMatched

Output:
- probability from 0 to 1
- explanation
- top contributing factors

In the UI, show:
“Probabilidad estimada de compra: 78%”
“Factores: agregado al carrito, varias vistas, búsqueda relacionada, precio mayoreo disponible.”

Important wording:
Call this “Predicción experimental con XGBoost”. Add a note:
“En el hackathon se usa inferencia simulada con eventos reales de sesión; el backend puede reemplazar este módulo por un modelo XGBoost entrenado con datos históricos.”

Search autocomplete:
Implement a search bar with live predictions.

Suggestions should come from:
- product names
- categories
- popular searches from mock search logs
- tags
- user behavior

When typing “ardu”, suggest Arduino Uno, Kit Arduino, Sensores Arduino, Arduino / Raspberry Pi.
When typing “ssd”, suggest SSD SATA, SSD NVMe, actualizar laptop, almacenamiento.
When typing “pc”, suggest gabinete, fuente, RAM, GPU, kit PC gamer.

Each suggestion should have a type:
- Producto
- Categoría
- Búsqueda popular
- Recomendación

Visual search:
Create a page called “Buscar con imagen”.

Flow:
1. User uploads an image.
2. Show image preview.
3. Show simulated extracted tags, such as “cable”, “placa”, “laptop”, “ssd”, “arduino”, “herramienta”.
4. Match products using tags and categories.
5. Show recommended product cards.
6. Save visual_search event.
7. Include a clear note that this is a hackathon-ready interface with mock inference and an API contract ready for a real image-recognition model.

Do not require camera permissions. Use file upload.

TechReels:
Create a short-video shopping section called “TechReels”, not TikTok.

Mobile-first vertical video experience:
- Full-height vertical cards on mobile
- Product video/poster
- Seller name
- Product chip overlay
- Price
- Rating
- Like button
- Save button
- Share button
- Add to cart button
- View product button
- Swipe/scroll vertically between reels

Desktop:
Show a centered phone-like vertical feed.

Each reel must be linked to a product. On click:
- View product
- Add to cart
- Register reel_view and reel_product_click events

Use HTML5 video when videoUrl exists. If not, use a product poster card with animated/visual placeholder. Do not depend on external videos.

Wholesale/retail mode:
Every relevant product card and product detail must show:
- Menudeo price
- Mayoreo price
- Minimum quantity for wholesale

Cart behavior:
If quantity >= wholesaleMinQuantity:
- use wholesale price
- show “Mayoreo aplicado”
- show savings

If quantity < wholesaleMinQuantity:
- use retail price
- show message like “Agrega 3 más para activar mayoreo”

Shared cart:
Create a cart sharing feature:
1. Button: “Compartir carrito”
2. Generate a URL like /shared-cart/demo-token
3. Show copyable link
4. Show QR code or QR placeholder
5. Shared cart page reconstructs the cart from a mock token
6. Include CTA: “Usar este carrito”
7. Track share_cart_created event

Authentication:
Create mock login/register flows.
Roles:
- Buyer
- Seller
- Admin

Use mock users:
- buyer@circuitmarket.test
- seller@circuitmarket.test
- admin@circuitmarket.test

For production notes, show that PHP backend should use password_hash and password_verify, session cookies, and role checks. Do not suggest storing plaintext passwords in production.

Header:
Desktop:
- Logo
- Search with autocomplete
- Categories dropdown
- AI Assistant button
- TechReels
- Visual Search
- Seller Center
- Login/Register or user menu
- Cart icon with badge

Mobile:
- Top logo/search
- Bottom navigation:
  - Inicio
  - Buscar
  - IA
  - Reels
  - Carrito

Product cards:
Each card should include:
- image/poster
- category
- product name
- retail price
- wholesale price
- stock badge
- rating
- quick add button
- view button
- recommendation reason if applicable
- low stock warning when stock <= 5

Product detail:
Include:
- image gallery
- specs
- seller info
- stock
- retail/wholesale pricing
- quantity selector
- add to cart
- buy now
- share product
- related products
- purchase probability
- event tracking on view

Cart:
Include:
- item list
- quantity controls
- retail/wholesale price logic
- savings
- subtotal
- shipping estimator
- share cart link/QR
- checkout button
- empty cart state

Checkout:
Include:
- customer data form
- shipping form
- shipping method selector
- payment method selector
- order summary
- place order button
- validation
- confirmation page

Raspberry Pi and Ngrok documentation:
Create a route/page called /hackathon-docs.

This page must include:
1. Project description
2. Hackathon requirement checklist
3. Raspberry Pi deployment checklist
4. Local network access instructions
5. Ngrok fallback instructions
6. MariaDB schema outline
7. API contract outline
8. AI usage documentation
9. Known limitations
10. Demo script

Deployment checklist content:
- Raspberry Pi 4
- Install OS
- Configure SSH
- Connect to event network
- Install Nginx or Apache
- Install PHP and MariaDB for final backend
- Deploy frontend/static build or Node app behind Nginx
- Confirm access through http://RASPBERRY_LOCAL_IP
- Optional Ngrok fallback with ngrok http 80
- Test from another laptop on the event network

Important:
The primary deployment mode is local IP access through the event network. Ngrok is only a backup/fallback.

AI usage documentation:
Create a visible section explaining:
- AI was used to design the architecture
- AI helped generate UI flows
- AI helped plan the recommendation system
- AI helped define prompts and data structures
- Human decisions prioritized Raspberry Pi reliability, end-to-end marketplace functionality, and demo stability

API contract:
Even if using mock state, include a clean service layer prepared for backend endpoints:

GET /api/products
GET /api/products/:id
GET /api/categories
POST /api/auth/register
POST /api/auth/login
GET /api/cart
POST /api/cart/items
PATCH /api/cart/items/:id
DELETE /api/cart/items/:id
POST /api/checkout
GET /api/orders
GET /api/admin/orders
POST /api/admin/products
PATCH /api/admin/products/:id
DELETE /api/admin/products/:id
POST /api/events
POST /api/assistant/query
POST /api/visual-search
GET /api/recommendations
GET /api/search/suggestions
POST /api/cart/share

MariaDB schema outline:
Include tables:
- users
- sellers
- categories
- products
- orders
- order_items
- carts
- cart_items
- user_events
- search_logs
- purchase_predictions
- shared_carts

UX requirements:
- Mobile-first
- Fully responsive
- Keyboard accessible
- Good focus states
- Clear empty states
- Loading states
- Error states
- Accessible labels
- Buttons must be easy to tap on mobile
- No tiny unreadable text
- Use Spanish copy

Performance constraints:
Optimize for Raspberry Pi 4:
- Avoid heavy animations
- Avoid 3D
- Avoid unnecessary dependencies
- Lazy-load video/reel content
- Keep mock data reasonable
- Use simple deterministic algorithms
- Keep the UI fast

Important deliverable:
Generate the complete application structure with pages, components, mock data, utility functions, and state management. Do not create only a landing page. The user must be able to click through the complete demo flow:
Home → Search/autocomplete → Product → Cart → Share cart → Checkout → Order confirmation → Admin sees order → AI assistant recommends products → TechReels adds product → Visual search finds products → Recommendations update from tracked behavior.

Demo script built into /hackathon-docs:
1. Open app from Raspberry IP.
2. Search “arduino” and show autocomplete.
3. Open Arduino product.
4. Add quantity until wholesale activates.
5. Share cart and show QR.
6. Checkout with express shipping.
7. Confirm order.
8. Enter admin dashboard and show the order.
9. Open AI Assistant and type “quiero empezar un proyecto de robótica barato”.
10. Add suggested kit to cart.
11. Open TechReels and add a product from a reel.
12. Open Visual Search, upload an image, and show matched products.
13. Show “Para ti” recommendations and XGBoost experimental purchase probability.

Final visual instruction:
Do not generate a generic hackathon UI. Do not generate a plain academic prototype. Build a polished, modern, minimal, aesthetic marketplace that looks production-ready. The design must be original, premium, clean, responsive, and consistent across buyer, seller, admin, AI assistant, TechReels, visual search, cart, and checkout flows.

Final instruction:
Make the app polished, coherent, and hackathon-ready. Prioritize functionality and demo reliability over unnecessary complexity. Use the exact color palette provided. Keep the design original.
```

---

## 22. Nota sobre las imágenes de referencia

Las imágenes compartidas se interpretaron como contexto funcional, no como inspiración visual directa.

Se usaron para entender ideas como:

- Grid de productos.
- Asistente de compra tipo Alibaba.
- Reels con producto enlazado.
- Product chips en video.
- Búsqueda conversacional.
- Flujo visual de IA con base de datos, embeddings, API y web server.

Instrucción para v0:

> Las imágenes son contexto funcional. No copiar diseño, logos, layout, colores, branding ni interfaces registradas.

---

## 23. README recomendado

El proyecto debe incluir un `README.md` con:

```text
# CircuitMarket TJ

## Descripción
Marketplace tech para Tijuana desplegado en Raspberry Pi 4.

## Funcionalidades
- Catálogo
- Carrito
- Checkout
- Login/registro
- Roles
- Panel admin
- Panel vendedor
- Métodos de envío
- Mayoreo/menudeo
- Asistente IA
- Recomendaciones por comportamiento
- XGBoost experimental
- Autocomplete
- TechReels
- Búsqueda con imagen
- Carrito compartible con link y QR

## Stack
- Raspberry Pi 4
- Apache/Nginx
- PHP/MariaDB para backend final
- Next.js/Tailwind para frontend generado

## Instalación en Raspberry
...

## Deploy local
http://IP-DE-LA-RASPBERRY/

## Ngrok fallback
ngrok http 80

## Usuarios demo
buyer@circuitmarket.test
seller@circuitmarket.test
admin@circuitmarket.test

## Flujo de demo
...

## Limitaciones conocidas
...
```

---

## 24. AI_USAGE.md recomendado

El proyecto debe incluir un archivo `AI_USAGE.md`.

Contenido sugerido:

```md
# Uso de IA

Usamos IA para acelerar la planeación, arquitectura y diseño del marketplace CircuitMarket TJ.

## Herramientas usadas
- ChatGPT para ideación, arquitectura, prompts, flujos y documentación.
- v0 para generación de interfaz y prototipo funcional.

## Decisiones asistidas por IA
- Definición del concepto CircuitMarket TJ.
- Priorización de features.
- Diseño del flujo comprador/vendedor/admin.
- Diseño del sistema de eventos.
- Diseño del recomendador por comportamiento.
- Diseño del predictor experimental XGBoost.
- Prompt principal para v0.
- Documentación de deploy en Raspberry.

## Decisiones humanas
- Mantener deploy local como prioridad.
- Usar Ngrok solo como respaldo.
- Mantener IA con fallback determinístico.
- Priorizar demo end-to-end sobre complejidad innecesaria.
- Enfocar el marketplace en tecnología, electrónica y makers de Tijuana.

## Validación manual
Probamos que el usuario pueda buscar productos, agregar al carrito, activar mayoreo, compartir carrito, hacer checkout, ver órdenes en admin, usar el asistente IA, navegar TechReels, usar búsqueda con imagen y ver recomendaciones.

## Limitaciones
El predictor XGBoost puede usar inferencia simulada durante el hackathon. En producción se reemplazaría por un modelo entrenado con datos históricos reales.
```

---

## 25. Prioridad final para ganar

Orden de prioridad:

1. Deploy funcional en Raspberry accesible por IP.
2. Flujo completo usuario → carrito → checkout → orden.
3. Admin viendo y gestionando órdenes/productos.
4. Mayoreo/menudeo.
5. Asistente IA.
6. Tracking de eventos.
7. Recomendaciones personalizadas.
8. Autocomplete.
9. TechReels.
10. Compartir carrito con QR.
11. Búsqueda con imagen.
12. XGBoost experimental.
13. Ngrok como respaldo.
14. Documentación.
15. Pitch.

---

## 26. Resumen ejecutivo final

CircuitMarket TJ debe presentarse como un marketplace tech local, moderno y listo para producción, corriendo en una Raspberry Pi 4. La app combina el flujo básico obligatorio de e-commerce con features avanzadas de descubrimiento y personalización:

- Asistente de compra por intención.
- Recomendaciones por comportamiento.
- Predicción experimental XGBoost.
- Precios mayoreo/menudeo.
- Autocomplete inteligente.
- TechReels.
- Búsqueda con imagen.
- Carrito compartible con link y QR.
- Roles comprador/vendedor/admin.
- Admin analytics.
- Deploy local y Ngrok fallback.

La clave de la ejecución es mantener todo integrado por una misma capa de eventos y priorizar que el flujo end-to-end funcione sin fallos durante la demo.
