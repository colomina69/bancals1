# Plan de Implementación: Bancals (Actualizado)

Bancals es una app móvil profesional (Expo + React Native) para gestión agrícola geoespacial. Permite a los usuarios digitalizar sus explotaciones: trazar perímetros de fincas con GPS de alta resolución y catalogar individualmente sus árboles por especie en un mapa satelital.

---

## Puntos de revisión corregidos

> [!IMPORTANT]
> **Supabase**: Se utilizará el proyecto existente `castell` (ID: `fvldizxrknwnmotwmsck`). Las tablas `fincas` y `arboles` ya existen pero se ajustarán/migrarán al nuevo esquema si es necesario para Bancals.

> [!NOTE]
> **Registro**: Se ha incluido el campo `username` en el proceso de registro para vincularlo al perfil del usuario.

> [!TIP]
> **Clustering**: Se implementará `Marker Clustering` desde el primer día para asegurar un rendimiento fluido con cientos de árboles.

---

## Fase 1 — Fundación: Proyecto, BD y Auth

### 1.1 Inicialización del proyecto Expo
- `npx create-expo-app@latest ./ --template blank-typescript`
- Instalación de dependencias:
  - `expo-router`, `nativewind`, `tailwindcss`, `@supabase/supabase-js`, `expo-secure-store`, `react-native-maps`, `expo-location`, `expo-haptics`.
  - `react-native-map-clustering` para el clustering de marcadores.

### 1.2 Configuración de Supabase (Migraciones SQL)
Utilizaremos el proyecto `fvldizxrknwnmotwmsck`. Aplicaremos una migración para asegurar que las tablas coinciden con el PRD de Bancals:

```sql
-- Asegurar PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabla profiles (con username)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  updated_at timestamptz DEFAULT now(),
  username text
);

-- Tabla tree_species
CREATE TABLE IF NOT EXISTS tree_species (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  color_code text NOT NULL DEFAULT '#4CAF50'
);

-- Tabla farms (Ajuste de la tabla fincas existente)
CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  boundary geography(Polygon, 4326),
  area_m2 float GENERATED ALWAYS AS (ST_Area(boundary::geometry)) STORED
);

-- Tabla trees (Ajuste de la tabla arboles existente)
CREATE TABLE IF NOT EXISTS trees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  species_id uuid NOT NULL REFERENCES tree_species(id),
  location geography(Point, 4326) NOT NULL
);
```

### 1.3 Autenticación con Username
- **`app/(auth)/register.tsx`**: Formulario con Email, Password y Username.
- **Trigger**: Asegurar que al insertar en `auth.users`, se cree la entrada en `public.profiles` con el `username` capturado.

---

## Fase 2 — Núcleo del Mapa y Clustering

### 2.1 Mapa con Clustering
- **`app/(app)/map.tsx`**:
  - Implementación de `MapView` de `react-native-map-clustering`.
  - Renderizado dinámico de `farms` (Polygons).
  - Clustering de `trees` basado en el zoom level.

### 2.2 Trazado GPS de Alta Resolución
- **`hooks/useGPSTracking.ts`**:
  - Uso de `Location.Accuracy.Highest`.
  - Configuración de `distanceInterval` pequeño para capturar linderos precisos.

---

## Fase 3 — Gestión de Datos

### 3.1 CRUD de Especies
- Pantalla para gestionar el catálogo personal de árboles (Olivos, Cítricos, etc.).
- Cada especie almacena un color para el marcador/cluster.

### 3.2 Listado de Fincas y Resumen
- Cálculo de áreas en tiempo real vía PostGIS.

---

## Fase 4 — Pulido e Interfaz Premium

### 4.1 UI/UX
- Uso de componentes de `nativewind` con una estética "Glassmorphism" y Modo Oscuro por defecto.
- Feedback háptico en todas las acciones críticas.

---

## Arquitectura Final
```
bancals1/
├── app/
│   ├── (auth)/ ...
│   ├── (app)/
│   │   ├── map.tsx (con Clustering)
│   │   └── ...
├── components/
│   ├── MapClustering/ ...
│   └── ...
├── prd.md
└── implementation_plan.md
```
