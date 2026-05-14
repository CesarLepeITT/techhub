# Configuración de Supabase para TechMarket

## Credenciales

Tu proyecto Supabase está conectado con las siguientes credenciales:
- **URL:** https://zmpndelllyisgsvsjkio.supabase.co
- **Publishable Key:** sb_publishable_ukWt9k7PYIU2vHkcZs3MhQ_KjmINWQ1

Estas credenciales están almacenadas en el archivo `.env.local` (no incluido en git).

## Instalación de paquetes

Se ha instalado el paquete `@supabase/supabase-js`:
```bash
npm install @supabase/supabase-js
```

## Estructura de la integración

### Archivos principales:

1. **lib/supabase.ts** - Cliente de Supabase
   - Inicializa el cliente de Supabase
   - Exporta la instancia para usar en toda la aplicación

2. **hooks/useAuth.ts** - Hook de autenticación
   - Maneja el estado de autenticación
   - Funciones: login, logout, checkAuth
   - Obtiene el perfil del usuario desde la base de datos

3. **app/registro/page.tsx** - Página de registro
   - Crea cuenta de usuario en Supabase Auth
   - Guarda el perfil en la tabla `users`
   - Si es vendedor, crea un registro en la tabla `sellers`

4. **app/iniciar-sesion/page.tsx** - Página de login
   - Autentica al usuario con email y contraseña
   - Redirige al dashboard después del login exitoso

## Tablas de base de datos requeridas

### Tabla: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  ubicacion VARCHAR(255),
  user_type VARCHAR(50) DEFAULT 'usuario',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla: sellers
```sql
CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  store_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Cómo usar en tus páginas

### Ejemplo 1: Usar el hook de autenticación

```typescript
import { useAuth } from "@/hooks/useAuth"

export default function MiComponente() {
  const { user, isAuthenticated, login, logout } = useAuth()

  if (!isAuthenticated) {
    return <div>Por favor inicia sesión</div>
  }

  return <div>Bienvenido, {user?.nombre}</div>
}
```

### Ejemplo 2: Hacer queries a la base de datos

```typescript
import { supabase } from "@/lib/supabase"

async function obtenerProductos() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .limit(10)

  if (error) console.error(error)
  return data
}
```

### Ejemplo 3: Insertar datos

```typescript
async function crearProducto(producto) {
  const { data, error } = await supabase
    .from("products")
    .insert(producto)
    .select()

  if (error) console.error(error)
  return data
}
```

## Row Level Security (RLS)

Para mayor seguridad, se recomienda habilitar RLS en las tablas de Supabase:

1. En el dashboard de Supabase, ve a Authentication > Policies
2. Habilita RLS en las tablas `users` y `sellers`
3. Crea políticas para que cada usuario solo pueda acceder a sus propios datos

## Variables de entorno

El archivo `.env.local` debe contener:
```
NEXT_PUBLIC_SUPABASE_URL=https://zmpndelllyisgsvsjkio.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ukWt9k7PYIU2vHkcZs3MhQ_KjmINWQ1
```

## Próximos pasos

1. **Crear las tablas** en el dashboard de Supabase
2. **Integrar más operaciones CRUD** en el resto de las páginas
3. **Implementar RLS policies** para mayor seguridad
4. **Configurar OAuth** (Google, GitHub) si es necesario
5. **Implementar manejo de sesiones** en middleware

## Referencia

- Documentación de Supabase: https://supabase.com/docs
- Cliente JavaScript: https://supabase.com/docs/reference/javascript/introduction
