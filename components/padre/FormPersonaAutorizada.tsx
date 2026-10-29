"use client";

/**
 * FormPersonaAutorizada — Formulario para que el padre registre
 * personas autorizadas a retirar a su hijo/a.
 *
 * Requisito cubierto:
 * - Criterio de aceptación verificable: Registro de Personas Autorizadas
 * - Req 4: Gestión de personas autorizadas (vista del padre)
 */

import { useState } from "react";
import {
  UserPlus,
  User,
  Phone,
  Trash2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Estudiante, PersonaAutorizada, Parentesco } from "@/lib/types";
import { PERSONAS_AUTORIZADAS } from "@/lib/store";

const OPCIONES_PARENTESCO: Parentesco[] = [
  "Padre",
  "Madre",
  "Abuelo/a",
  "Tío/a",
  "Hermano/a",
  "Tutor legal",
  "Otro",
];

interface FormPersonaAutorizadaProps {
  estudiante: Estudiante;
}

interface FormState {
  nombreCompleto: string;
  parentesco: Parentesco | "";
  numeroCedula: string;
  telefonoContacto: string;
}

const FORM_VACIO: FormState = {
  nombreCompleto: "",
  parentesco: "",
  numeroCedula: "",
  telefonoContacto: "",
};

export default function FormPersonaAutorizada({ estudiante }: FormPersonaAutorizadaProps) {
  const [expandido, setExpandido] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [personas, setPersonas] = useState<PersonaAutorizada[]>(
    PERSONAS_AUTORIZADAS.filter((p) => p.estudianteId === estudiante.id)
  );
  const [guardado, setGuardado] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};
    if (!form.nombreCompleto.trim()) {
      nuevosErrores.nombreCompleto = "Ingrese el nombre completo";
    }
    if (!form.parentesco) {
      nuevosErrores.parentesco = "Seleccione el parentesco";
    }
    if (!form.numeroCedula.trim()) {
      nuevosErrores.numeroCedula = "Ingrese el número de cédula";
    }
    if (!form.telefonoContacto.trim()) {
      nuevosErrores.telefonoContacto = "Ingrese el teléfono de contacto";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardar = () => {
    if (!validar()) return;

    const nueva: PersonaAutorizada = {
      id: `pa-${Date.now()}`,
      estudianteId: estudiante.id,
      nombreCompleto: form.nombreCompleto.trim(),
      parentesco: form.parentesco as Parentesco,
      numeroCedula: form.numeroCedula.trim(),
      telefonoContacto: form.telefonoContacto.trim(),
    };

    // Persistir en el store del prototipo
    PERSONAS_AUTORIZADAS.push(nueva);
    setPersonas((prev) => [...prev, nueva]);
    setForm(FORM_VACIO);
    setErrores({});
    setMostrarForm(false);
    setGuardado(true);

    // Resetear mensaje de guardado
    setTimeout(() => setGuardado(false), 3000);
  };

  const eliminar = (id: string) => {
    const idx = PERSONAS_AUTORIZADAS.findIndex((p) => p.id === id);
    if (idx !== -1) PERSONAS_AUTORIZADAS.splice(idx, 1);
    setPersonas((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Encabezado colapsable */}
      <button
        type="button"
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        aria-expanded={expandido}
        aria-controls="seccion-personas-autorizadas"
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <User size={18} className="text-blue-700" aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-semibold text-[#0F172A]">
              Personas autorizadas para recoger
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {personas.length} persona{personas.length !== 1 ? "s" : ""} registrada
              {personas.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {expandido ? (
          <ChevronUp size={20} className="text-slate-400 flex-shrink-0" aria-hidden="true" />
        ) : (
          <ChevronDown size={20} className="text-slate-400 flex-shrink-0" aria-hidden="true" />
        )}
      </button>

      {/* Contenido expandible */}
      {expandido && (
        <div id="seccion-personas-autorizadas" className="px-5 pb-5 space-y-4">
          {/* Mensaje de éxito */}
          {guardado && (
            <div
              className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3"
              role="status"
              aria-live="polite"
            >
              <CheckCircle size={16} className="text-emerald-600" aria-hidden="true" />
              <p className="text-sm text-emerald-700 font-medium">
                Persona autorizada guardada correctamente.
              </p>
            </div>
          )}

          {/* Lista existente */}
          {personas.length > 0 && (
            <div className="space-y-2">
              {personas.map((p) => (
                <div
                  key={p.id}
                  className="flex items-start justify-between bg-slate-50 rounded-lg p-3 border border-slate-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A] truncate">
                      {p.nombreCompleto}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      <span className="text-xs text-slate-500">{p.parentesco}</span>
                      <span className="text-xs text-slate-400">Ced. {p.numeroCedula}</span>
                      <span className="flex items-center gap-0.5 text-xs text-slate-500">
                        <Phone size={10} aria-hidden="true" />
                        {p.telefonoContacto}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminar(p.id)}
                    className="ml-2 p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                    aria-label={`Eliminar a ${p.nombreCompleto} de las personas autorizadas`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Formulario de nueva persona */}
          {mostrarForm ? (
            <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50">
              <p className="text-sm font-semibold text-[#0F172A]">Nueva persona autorizada</p>

              <CampoTexto
                id="nombre-completo"
                label="Nombre completo"
                valor={form.nombreCompleto}
                onChange={(v) => setForm({ ...form, nombreCompleto: v })}
                error={errores.nombreCompleto}
                placeholder="Ej: Juan Carlos Pérez López"
                requerido
              />

              <div>
                <label
                  htmlFor="parentesco"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Parentesco / Relación
                  <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                </label>
                <select
                  id="parentesco"
                  value={form.parentesco}
                  onChange={(e) =>
                    setForm({ ...form, parentesco: e.target.value as Parentesco })
                  }
                  className={`w-full px-4 py-3 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 ${
                    errores.parentesco ? "border-red-400" : "border-slate-300"
                  }`}
                  aria-required="true"
                  aria-invalid={!!errores.parentesco}
                  aria-describedby={errores.parentesco ? "error-parentesco" : undefined}
                >
                  <option value="">
                    Seleccione el parentesco...
                  </option>
                  {OPCIONES_PARENTESCO.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
                {errores.parentesco && (
                  <p id="error-parentesco" className="text-xs text-red-600 mt-1" role="alert">
                    {errores.parentesco}
                  </p>
                )}
              </div>

              <CampoTexto
                id="cedula"
                label="Número de cédula"
                valor={form.numeroCedula}
                onChange={(v) => setForm({ ...form, numeroCedula: v })}
                error={errores.numeroCedula}
                placeholder="Ej: 1-1234-5678"
                requerido
              />

              <CampoTexto
                id="telefono"
                label="Teléfono de contacto"
                valor={form.telefonoContacto}
                onChange={(v) => setForm({ ...form, telefonoContacto: v })}
                error={errores.telefonoContacto}
                placeholder="Ej: 8888-0000"
                tipo="tel"
                requerido
              />

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={guardar}
                  className="btn-touch flex-1 flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-blue-800 text-white font-semibold rounded-lg px-4 py-3 transition-colors text-sm"
                  aria-label="Guardar persona autorizada"
                >
                  <CheckCircle size={16} aria-hidden="true" />
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => { setMostrarForm(false); setForm(FORM_VACIO); setErrores({}); }}
                  className="btn-touch flex-1 text-slate-600 font-medium rounded-lg px-4 py-3 border border-slate-300 hover:bg-slate-100 transition-colors text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMostrarForm(true)}
              className="btn-touch w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-medium rounded-lg px-6 py-3 transition-colors text-sm"
              aria-label="Agregar persona autorizada para recoger al estudiante"
            >
              <UserPlus size={18} aria-hidden="true" />
              Agregar persona autorizada
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Campo de texto reutilizable ─────────────────────────────────────────────

function CampoTexto({
  id,
  label,
  valor,
  onChange,
  error,
  placeholder,
  tipo = "text",
  requerido = false,
}: {
  id: string;
  label: string;
  valor: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  tipo?: string;
  requerido?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}
        {requerido && (
          <span className="text-red-500 ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type={tipo}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400 ${
          error ? "border-red-400" : "border-slate-300"
        }`}
        required={requerido}
        aria-required={requerido}
        aria-invalid={!!error}
        aria-describedby={error ? `error-${id}` : undefined}
      />
      {error && (
        <p id={`error-${id}`} className="text-xs text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
