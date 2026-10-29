"use client";

/**
 * TabEventos — Pestaña de gestión de eventos en el Panel Escolar.
 * Permite crear eventos, ver resúmenes y copiar los enlaces de WhatsApp.
 *
 * Requisitos cubiertos: Req 6 (Gestión de eventos por personal escolar)
 */

import { useState } from "react";
import {
  Plus,
  Calendar,
  Users,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronRight,
  DollarSign,
  MessageSquareShare,
} from "lucide-react";
import BadgeEstado from "@/components/BadgeEstado";
import { Evento, EstadoAutorizacion } from "@/lib/types";
import { EVENTOS, TOKENS_ACCESO, obtenerResumenEvento, ESTUDIANTES } from "@/lib/store";

interface FormEvento {
  nombre: string;
  descripcion: string;
  fecha: string;
  hora: string;
  costo: string;
  fechaLimiteRespuesta: string;
}

const FORM_VACIO: FormEvento = {
  nombre: "",
  descripcion: "",
  fecha: "",
  hora: "08:00",
  costo: "0",
  fechaLimiteRespuesta: "",
};

export default function TabEventos() {
  const [eventos, setEventos] = useState<Evento[]>([...EVENTOS]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState<FormEvento>(FORM_VACIO);
  const [eventoExpandido, setEventoExpandido] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [errores, setErrores] = useState<Partial<FormEvento>>({});

  const validar = (): boolean => {
    const e: Partial<FormEvento> = {};
    if (!form.nombre.trim()) e.nombre = "Ingrese el nombre del evento";
    if (!form.descripcion.trim()) e.descripcion = "Ingrese una descripción";
    if (!form.fecha) e.fecha = "Seleccione la fecha";
    if (!form.fechaLimiteRespuesta) e.fechaLimiteRespuesta = "Seleccione la fecha límite";
    if (new Date(form.fechaLimiteRespuesta) >= new Date(form.fecha)) {
      e.fechaLimiteRespuesta = "La fecha límite debe ser anterior al evento";
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const crearEvento = () => {
    if (!validar()) return;

    const nuevo: Evento = {
      id: `evt-${Date.now()}`,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      fecha: form.fecha,
      hora: form.hora,
      costo: parseFloat(form.costo) || 0,
      fechaLimiteRespuesta: form.fechaLimiteRespuesta,
      creadoPor: "usr-001",
      creadoEn: new Date().toISOString(),
    };

    // Generar tokens por cada estudiante
    ESTUDIANTES.forEach((est) => {
      const token = `TKN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      TOKENS_ACCESO.push({
        token,
        eventoId: nuevo.id,
        estudianteId: est.id,
        usado: false,
        creadoEn: new Date().toISOString(),
      });
    });

    EVENTOS.push(nuevo);
    setEventos([...EVENTOS]);
    setForm(FORM_VACIO);
    setErrores({});
    setMostrarForm(false);
    setEventoExpandido(nuevo.id);
  };

  const copiarEnlace = (token: string) => {
    const url = `${window.location.origin}/permiso?id=${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiado(token);
      setTimeout(() => setCopiado(null), 2000);
    });
  };

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#0F172A]">Eventos escolares</h2>
        <button
          type="button"
          onClick={() => setMostrarForm(!mostrarForm)}
          className="btn-touch flex items-center gap-2 bg-[#1D4ED8] hover:bg-blue-800 text-white font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors shadow-sm"
          aria-label="Crear nuevo evento escolar"
        >
          <Plus size={16} aria-hidden="true" />
          Nuevo evento
        </button>
      </div>

      {/* Formulario de creación */}
      {mostrarForm && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-5 space-y-4">
          <h3 className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
            <Plus size={18} className="text-blue-600" aria-hidden="true" />
            Crear nuevo evento
          </h3>

          <CampoForm
            id="ev-nombre"
            label="Nombre del evento"
            valor={form.nombre}
            onChange={(v) => setForm({ ...form, nombre: v })}
            error={errores.nombre}
            placeholder="Ej: Visita al Parque Nacional"
            requerido
          />

          <div>
            <label htmlFor="ev-desc" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Descripción
              <span className="text-red-500 ml-1" aria-hidden="true">*</span>
            </label>
            <textarea
              id="ev-desc"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={3}
              placeholder="Detalle el evento para los padres..."
              className={`w-full px-4 py-3 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-700 placeholder-slate-400 ${
                errores.descripcion ? "border-red-400" : "border-slate-300"
              }`}
            />
            {errores.descripcion && (
              <p className="text-xs text-red-600 mt-1" role="alert">{errores.descripcion}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ev-fecha" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Fecha del evento <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="ev-fecha"
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 ${
                  errores.fecha ? "border-red-400" : "border-slate-300"
                }`}
              />
              {errores.fecha && <p className="text-xs text-red-600 mt-1" role="alert">{errores.fecha}</p>}
            </div>
            <div>
              <label htmlFor="ev-hora" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Hora
              </label>
              <input
                id="ev-hora"
                type="time"
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ev-costo" className="block text-sm font-semibold text-slate-700 mb-1.5">
                <div className="flex items-center gap-1">
                  <DollarSign size={14} aria-hidden="true" />
                  Costo ($)
                </div>
              </label>
              <input
                id="ev-costo"
                type="number"
                min="0"
                value={form.costo}
                onChange={(e) => setForm({ ...form, costo: e.target.value })}
                className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              />
            </div>
            <div>
              <label htmlFor="ev-limite" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Fecha límite de respuesta
                <span className="text-red-500 ml-1" aria-hidden="true">*</span>
              </label>
              <input
                id="ev-limite"
                type="date"
                value={form.fechaLimiteRespuesta}
                onChange={(e) => setForm({ ...form, fechaLimiteRespuesta: e.target.value })}
                className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 ${
                  errores.fechaLimiteRespuesta ? "border-red-400" : "border-slate-300"
                }`}
              />
              {errores.fechaLimiteRespuesta && (
                <p className="text-xs text-red-600 mt-1" role="alert">{errores.fechaLimiteRespuesta}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={crearEvento}
              className="btn-touch flex-1 flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-blue-800 text-white font-semibold rounded-lg px-4 py-3 text-sm transition-colors"
              aria-label="Guardar nuevo evento"
            >
              <CheckCircle size={16} aria-hidden="true" />
              Crear evento
            </button>
            <button
              type="button"
              onClick={() => { setMostrarForm(false); setForm(FORM_VACIO); setErrores({}); }}
              className="btn-touch flex-1 text-slate-600 font-medium rounded-lg px-4 py-3 border border-slate-300 hover:bg-slate-50 text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de eventos */}
      <div className="space-y-3">
        {eventos.map((evento) => {
          const resumen = obtenerResumenEvento(evento.id);
          const conteos: Record<EstadoAutorizacion, number> = {
            autorizado: 0, pendiente: 0, denegado: 0, sin_respuesta: 0
          };
          resumen.forEach((r) => conteos[r.estado]++);
          const tokens = TOKENS_ACCESO.filter((t) => t.eventoId === evento.id);
          const expandido = eventoExpandido === evento.id;

          return (
            <div key={evento.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Encabezado del evento */}
              <button
                type="button"
                onClick={() => setEventoExpandido(expandido ? null : evento.id)}
                className="w-full flex items-start justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors gap-3"
                aria-expanded={expandido}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="text-base font-semibold text-[#0F172A]">{evento.nombre}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar size={12} aria-hidden="true" />
                      {new Date(evento.fecha + "T12:00:00").toLocaleDateString("es-CR", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Users size={12} aria-hidden="true" />
                      {resumen.length} estudiantes
                    </span>
                  </div>
                  {/* Resumen rápido */}
                  <div className="flex items-center gap-2 mt-2">
                    <BadgeEstado estado="autorizado" tamano="sm" />
                    <span className="text-xs font-semibold text-emerald-700">{conteos.autorizado}</span>
                    <BadgeEstado estado="pendiente" tamano="sm" />
                    <span className="text-xs font-semibold text-orange-700">{conteos.pendiente}</span>
                    <BadgeEstado estado="denegado" tamano="sm" />
                    <span className="text-xs font-semibold text-red-700">{conteos.denegado}</span>
                  </div>
                </div>
                {expandido ? (
                  <ChevronDown size={18} className="text-slate-400 flex-shrink-0 mt-1" aria-hidden="true" />
                ) : (
                  <ChevronRight size={18} className="text-slate-400 flex-shrink-0 mt-1" aria-hidden="true" />
                )}
              </button>

              {/* Detalle expandido */}
              {expandido && (
                <div className="border-t border-slate-100 px-5 py-4 space-y-4">
                  {/* Tabla de estudiantes */}
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-2">Estado por estudiante</p>
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Estudiante
                            </th>
                            <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Estado
                            </th>
                            <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                              Fecha respuesta
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {resumen.map((r, idx) => (
                            <tr
                              key={r.estudiante.id}
                              className={idx % 2 === 1 ? "bg-slate-50" : "bg-white"}
                            >
                              <td className="px-3 py-2.5 font-medium text-[#0F172A]">
                                {r.estudiante.nombre} {r.estudiante.apellido}
                                <p className="text-xs text-slate-500 font-normal">{r.estudiante.grado}</p>
                              </td>
                              <td className="px-3 py-2.5">
                                <BadgeEstado estado={r.estado} tamano="sm" />
                              </td>
                              <td className="px-3 py-2.5 text-xs text-slate-500 hidden sm:table-cell">
                                {r.fechaRespuesta
                                  ? new Date(r.fechaRespuesta).toLocaleDateString("es-CR", {
                                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                                    })
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Enlaces de WhatsApp */}
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                      <MessageSquareShare size={15} className="text-green-600" aria-hidden="true" />
                      Enlaces para compartir por WhatsApp
                    </p>
                    <div className="space-y-2">
                      {tokens.map((t) => {
                        const est = ESTUDIANTES.find((e) => e.id === t.estudianteId);
                        if (!est) return null;
                        const url = typeof window !== "undefined"
                          ? `${window.location.origin}/permiso?id=${t.token}`
                          : `/permiso?id=${t.token}`;
                        return (
                          <div
                            key={t.token}
                            className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5 border border-slate-200"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-700 truncate">
                                {est.nombre} {est.apellido}
                              </p>
                              <p className="text-xs text-slate-400 font-mono truncate">{url}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => copiarEnlace(t.token)}
                              className="flex-shrink-0 p-2 rounded-md text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              aria-label={`Copiar enlace de ${est.nombre} ${est.apellido}`}
                            >
                              {copiado === t.token ? (
                                <CheckCircle size={15} className="text-emerald-600" aria-hidden="true" />
                              ) : (
                                <Copy size={15} aria-hidden="true" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {eventos.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <Calendar size={32} className="text-slate-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-slate-500 font-medium">No hay eventos creados</p>
          <p className="text-sm text-slate-400 mt-1">Crea el primer evento para comenzar</p>
        </div>
      )}
    </div>
  );
}

function CampoForm({
  id, label, valor, onChange, error, placeholder, requerido = false,
}: {
  id: string; label: string; valor: string; onChange: (v: string) => void;
  error?: string; placeholder?: string; requerido?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}
        {requerido && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 placeholder-slate-400 ${
          error ? "border-red-400" : "border-slate-300"
        }`}
        required={requerido}
      />
      {error && <p className="text-xs text-red-600 mt-1" role="alert">{error}</p>}
    </div>
  );
}
