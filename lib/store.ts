/**
 * Store de datos del prototipo.
 * Simula una base de datos en memoria con datos de ejemplo.
 * En producción esto sería reemplazado por llamadas a API/DB.
 */

import {
  Estudiante,
  Evento,
  TokenAcceso,
  Autorizacion,
  UsuarioEscolar,
  PersonaAutorizada,
  EstadoAutorizacion,
} from "./types";

// ─── Datos de estudiantes de ejemplo ───────────────────────────────────────

export const ESTUDIANTES: Estudiante[] = [
  {
    id: "est-001",
    nombre: "Valentina",
    apellido: "Ramírez López",
    grado: "3ro A",
    personasAutorizadas: [],
  },
  {
    id: "est-002",
    nombre: "Mateo",
    apellido: "González Pérez",
    grado: "3ro A",
    personasAutorizadas: [],
  },
  {
    id: "est-003",
    nombre: "Lucía",
    apellido: "Herrera Mora",
    grado: "2do B",
    personasAutorizadas: [],
  },
  {
    id: "est-004",
    nombre: "Sebastián",
    apellido: "Castro Jiménez",
    grado: "2do B",
    personasAutorizadas: [],
  },
  {
    id: "est-005",
    nombre: "Isabella",
    apellido: "Torres Vega",
    grado: "1ro A",
    personasAutorizadas: [],
  },
];

// ─── Personas autorizadas de ejemplo ───────────────────────────────────────

export const PERSONAS_AUTORIZADAS: PersonaAutorizada[] = [
  {
    id: "pa-001",
    estudianteId: "est-001",
    nombreCompleto: "Carlos Ramírez Soto",
    parentesco: "Padre",
    numeroCedula: "1-1234-5678",
    telefonoContacto: "8888-1234",
  },
  {
    id: "pa-002",
    estudianteId: "est-001",
    nombreCompleto: "María López Vargas",
    parentesco: "Madre",
    numeroCedula: "1-9876-5432",
    telefonoContacto: "7777-5678",
  },
  {
    id: "pa-003",
    estudianteId: "est-002",
    nombreCompleto: "Ana Pérez Muñoz",
    parentesco: "Madre",
    numeroCedula: "2-3456-7890",
    telefonoContacto: "6666-9012",
  },
  {
    id: "pa-004",
    estudianteId: "est-003",
    nombreCompleto: "Roberto Herrera Salazar",
    parentesco: "Padre",
    numeroCedula: "3-4567-8901",
    telefonoContacto: "8585-3456",
  },
];

// ─── Eventos de ejemplo ─────────────────────────────────────────────────────

export const EVENTOS: Evento[] = [
  {
    id: "evt-001",
    nombre: "Visita al Museo Nacional",
    descripcion:
      "Excursión educativa al Museo Nacional de Costa Rica. Los estudiantes explorarán exhibiciones de historia y cultura. Se requiere ropa cómoda y zapatos cerrados.",
    fecha: "2026-11-15",
    hora: "08:00",
    costo: 5.00,
    fechaLimiteRespuesta: "2026-11-10",
    creadoPor: "usr-001",
    creadoEn: "2026-10-20T10:00:00Z",
  },
  {
    id: "evt-002",
    nombre: "Festival de Ciencias",
    descripcion:
      "Presentación de proyectos científicos elaborados por los estudiantes durante el trimestre. Participación de jueces externos.",
    fecha: "2026-11-22",
    hora: "09:00",
    costo: 0,
    fechaLimiteRespuesta: "2026-11-18",
    creadoPor: "usr-001",
    creadoEn: "2026-10-22T09:30:00Z",
  },
];

// ─── Tokens de acceso de ejemplo ────────────────────────────────────────────

export const TOKENS_ACCESO: TokenAcceso[] = [
  // Tokens activos (plazo abierto) - Evento 1
  { token: "TKN-ABC12345", eventoId: "evt-001", estudianteId: "est-001", usado: false, creadoEn: "2026-10-20T10:00:00Z" },
  { token: "TKN-DEF67890", eventoId: "evt-001", estudianteId: "est-002", usado: false, creadoEn: "2026-10-20T10:00:00Z" },
  { token: "TKN-GHI11223", eventoId: "evt-001", estudianteId: "est-003", usado: false, creadoEn: "2026-10-20T10:00:00Z" },
  // Token con autorización ya registrada
  { token: "TKN-JKL44556", eventoId: "evt-001", estudianteId: "est-004", usado: true, creadoEn: "2026-10-20T10:00:00Z" },
  // Token de evento 2
  { token: "TKN-MNO77889", eventoId: "evt-002", estudianteId: "est-001", usado: false, creadoEn: "2026-10-22T09:30:00Z" },
  // Token expirado (para probar error)
  { token: "TKN-EXPIRED0", eventoId: "evt-001", estudianteId: "est-005", usado: false, creadoEn: "2026-09-01T00:00:00Z" },
];

