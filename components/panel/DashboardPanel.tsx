"use client";

/**
 * DashboardPanel — Vista principal del Panel Escolar (Sofía / maestra).
 * Gestiona pestañas entre Eventos, Recogidas y vista general.
 *
 * Requisitos cubiertos:
 * - Req 4, 5, 6 (panel escolar)
 * - Criterio: Panel de Control para Maestras con indicadores visuales de estado
 */

import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  GraduationCap,
} from "lucide-react";
import NavPanel from "./NavPanel";
import TabEventos from "./TabEventos";
import TabRecogidas from "./TabRecogidas";
import BadgeEstado from "@/components/BadgeEstado";
import { UsuarioEscolar } from "@/lib/types";
import { EVENTOS, ESTUDIANTES, obtenerResumenEvento } from "@/lib/store";

type Pestaña = "resumen" | "eventos" | "recogidas";

interface DashboardPanelProps {
  usuario: UsuarioEscolar;
  onCerrarSesion: () => void;
}

export default function DashboardPanel({ usuario, onCerrarSesion }: DashboardPanelProps) {
  const [pestana, setPestana] = useState<Pestaña>("resumen");

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <NavPanel usuario={usuario} onCerrarSesion={onCerrarSesion} />

      {/* Navegación de pestañas */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex gap-1" role="tablist" aria-label="Secciones del panel escolar">
            {(
              [
                { id: "resumen", label: "Resumen", icon: LayoutDashboard },
                { id: "eventos", label: "Eventos", icon: Calendar },
                { id: "recogidas", label: "Recogidas", icon: Users },
              ] as { id: Pestaña; label: string; icon: React.ElementType }[]
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={pestana === id}
                aria-controls={`panel-${id}`}
                onClick={() => setPestana(id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                  pestana === id
                    ? "border-[#1D4ED8] text-[#1D4ED8]"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenido de pestañas */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {pestana === "resumen" && (
          <div id="panel-resumen" role="tabpanel" aria-labelledby="tab-resumen">
            <ResumenGeneral />
          </div>
        )}
        {pestana === "eventos" && (
          <div id="panel-eventos" role="tabpanel" aria-labelledby="tab-eventos">
            <TabEventos />
          </div>
        )}
        {pestana === "recogidas" && (
          <div id="panel-recogidas" role="tabpanel" aria-labelledby="tab-recogidas">
            <TabRecogidas />
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Resumen general ─────────────────────────────────────────────────────────

function ResumenGeneral() {
  // Datos calculados del primer evento como ejemplo del dashboard
  const evento = EVENTOS[0];
  const resumen = evento ? obtenerResumenEvento(evento.id) : [];
  const totalAutorizados = resumen.filter((r) => r.estado === "autorizado").length;
  const totalPendientes = resumen.filter((r) => r.estado === "pendiente").length;
  const totalDenegados = resumen.filter((r) => r.estado === "denegado").length;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#0F172A]">Resumen general</h2>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricaCard
          valor={ESTUDIANTES.length}
          label="Estudiantes"
          icon={GraduationCap}
          claseColor="bg-blue-50 text-blue-700 border-blue-200"
          claseIcono="text-blue-600"
        />
        <MetricaCard
          valor={totalAutorizados}
          label="Autorizados"
          icon={CheckCircle}
          claseColor="bg-emerald-50 text-emerald-700 border-emerald-200"
          claseIcono="text-emerald-600"
        />
        <MetricaCard
          valor={totalPendientes}
          label="Pendientes"
          icon={Clock}
          claseColor="bg-orange-50 text-orange-700 border-orange-200"
          claseIcono="text-orange-500"
        />
        <MetricaCard
          valor={totalDenegados}
          label="Denegados"
          icon={XCircle}
          claseColor="bg-red-50 text-red-700 border-red-200"
          claseIcono="text-red-500"
        />
      </div>

      {/* Tabla maestra — criterio verificable: lista de alumnos filtrable por salón */}
      {evento && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-base font-semibold text-[#0F172A]">
              {evento.nombre} — Estado por alumno
            </p>
            <span className="text-xs text-slate-500">
              {new Date(evento.fecha + "T12:00:00").toLocaleDateString("es-CR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Filtro por grado */}
          <FiltrableTablaAlumnos resumen={resumen} />
        </div>
      )}
    </div>
  );
}

// ─── Tabla filtrable de alumnos ───────────────────────────────────────────────

function FiltrableTablaAlumnos({
  resumen,
}: {
  resumen: ReturnType<typeof obtenerResumenEvento>;
}) {
  const [filtroGrado, setFiltroGrado] = useState("todos");

  // Obtener grados únicos
  const grados = Array.from(new Set(resumen.map((r) => r.estudiante.grado))).sort();

  const filtrado = filtroGrado === "todos"
    ? resumen
    : resumen.filter((r) => r.estudiante.grado === filtroGrado);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Filtros */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 flex-wrap">
        <p className="text-xs font-semibold text-slate-500 mr-1">Filtrar por grado:</p>
        <button
          type="button"
          onClick={() => setFiltroGrado("todos")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            filtroGrado === "todos"
              ? "bg-[#1D4ED8] text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
          aria-pressed={filtroGrado === "todos"}
        >
          Todos
        </button>
        {grados.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setFiltroGrado(g)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              filtroGrado === g
                ? "bg-[#1D4ED8] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            aria-pressed={filtroGrado === g}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Lista de estudiantes con estado de autorización">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th scope="col" className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Estudiante
              </th>
              <th scope="col" className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Grado
              </th>
              <th scope="col" className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                Recogedores registrados
              </th>
            </tr>
          </thead>
          <tbody>
            {filtrado.map((r, idx) => (
              <tr
                key={r.estudiante.id}
                className={`border-b border-slate-100 last:border-0 transition-colors ${
                  idx % 2 === 1 ? "bg-slate-50" : "bg-white"
                } hover:bg-blue-50`}
              >
                <td className="px-5 py-3.5 font-semibold text-[#0F172A]">
                  {r.estudiante.nombre} {r.estudiante.apellido}
                </td>
                <td className="px-5 py-3.5 text-slate-600 text-xs font-medium">
                  {r.estudiante.grado}
                </td>
                <td className="px-5 py-3.5">
                  <BadgeEstado estado={r.estado} tamano="sm" />
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  {r.estudiante.personasAutorizadas.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {r.estudiante.personasAutorizadas.map((pa) => (
                        <span
                          key={pa.id}
                          className="text-xs bg-slate-100 text-slate-600 rounded px-2 py-0.5"
                        >
                          {pa.nombreCompleto.split(" ")[0]} ({pa.parentesco})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Sin recogedores</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtrado.length === 0 && (
        <div className="px-5 py-8 text-center text-slate-400 text-sm">
          No hay estudiantes en este grado.
        </div>
      )}
    </div>
  );
}

// ─── Tarjeta de métrica ───────────────────────────────────────────────────────

function MetricaCard({
  valor,
  label,
  icon: Icon,
  claseColor,
  claseIcono,
}: {
  valor: number;
  label: string;
  icon: React.ElementType;
  claseColor: string;
  claseIcono: string;
}) {
  return (
    <div className={`bg-white rounded-xl border ${claseColor} shadow-sm p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-[#0F172A]">{valor}</p>
          <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
        </div>
        <Icon size={22} className={claseIcono} aria-hidden="true" />
      </div>
    </div>
  );
}
