# Portal Escolar — Autorizaciones y Registro de Recogida

Sistema web ligero para escuelas primarias que digitaliza el proceso de autorización de eventos escolares y el control de personas habilitadas para retirar estudiantes. Funciona **100% desde el navegador**, sin que los padres necesiten instalar ninguna aplicación ni crear cuentas.

---

## Tabla de Contenidos

- [Problema que resuelve](#problema-que-resuelve)
- [Cómo funciona](#cómo-funciona)
- [Vistas de la aplicación](#vistas-de-la-aplicación)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Modelos de datos](#modelos-de-datos)
- [Instalación y desarrollo](#instalación-y-desarrollo)
- [Credenciales del prototipo](#credenciales-del-prototipo)
- [Tokens de prueba](#tokens-de-prueba)
- [Decisiones de diseño](#decisiones-de-diseño)
- [Roadmap](#roadmap)

---

## Problema que resuelve

Las escuelas siguen enviando autorizaciones en papel que se pierden en las mochilas. El día del evento faltan firmas. Además, cuando alguien distinto a los padres va a recoger a un niño, las maestras no tienen un registro centralizado y confiable que consultar en el momento.

Este portal ataca ambos problemas:

1. El padre recibe un enlace por WhatsApp → abre una página → autoriza o deniega en dos toques.
2. La maestra o coordinadora tiene un panel que muestra en tiempo real quién autorizó y quién puede retirar a cada alumno.

---

## Cómo funciona

```
[Coordinadora crea evento]
        |
        v
[Sistema genera un token único por alumno]
  ej: escuela.app/permiso?id=TKN-ABC12345
        |
        v
[Se comparte el enlace por WhatsApp]
        |
        v
[Padre abre la URL en su móvil — sin login, sin descarga]
        |
        v
[Autoriza o Deniega + registra personas que pueden recoger al hijo]
        |
        v
[Se emite un comprobante con código QR único]
        |
        v
[Panel /panel muestra estado en tiempo real para la maestra]
```

---

## Vistas de la aplicación

### Vista del Padre — `/permiso?id=TOKEN`

Diseñada para móviles. Se accede desde un enlace compartido por WhatsApp sin requerir autenticación.

- Muestra el nombre del estudiante, el evento y la fecha límite de respuesta.
- Botones táctiles grandes (mínimo 48 px de alto) para **Autorizar** o **Denegar**.
- Formulario para registrar personas autorizadas para retirar al estudiante: nombre completo, parentesco, número de cédula y teléfono de contacto.
- Tras la acción emite un **comprobante con código QR** que sirve como respaldo.
- Si el plazo venció o el token no existe, muestra un mensaje de error claro.

### Panel de Control — `/panel`

Diseñado para maestras y coordinadoras en tablet o computadora.

- Login simple con usuario y contraseña (prototipo, sin cifrado).
- Dashboard con resumen de autorizaciones por evento: total, autorizados, pendientes, denegados.
- Tabla filtrable por grado con `BadgeEstado` colorizado:
  - Verde (emerald) → autorizado
  - Naranja → pendiente
  - Rojo → denegado
- Ficha expandible por alumno con la lista de personas autorizadas para retiro y sus datos de contacto.
- Tab de **Recogidas** con vista del registro de personas habilitadas.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| Iconografía | lucide-react |
| Generación QR | qrcode |
| Runtime | React 19 |

> **Sin base de datos externa.** El prototipo usa un store en memoria (`lib/store.ts`). En producción se reemplazaría con llamadas a una API y una base de datos real.

---

## Estructura del proyecto

```
portal-escolar/
├── app/
│   ├── layout.tsx               # Layout raíz con fuentes y metadata
│   ├── page.tsx                 # Página de inicio (redirección)
│   ├── permiso/
│   │   ├── page.tsx             # Server Component: valida token, pasa datos
│   │   └── PermisoCliente.tsx   # Client Component: interactividad del padre
│   └── panel/
│       └── page.tsx             # Página del panel escolar
│
├── components/
│   ├── BadgeEstado.tsx          # Chip de color según estado de autorización
│   ├── CodigoQR.tsx             # Genera y renderiza el código QR del comprobante
│   ├── FirmaCanvas.tsx          # Canvas para captura de firma digital (opcional)
│   ├── padre/
│   │   ├── VistaEvento.tsx      # Tarjeta del evento con botones Autorizar/Denegar
│   │   └── FormPersonaAutorizada.tsx  # Formulario de registro de persona habilitada
│   └── panel/
│       ├── LoginPanel.tsx       # Formulario de acceso al panel
│       ├── NavPanel.tsx         # Barra de navegación superior del panel
│       ├── DashboardPanel.tsx   # Vista principal con resumen y tabla de alumnos
│       ├── TabEventos.tsx       # Tab de gestión de eventos
│       └── TabRecogidas.tsx     # Tab de registro de personas autorizadas
│
├── lib/
│   ├── types.ts                 # Interfaces y tipos TypeScript del dominio
│   └── store.ts                 # Store en memoria con datos de ejemplo y helpers
│
└── public/                      # Recursos estáticos
```

---

## Modelos de datos

### `Estudiante`
```ts
{
  id: string;
  nombre: string;
  apellido: string;
  grado: "1ro A" | "1ro B" | "2do A" | "2do B" | "3ro A" | "3ro B";
  personasAutorizadas: PersonaAutorizada[];
}
```

### `Evento`
```ts
{
  id: string;
  nombre: string;
  descripcion: string;
  fecha: string;                  // "YYYY-MM-DD"
  hora: string;                   // "HH:MM"
  costo: number;
  fechaLimiteRespuesta: string;   // "YYYY-MM-DD"
  creadoPor: string;
}
```

### `PersonaAutorizada`
```ts
{
  id: string;
  estudianteId: string;
  nombreCompleto: string;
  parentesco: "Padre" | "Madre" | "Abuelo/a" | "Tío/a" | "Hermano/a" | "Tutor legal" | "Otro";
  numeroCedula: string;
  telefonoContacto: string;
}
```

### `Autorizacion`
```ts
{
  id: string;
  tokenAcceso: string;
  eventoId: string;
  estudianteId: string;
  estado: "pendiente" | "autorizado" | "denegado" | "sin_respuesta";
  firmaSvg?: string;              // Firma digital como path SVG
  fechaRespuesta?: string;
  codigoComprobante?: string;     // Ej: "COMP-AB7X9QM2"
}
```

---

## Instalación y desarrollo

**Requisitos:** Node.js 20+ y npm.

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd portal-escolar

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

La app queda disponible en [http://localhost:3000](http://localhost:3000).

### Comandos disponibles

```bash
npm run dev      # Servidor de desarrollo con hot reload
npm run build    # Build de producción
npm run start    # Servidor de producción (requiere build previo)
npm run lint     # Análisis estático con ESLint
```

---

## Credenciales del prototipo

Acceso al panel en `/panel`:

| Usuario | Contraseña | Rol |
|---|---|---|
| `Sofía Vargas` | `escuela2026` | Maestra |
| `Admin Principal` | `admin2026` | Administrador |

> Estas credenciales son de prototipo. En producción se implementaria autenticación segura.

---

## Tokens de prueba

Para probar la vista del padre, abrir `/permiso?id=TOKEN` con alguno de estos tokens:

| Token | Estudiante | Evento | Estado |
|---|---|---|---|
| `TKN-ABC12345` | Valentina Ramírez | Visita al Museo Nacional | Pendiente |
| `TKN-DEF67890` | Mateo González | Visita al Museo Nacional | Pendiente |
| `TKN-GHI11223` | Lucía Herrera | Visita al Museo Nacional | Pendiente |
| `TKN-JKL44556` | Sebastián Castro | Visita al Museo Nacional | Ya autorizado |
| `TKN-MNO77889` | Valentina Ramírez | Festival de Ciencias | Pendiente |
| `TKN-EXPIRED0` | Isabella Torres | Visita al Museo Nacional | Plazo vencido |

**Ejemplo de URL completa:**
```
http://localhost:3000/permiso?id=TKN-ABC12345
```

---

## Decisiones de diseño

**Sin login para los padres.** El acceso por token único en la URL elimina la fricción de registros y contraseñas. El enlace ya es el mecanismo de autenticación.

**Store en memoria como prototipo.** `lib/store.ts` simula una base de datos con funciones (`buscarToken`, `obtenerEstudiante`, `obtenerEvento`, etc.) con la misma firma que tendrían en producción. Migrar a una BD real solo requiere reemplazar esas funciones.

**Server + Client Components separados.** La validación del token ocurre en el Server Component (`app/permiso/page.tsx`) para evitar exponer datos al cliente antes de verificar el acceso. La interactividad (botones, formulario) vive en `PermisoCliente.tsx` marcado con `"use client"`.

**Botones táctiles con métricas de UX móvil.** Todos los botones de acción tienen `min-height: 48px`, `touch-action: manipulation` y `-webkit-tap-highlight-color: transparent` para garantizar respuesta correcta en pantallas táctiles.

**Tailwind CSS 4 con tokens.** Los colores de estado (emerald, orange, red) y los espaciados están definidos como utilidades de Tailwind para mantener consistencia visual sin CSS adicional.

---

## Roadmap

- [ ] Persistencia real con base de datos (PostgreSQL o Firebase)
- [ ] API Routes de Next.js para mutaciones (autorizar, registrar personas)
- [ ] Generación y envío automático de enlaces por WhatsApp Business API
- [ ] Autenticación segura para el panel (NextAuth o similar)
- [ ] Notificaciones push o email cuando un padre responde
- [ ] Historial de autorizaciones por estudiante
- [ ] Exportación del registro a PDF o Excel
- [ ] Modo offline con sincronización posterior (PWA)