// ─── Autorizaciones de ejemplo ───────────────────────────────────────────────

export const AUTORIZACIONES: Autorizacion[] = [
  {
    id: "aut-001",
    tokenAcceso: "TKN-JKL44556",
    eventoId: "evt-001",
    estudianteId: "est-004",
    estado: "autorizado",
    fechaRespuesta: "2026-10-25T14:30:00Z",
    codigoComprobante: "COMP-AB7X9QM2",
  },
];

// ─── Usuarios del panel escolar ──────────────────────────────────────────────

export const USUARIOS_ESCOLARES: UsuarioEscolar[] = [
  { id: "usr-001", nombre: "Sofía Vargas", rol: "maestra", contrasena: "escuela2026" },
  { id: "usr-002", nombre: "Admin Principal", rol: "admin", contrasena: "admin2026" },
];

// ─── Funciones de consulta (simulan acceso a BD) ─────────────────────────────

/** Busca un token de acceso y valida que no haya expirado conceptualmente */
export function buscarToken(token: string): TokenAcceso | null {
  return TOKENS_ACCESO.find((t) => t.token === token) ?? null;
}

/** Obtiene estudiante por ID */
export function obtenerEstudiante(id: string): Estudiante | null {
  const est = ESTUDIANTES.find((e) => e.id === id) ?? null;
  if (!est) return null;
  // Adjuntar personas autorizadas
  return {
    ...est,
    personasAutorizadas: PERSONAS_AUTORIZADAS.filter((p) => p.estudianteId === id),
  };
}

/** Obtiene evento por ID */
export function obtenerEvento(id: string): Evento | null {
  return EVENTOS.find((e) => e.id === id) ?? null;
}

/** Busca autorización por token */
export function buscarAutorizacion(token: string): Autorizacion | null {
  return AUTORIZACIONES.find((a) => a.tokenAcceso === token) ?? null;
}

/** Genera un código de comprobante único */
export function generarCodigoComprobante(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let codigo = "COMP-";
  for (let i = 0; i < 8; i++) {
    codigo += chars[Math.floor(Math.random() * chars.length)];
  }
  return codigo;
}

/** Verifica si el plazo de un evento está abierto */
export function plazoAbierto(evento: Evento): boolean {
  const limite = new Date(evento.fechaLimiteRespuesta);
  const hoy = new Date("2026-10-29"); // Fecha simulada del prototipo
  return hoy <= limite;
}

/** Obtiene todos los estudiantes con su estado de autorización para un evento */
export function obtenerResumenEvento(
  eventoId: string
): Array<{
  estudiante: Estudiante;
  estado: EstadoAutorizacion;
  fechaRespuesta?: string;
}> {
  const estudiantes = ESTUDIANTES.map((est) => {
    const aut = AUTORIZACIONES.find(
      (a) => a.estudianteId === est.id && a.eventoId === eventoId
    );
    return {
      estudiante: {
        ...est,
        personasAutorizadas: PERSONAS_AUTORIZADAS.filter((p) => p.estudianteId === est.id),
      },
      estado: (aut?.estado ?? "pendiente") as EstadoAutorizacion,
      fechaRespuesta: aut?.fechaRespuesta,
    };
  });
  return estudiantes;
}

/** Búsqueda de estudiantes por nombre (insensible a mayúsculas) */
export function buscarEstudiantes(termino: string): Estudiante[] {
  const q = termino.toLowerCase().trim();
  if (!q) return ESTUDIANTES.map((e) => ({
    ...e,
    personasAutorizadas: PERSONAS_AUTORIZADAS.filter((p) => p.estudianteId === e.id),
  }));
  return ESTUDIANTES.filter((e) =>
    `${e.nombre} ${e.apellido}`.toLowerCase().includes(q) ||
    e.grado.toLowerCase().includes(q)
  ).map((e) => ({
    ...e,
    personasAutorizadas: PERSONAS_AUTORIZADAS.filter((p) => p.estudianteId === e.id),
  }));
}
