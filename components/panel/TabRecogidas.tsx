"use client";

/**
 * TabRecogidas — Panel de verificación en puerta y gestión de personas autorizadas.
 *
 * Requisitos cubiertos:
 * - Req 4: Administración de personas autorizadas para recogida
 * - Req 5: Verificación en puerta por el personal escolar
 */

import { useState, useCallback, useMemo } from "react";
import {
  Search,
  UserCheck,
  UserX,
  User,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  X,
  Phone,
  CreditCard,
  BookOpen,
} from "lucide-react";
import { Estudiante, PersonaAutorizada, Parentesco } from "@/lib/types";
import { PERSONAS_AUTORIZADAS, buscarEstudiantes } from "@/lib/store";

const OPCIONES_PARENTESCO: Parentesco[] = [
  "Padre", "Madre", "Abuelo/a", "Tío/a", "Hermano/a", "Tutor legal", "Otro",
];

interface FormPA {
  nombreCompleto: string;
  parentesco: Parentesco | "";
  numeroCedula: string;
  telefonoContacto: string;
}

const FORM_VACIO: FormPA = { nombreCompleto: "", parentesco: "", numeroCedula: "", telefonoContacto: "" };

export default function TabRecogidas() {
  const [termino, setTermino] = useState("");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null);
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [personasLocal, setPersonasLocal] = useState<PersonaAutorizada[]>([...PERSONAS_AUTORIZADAS]);

  // Formulario de persona autorizada
  const [editandoId, setEditandoId] = useState<string | null>(null); // null = nuevo
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState<FormPA>(FORM_VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Búsqueda con debounce manual (latencia < 500ms req 5.1)
  const resultados = useMemo(() => {
    if (!termino.trim()) return [];
    return buscarEstudiantes(termino).slice(0, 8);
  }, [termino]);

  const seleccionarEstudiante = (est: Estudiante) => {
    setEstudianteSeleccionado(est);
    setTermino("");
    setMostrarBusqueda(false);
    setMostrarForm(false);
    setEditandoId(null);
    setForm(FORM_VACIO);
    setErrores({});
  };

  // Personas del estudiante seleccionado (filtradas desde el estado local)
  const personasDelEstudiante = useMemo(
    () => personasLocal.filter((p) => p.estudianteId === estudianteSeleccionado?.id),
    [personasLocal, estudianteSeleccionado]
  );

  const validar = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.nombreCompleto.trim()) e.nombreCompleto = "Ingrese el nombre completo";
    if (!form.parentesco) e.parentesco = "Seleccione el parentesco";
    if (!form.numeroCedula.trim()) e.numeroCedula = "Ingrese el número de cédula";
    if (!form.telefonoContacto.trim()) e.telefonoContacto = "Ingrese el teléfono";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const guardarPersona = useCallback(() => {
    if (!validar() || !estudianteSeleccionado) return;

    if (editandoId) {
      // Editar existente
      const actualizado = personasLocal.map((p) =>
        p.id === editandoId
          ? { ...p, nombreCompleto: form.nombreCompleto.trim(), parentesco: form.parentesco as Parentesco, numeroCedula: form.numeroCedula.trim(), telefonoContacto: form.telefonoContacto.trim() }
          : p
      );
      // Actualizar store
      const idx = PERSONAS_AUTORIZADAS.findIndex((p) => p.id === editandoId);
      if (idx !== -1) {
        PERSONAS_AUTORIZADAS[idx] = { ...PERSONAS_AUTORIZADAS[idx], nombreCompleto: form.nombreCompleto.trim(), parentesco: form.parentesco as Parentesco, numeroCedula: form.numeroCedula.trim(), telefonoContacto: form.telefonoContacto.trim() };
      }
      setPersonasLocal(actualizado);
    } else {
      // Nueva persona
      const nueva: PersonaAutorizada = {
        id: `pa-${Date.now()}`,
        estudianteId: estudianteSeleccionado.id,
        nombreCompleto: form.nombreCompleto.trim(),
        parentesco: form.parentesco as Parentesco,
        numeroCedula: form.numeroCedula.trim(),
        telefonoContacto: form.telefonoContacto.trim(),
      };
      PERSONAS_AUTORIZADAS.push(nueva);
      setPersonasLocal([...PERSONAS_AUTORIZADAS]);
    }

    setMostrarForm(false);
    setEditandoId(null);
    setForm(FORM_VACIO);
    setErrores({});
  }, [form, editandoId, personasLocal, estudianteSeleccionado]);

  const editarPersona = (p: PersonaAutorizada) => {
    setEditandoId(p.id);
    setForm({ nombreCompleto: p.nombreCompleto, parentesco: p.parentesco, numeroCedula: p.numeroCedula, telefonoContacto: p.telefonoContacto });
    setMostrarForm(true);
    setErrores({});
  };

  const eliminarPersona = (id: string) => {
    const idx = PERSONAS_AUTORIZADAS.findIndex((p) => p.id === id);
    if (idx !== -1) PERSONAS_AUTORIZADAS.splice(idx, 1);
    setPersonasLocal([...PERSONAS_AUTORIZADAS]);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-[#0F172A]">Verificación de recogidas</h2>

      {/* Buscador de estudiantes */}
      <div className="relative">
        <label htmlFor="buscar-estudiante" className="block text-sm font-semibold text-slate-600 mb-1.5">
          Buscar estudiante
        </label>
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="buscar-estudiante"
            type="search"
            value={termino}
            onChange={(e) => { setTermino(e.target.value); setMostrarBusqueda(true); }}
            onFocus={() => setMostrarBusqueda(true)}
            placeholder="Nombre del estudiante o grado..."
            className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400 bg-white"
            autoComplete="off"
            aria-label="Buscar estudiante por nombre o grado"
            aria-expanded={mostrarBusqueda && resultados.length > 0}
            aria-haspopup="listbox"
            role="combobox"
          />
        </div>

        {/* Resultados de búsqueda */}
        {mostrarBusqueda && termino && (
          <div
            className="absolute top-full left-0 right-0 z-10 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 overflow-hidden"
            role="listbox"
            aria-label="Resultados de búsqueda"
          >
            {resultados.length > 0 ? (
              resultados.map((est) => (
                <button
                  key={est.id}
                  type="button"
                  onClick={() => seleccionarEstudiante(est)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                  role="option"
                  aria-selected={estudianteSeleccionado?.id === est.id}
                >
                  <div className="bg-blue-100 rounded-full p-1.5 flex-shrink-0">
                    <User size={14} className="text-blue-700" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {est.nombre} {est.apellido}
                    </p>
                    <p className="text-xs text-slate-500">{est.grado}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">
                No se encontraron estudiantes
              </div>
            )}
          </div>
        )}
      </div>

      {/* Panel del estudiante seleccionado */}
      {estudianteSeleccionado ? (
        <div className="space-y-4">
          {/* Ficha del estudiante */}
          <div className="bg-[#0F172A] text-white rounded-xl px-5 py-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-700 rounded-full p-2.5">
                <BookOpen size={20} className="text-blue-200" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Estudiante seleccionado</p>
                <p className="text-lg font-bold">
                  {estudianteSeleccionado.nombre} {estudianteSeleccionado.apellido}
                </p>
                <p className="text-sm text-slate-400">{estudianteSeleccionado.grado}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setEstudianteSeleccionado(null); setMostrarForm(false); }}
              className="bg-slate-700 hover:bg-slate-600 rounded-lg p-2 transition-colors flex-shrink-0"
              aria-label="Cambiar estudiante"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Lista de personas autorizadas */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="text-base font-semibold text-[#0F172A]">Personas autorizadas</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Para retirar a {estudianteSeleccionado.nombre}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setMostrarForm(true); setEditandoId(null); setForm(FORM_VACIO); setErrores({}); }}
                className="flex items-center gap-1.5 bg-[#1D4ED8] hover:bg-blue-800 text-white font-semibold rounded-lg px-3 py-2 text-xs transition-colors"
                aria-label="Agregar nueva persona autorizada"
              >
                <Plus size={14} aria-hidden="true" />
                Agregar
              </button>
            </div>

            {/* Formulario inline */}
            {mostrarForm && (
              <div className="border-b border-slate-100 bg-blue-50 p-5 space-y-3">
                <p className="text-sm font-semibold text-[#0F172A]">
                  {editandoId ? "Editar persona autorizada" : "Nueva persona autorizada"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CampoPA
                    id="pa-nombre" label="Nombre completo" valor={form.nombreCompleto}
                    onChange={(v) => setForm({ ...form, nombreCompleto: v })}
                    error={errores.nombreCompleto} placeholder="Nombre y apellidos" requerido
                  />
                  <div>
                    <label htmlFor="pa-parentesco" className="block text-xs font-semibold text-slate-700 mb-1">
                      Parentesco <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="pa-parentesco"
                      value={form.parentesco}
                      onChange={(e) => setForm({ ...form, parentesco: e.target.value as Parentesco })}
                      className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 ${errores.parentesco ? "border-red-400" : "border-slate-300"}`}
                    >
                      <option value="">Seleccionar...</option>
                      {OPCIONES_PARENTESCO.map((op) => <option key={op} value={op}>{op}</option>)}
                    </select>
                    {errores.parentesco && <p className="text-xs text-red-600 mt-1" role="alert">{errores.parentesco}</p>}
                  </div>
                  <CampoPA
                    id="pa-cedula" label="Número de cédula" valor={form.numeroCedula}
                    onChange={(v) => setForm({ ...form, numeroCedula: v })}
                    error={errores.numeroCedula} placeholder="1-1234-5678" requerido
                  />
                  <CampoPA
                    id="pa-tel" label="Teléfono" valor={form.telefonoContacto}
                    onChange={(v) => setForm({ ...form, telefonoContacto: v })}
                    error={errores.telefonoContacto} placeholder="8888-0000" requerido
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={guardarPersona}
                    className="btn-touch flex items-center gap-1.5 bg-[#1D4ED8] hover:bg-blue-800 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors"
                    aria-label="Guardar persona autorizada"
                  >
                    <CheckCircle size={15} aria-hidden="true" />
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMostrarForm(false); setEditandoId(null); setForm(FORM_VACIO); setErrores({}); }}
                    className="btn-touch px-4 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Tabla de personas autorizadas */}
            {personasDelEstudiante.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {personasDelEstudiante.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-start justify-between px-5 py-4 gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="bg-emerald-100 rounded-full p-2 flex-shrink-0 mt-0.5">
                        <UserCheck size={18} className="text-emerald-700" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#0F172A] break-words">
                          {p.nombreCompleto}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{p.parentesco}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 rounded px-2 py-0.5">
                            <CreditCard size={11} aria-hidden="true" />
                            {p.numeroCedula}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 rounded px-2 py-0.5">
                            <Phone size={11} aria-hidden="true" />
                            {p.telefonoContacto}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Acciones */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => editarPersona(p)}
                        className="p-2 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        aria-label={`Editar a ${p.nombreCompleto}`}
                      >
                        <Pencil size={15} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarPersona(p.id)}
                        className="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label={`Eliminar a ${p.nombreCompleto} de las personas autorizadas`}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Req 5.5 — mensaje cuando no hay personas autorizadas */
              <div
                className="flex items-center gap-3 px-5 py-6 text-center"
                role="status"
                aria-live="polite"
              >
                <UserX
                  size={24}
                  className="text-slate-300 mx-auto"
                  aria-hidden="true"
                />
                <p className="text-sm text-slate-500">
                  No hay personas autorizadas registradas para este estudiante.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Estado vacío: sin estudiante seleccionado */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
          <Search size={32} className="text-slate-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-slate-500 font-medium">Busque un estudiante</p>
          <p className="text-sm text-slate-400 mt-1">
            Use el buscador de arriba para encontrar un alumno y ver sus personas autorizadas
          </p>
        </div>
      )}
    </div>
  );
}

function CampoPA({
  id, label, valor, onChange, error, placeholder, requerido = false,
}: {
  id: string; label: string; valor: string; onChange: (v: string) => void;
  error?: string; placeholder?: string; requerido?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-1">
        {label}
        {requerido && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 placeholder-slate-400 ${error ? "border-red-400" : "border-slate-300"}`}
        required={requerido}
      />
      {error && <p className="text-xs text-red-600 mt-1" role="alert">{error}</p>}
    </div>
  );
}
