Este es el Product Requirements Document (PRD) técnico y detallado para Bancals, diseñado desde la perspectiva de un ingeniero senior para asegurar escalabilidad, mantenibilidad y una experiencia de usuario de primer nivel.

PRD: Bancals - Gestión Geoespacial de Fincas y Cultivos
Versión: 1.0.0

Estado: Definición

Stack: Expo (React Native) + Supabase (PostgreSQL/PostGIS)

1. Resumen del Producto
Bancals es una herramienta profesional de gestión agrícola que permite a los propietarios digitalizar sus explotaciones. La aplicación resuelve la necesidad de tener un inventario geolocalizado preciso, permitiendo el trazado de perímetros mediante GPS de alta resolución y la catalogación individualizada de árboles por especie.

2. Objetivos Principales
Precisión Geoespacial: Captura de linderos con la máxima resolución del sensor móvil.

Gestión Dinámica: Control total sobre las especies de árboles cultivados.

Seguridad: Autenticación robusta y aislamiento de datos por usuario.

Visualización Moderna: Interfaz limpia, fluida y con mapas satelitales de alta calidad.

3. Stack Tecnológico (Propuesto)
Frontend: Expo SDK (React Native) + TypeScript.

UI/Styling: NativeWind (Tailwind CSS) para un diseño moderno y consistente.

Mapas: react-native-maps con integración de Google Maps/Apple Maps.

Geolocalización: expo-location (Configurado en Accuracy.BestForNavigation).

Backend: Supabase (Auth, Database, Storage para fotos de fincas si fuera necesario).

Base de Datos: PostgreSQL con extensión PostGIS para cálculos de áreas y distancias.

4. Requisitos Funcionales
4.1. Autenticación y Perfil
Registro e Inicio de sesión mediante Supabase Auth (Email/Password).

Recuperación de contraseña.

Persistencia de sesión segura (SecureStore).

4.2. Gestión de Especies (Catálogo Personalizado)
CRUD de Especies: El usuario puede definir qué tipos de árboles tiene (Olivos, Almendros, Cítricos, etc.).

Iconografía/Color: Posibilidad de asignar un color o identificador a cada especie para visualizarla en el mapa.

4.3. Trazado de Fincas (GPS de Alta Resolución)
Modo Trazado Activo: Grabación de puntos GPS mientras el usuario camina por el perímetro.

Filtro de Precisión: El sistema ignorará puntos con un margen de error (horizontal accuracy) superior a un umbral definido (ej. > 5m).

Cálculo Automático: Generación del polígono y cálculo de superficie (hectáreas/áreas) mediante PostGIS.

4.4. Mapeo de Árboles
Inserción Precisa: Añadir un árbol en la posición actual del GPS o mediante "long press" en el mapa.

Asociación: Cada árbol debe pertenecer obligatoriamente a una especie previamente creada.

Edición: Mover la posición del árbol o cambiar su especie/estado.

5. Arquitectura de Datos (Supabase)
Tablas Principales
profiles
id: uuid (references auth.users)

updated_at: timestamp

username: text

tree_species
id: uuid (PK)

owner_id: uuid (FK a profiles)

name: text (Ej: "Olivo Picual")

color_code: text (Hexadecimal para el marcador en el mapa)

farms (Fincas)
id: uuid (PK)

owner_id: uuid (FK a profiles)

name: text

boundary: geography(Polygon, 4326) -- Datos espaciales

area_m2: float

trees
id: uuid (PK)

farm_id: uuid (FK a farms)

species_id: uuid (FK a tree_species)

location: geography(Point, 4326) -- Punto exacto

6. Diseño y UX (Interfaz Moderna)
Tema: Soporte para Modo Oscuro/Claro basado en el sistema.

Navegación: Tab Bar inferior con: Mapa, Mis Fincas, Especies y Ajustes.

Feedback Háptico: Vibración ligera al marcar puntos GPS o guardar árboles.

Componentes: Uso de tarjetas (cards) con bordes redondeados, sombras suaves y tipografía legible (inter-family).

7. Requisitos No Funcionales
Disponibilidad: Sincronización en tiempo real con Supabase.

Rendimiento: El mapa debe manejar el renderizado de cientos de marcadores mediante Marker Clustering.

Privacidad: Implementación de Row Level Security (RLS) en Supabase para asegurar que ningún usuario pueda ver las fincas de otro.

8. Roadmap de Desarrollo
Fase 1: Configuración de Supabase, Auth y CRUD de Especies.

Fase 2: Implementación del Mapa y lógica de trazado GPS de alta resolución.

Fase 3: Sistema de guardado de árboles y asociación con especies.

Fase 4: Pulido de UI/UX, transiciones y testeo en dispositivos reales Android.

Nota del Ingeniero: Para lograr la "Alta Resolución" en Android, debemos asegurar que el location priority sea PRIORITY_HIGH_ACCURACY. En Expo, esto se traduce en usar Location.watchPositionAsync con la opción Accuracy.Highest. Además, se recomienda implementar un "suavizado" de los puntos del polígono para evitar picos por rebotes del GPS.