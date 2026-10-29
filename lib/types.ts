/**
 * Tipos centrales del Portal Escolar.
 * Todos los modelos de dominio usados en el prototipo.
 */

/** Grados escolares disponibles */
export type Grado = "1ro A" | "1ro B" | "2do A" | "2do B" | "3ro A" | "3ro B";

/** Estado de una autorización de evento */
export type EstadoAutorizacion = "pendiente" | "autorizado" | "denegado" | "sin_respuesta";

/** Relación de persona autorizada con el estudiante */
export type Parentesco = "Padre" | "Madre" | "Abuelo/a" | "Tío/a" | "Hermano/a" | "Tutor legal" | "Otro";

/** Estudiante matriculado */
export interface Estudiante {
  id: string;
  nombre: string;
  apellido: string;
  grado: Grado;
  personasAutorizadas: PersonaAutorizada[];
}

/** Persona habilitada para retirar a un estudiante */
export interface PersonaAutorizada {
  id: string;
  estudianteId: string;
  nombreCompleto: string;
  parentesco: Parentesco;
  numeroCedula: string;       // Número de identificación
  telefonoContacto: string;
}

/** Evento escolar que requiere autorización */
export interface Evento {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: string;              // ISO date string
  hora: string;               // HH:MM
  costo: number;
  fechaLimiteRespuesta: string; // ISO date string
  creadoPor: string;
  creadoEn: string;
}

/** Token de acceso único por estudiante/evento */
export interface TokenAcceso {
  token: string;
  eventoId: string;
  estudianteId: string;
  usado: boolean;
  creadoEn: string;
}

/** Autorización emitida por el padre */
export interface Autorizacion {
  id: string;
  tokenAcceso: string;
  eventoId: string;
  estudianteId: string;
  estado: EstadoAutorizacion;
  motivoDenegacion?: string;
  justificacionCambio?: string;
  firmaSvg?: string;          // Firma digital como path SVG
  fechaRespuesta?: string;
  codigoComprobante?: string;
}

/** Usuario del panel escolar (personal) */
export interface UsuarioEscolar {
  id: string;
  nombre: string;
  rol: "maestra" | "admin";
  contrasena: string;         // En prototipo: texto plano
}
