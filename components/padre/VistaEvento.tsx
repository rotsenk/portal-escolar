"use client";

/**
 * VistaEvento — Vista principal del Portal del Padre.
 * Permite leer el evento, autorizar/denegar, firmar y ver el comprobante.
 *
 * Requisitos cubiertos:
 * - Req 1: Visualización de evento
 * - Req 2: Proceso de autorización y denegación
 * - Req 3: Generación y presentación del comprobante
 */

import { useState, useCallback } from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Printer,
  Hash,
} from "lucide-react";
import FirmaCanvas from "@/components/FirmaCanvas";
import CodigoQR from "@/components/CodigoQR";
import FormPersonaAutorizada from "@/components/padre/FormPersonaAutorizada";
import { Evento, Estudiante, Autorizacion, EstadoAutorizacion } from "@/lib/types";
import { generarCodigoComprobante, AUTORIZACIONES, plazoAbierto } from "@/lib/store";

// Pasos del flujo de autorización
type Paso = "detalle" | "firma" | "motivo_denegacion" | "comprobante" | "cambio_decision";

interface VistaEventoProps {
  evento: Evento;
  estudiante: Estudiante;
  autorizacionInicial: Autorizacion | null;
}

export default function VistaEvento({
  evento,
  estudiante,
  autorizacionInicial,
}: VistaEventoProps) {
  const [paso, setPaso] = useState<Paso>(
    autorizacionInicial ? "comprobante" : "detalle"
  );
  const [decisionPendiente, setDecisionPendiente] = useState<EstadoAutorizacion | null>(null);
  const [firma, setFirma] = useState<string | null>(null);
  const [motivoDenegacion, setMotivoDenegacion] = useState("");
  const [justificacionCambio, setJustificacionCambio] = useState("");
  const [autorizacion, setAutorizacion] = useState<Autorizacion | null>(autorizacionInicial);
  const [errorFirma, setErrorFirma] = useState(false);

  const esPlazoAbierto = plazoAbierto(evento);
  const fechaEvento = new Date(evento.fecha + "T" + evento.hora);
  const fechaLimite = new Date(evento.fechaLimiteRespuesta);

  // Formatea fecha en español
  const formatearFecha = (d: Date) =>
    d.toLocaleDateString("es-CR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatearHora = (d: Date) =>
    d.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });

  /** Inicia flujo de decisión */
  const iniciarDecision = (decision: EstadoAutorizacion) => {
    setDecisionPendiente(decision);
    if (decision === "denegado") {
      setPaso("motivo_denegacion");
    } else {
      setPaso("firma");
    }
  };

  /** Inicia flujo de cambio de decisión */
  const iniciarCambioDecision = () => {
    setFirma(null);
    setJustificacionCambio("");
    setPaso("cambio_decision");
  };

  /** Confirma la autorización o denegación */
  const confirmarDecision = useCallback(() => {
    if (!firma) {
      setErrorFirma(true);
      return;
    }
    setErrorFirma(false);

    const codigo =
      decisionPendiente === "autorizado" ? generarCodigoComprobante() : undefined;

    const nuevaAutorizacion: Autorizacion = {
      id: `aut-${Date.now()}`,
      tokenAcceso: "TKN-ACTIVO",
      eventoId: evento.id,
      estudianteId: estudiante.id,
      estado: decisionPendiente!,
      motivoDenegacion: decisionPendiente === "denegado" ? motivoDenegacion : undefined,
      firmaSvg: firma,
      fechaRespuesta: new Date().toISOString(),
      codigoComprobante: codigo,
    };

    // En prototipo: persistimos en el array en memoria
    AUTORIZACIONES.push(nuevaAutorizacion);
    setAutorizacion(nuevaAutorizacion);
    setPaso("comprobante");
  }, [firma, decisionPendiente, motivoDenegacion, evento.id, estudiante.id]);

  /** Confirma cambio de decisión */
  const confirmarCambioDecision = useCallback(
    (nuevaDecision: EstadoAutorizacion) => {
      if (!firma || !justificacionCambio.trim()) return;

      const codigo =
        nuevaDecision === "autorizado" ? generarCodigoComprobante() : undefined;

      const aut: Autorizacion = {
        id: `aut-${Date.now()}`,
        tokenAcceso: autorizacion?.tokenAcceso ?? "",
        eventoId: evento.id,
        estudianteId: estudiante.id,
        estado: nuevaDecision,
        justificacionCambio,
        firmaSvg: firma,
        fechaRespuesta: new Date().toISOString(),
        codigoComprobante: codigo,
      };

      AUTORIZACIONES.push(aut);
      setAutorizacion(aut);
      setPaso("comprobante");
    },
    [firma, justificacionCambio, autorizacion, evento.id, estudiante.id]
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* ─── Cabecera ─────────────────────────────────────────────────── */}
      <header className="bg-[#0F172A] text-white px-4 py-4 shadow-md">
        <div className="max-w-lg mx-auto">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Portal de Autorizaciones
          </p>
          <h1 className="text-lg font-semibold mt-0.5">Escuela Primaria</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* ─── Tarjeta del estudiante ──────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
          <div className="bg-blue-100 rounded-full p-2.5">
            <User size={20} className="text-blue-700" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Estudiante</p>
            <p className="text-base font-semibold text-[#0F172A]">
              {estudiante.nombre} {estudiante.apellido}
            </p>
            <p className="text-xs text-slate-500">{estudiante.grado}</p>
          </div>
        </div>

        {/* ─── PASO: Detalle del evento ─────────────────────────────────── */}
        {paso === "detalle" && (
          <PasoDetalle
            evento={evento}
            fechaEvento={fechaEvento}
            fechaLimite={fechaLimite}
            formatearFecha={formatearFecha}
            formatearHora={formatearHora}
            esPlazoAbierto={esPlazoAbierto}
            onDecision={iniciarDecision}
          />
        )}

        {/* ─── PASO: Firma (autorizar) ──────────────────────────────────── */}
        {paso === "firma" && (
          <PasoFirma
            decision={decisionPendiente!}
            firma={firma}
            errorFirma={errorFirma}
            onFirmaChange={(f) => { setFirma(f); setErrorFirma(false); }}
            onConfirmar={confirmarDecision}
            onVolver={() => setPaso("detalle")}
          />
        )}

        {/* ─── PASO: Motivo de denegación ───────────────────────────────── */}
        {paso === "motivo_denegacion" && (
          <PasoMotivoDenegacion
            motivo={motivoDenegacion}
            onMotivoChange={setMotivoDenegacion}
            onContinuar={() => setPaso("firma")}
            onVolver={() => setPaso("detalle")}
          />
        )}

        {/* ─── PASO: Cambio de decisión ─────────────────────────────────── */}
        {paso === "cambio_decision" && autorizacion && (
          <PasoCambioDecision
            estadoActual={autorizacion.estado}
            firma={firma}
            justificacion={justificacionCambio}
            onFirmaChange={setFirma}
            onJustificacionChange={setJustificacionCambio}
            onConfirmar={confirmarCambioDecision}
            onVolver={() => setPaso("comprobante")}
          />
        )}

        {/* ─── PASO: Comprobante ────────────────────────────────────────── */}
        {paso === "comprobante" && autorizacion && (
          <PasoComprobante
            autorizacion={autorizacion}
            evento={evento}
            estudiante={estudiante}
            formatearFecha={formatearFecha}
            esPlazoAbierto={esPlazoAbierto}
            onCambiarDecision={iniciarCambioDecision}
          />
        )}

        {/* ─── Formulario personas autorizadas (siempre visible) ──────── */}
        <FormPersonaAutorizada estudiante={estudiante} />

      </main>
    </div>
  );
}

// ─── Sub-componentes de pasos ────────────────────────────────────────────────

interface PasoDetalleProps {
  evento: Evento;
  fechaEvento: Date;
  fechaLimite: Date;
  formatearFecha: (d: Date) => string;
  formatearHora: (d: Date) => string;
  esPlazoAbierto: boolean;
  onDecision: (d: EstadoAutorizacion) => void;
}

function PasoDetalle({
  evento,
  fechaEvento,
  fechaLimite,
  formatearFecha,
  formatearHora,
  esPlazoAbierto,
  onDecision,
}: PasoDetalleProps) {
  return (
    <>
      {/* Tarjeta del evento */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-[#1D4ED8] px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-200" aria-hidden="true" />
            <p className="text-xs text-blue-200 font-medium uppercase tracking-wider">
              Solicitud de autorización
            </p>
          </div>
          <h2 className="text-xl font-semibold text-white mt-1">{evento.nombre}</h2>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-sm text-slate-600 leading-relaxed">{evento.descripcion}</p>

          <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100">
            <InfoRow icon={Calendar} label="Fecha" valor={formatearFecha(fechaEvento)} />
            <InfoRow icon={Clock} label="Hora" valor={formatearHora(fechaEvento)} />
            <InfoRow
              icon={DollarSign}
              label="Costo"
              valor={evento.costo === 0 ? "Sin costo" : `$${evento.costo.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
            <InfoRow
              icon={AlertCircle}
              label="Responder antes del"
              valor={formatearFecha(fechaLimite)}
              claseValor={!esPlazoAbierto ? "text-red-600 font-semibold" : ""}
            />
          </div>
        </div>
      </div>

      {/* Aviso de plazo cerrado (solo lectura) */}
      {!esPlazoAbierto && (
        <div
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3"
          role="alert"
        >
          <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Plazo de respuesta cerrado</p>
            <p className="text-sm text-amber-700 mt-0.5">
              El tiempo para responder esta solicitud ha vencido. No es posible modificar la autorización.
            </p>
          </div>
        </div>
      )}

      {/* Botones de decisión — solo si el plazo está abierto */}
      {esPlazoAbierto && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600 text-center font-medium">
            ¿Autoriza la participación de su hijo/a en este evento?
          </p>
          <button
            type="button"
            onClick={() => onDecision("autorizado")}
            className="btn-touch w-full flex items-center justify-center gap-2 bg-[#15803D] hover:bg-green-700 active:bg-green-800 text-white font-semibold rounded-lg px-6 py-4 transition-colors shadow-sm"
            aria-label="Autorizar la participación en el evento"
          >
            <CheckCircle size={22} aria-hidden="true" />
            Autorizar participación
            <ChevronRight size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDecision("denegado")}
            className="btn-touch w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 active:bg-red-100 text-[#C2410C] border-2 border-[#C2410C] font-semibold rounded-lg px-6 py-4 transition-colors"
            aria-label="Denegar la participación en el evento"
          >
            <XCircle size={22} aria-hidden="true" />
            Denegar participación
          </button>
        </div>
      )}
    </>
  );
}

// ─── Componente de fila informativa ─────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  valor,
  claseValor = "",
}: {
  icon: React.ElementType;
  label: string;
  valor: string;
  claseValor?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="bg-slate-100 rounded-md p-1.5 mt-0.5 flex-shrink-0">
        <Icon size={14} className="text-slate-500" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className={`text-sm text-slate-800 font-semibold ${claseValor}`}>{valor}</p>
      </div>
    </div>
  );
}

// ─── Paso: Firma ─────────────────────────────────────────────────────────────

function PasoFirma({
  decision,
  firma,
  errorFirma,
  onFirmaChange,
  onConfirmar,
  onVolver,
}: {
  decision: EstadoAutorizacion;
  firma: string | null;
  errorFirma: boolean;
  onFirmaChange: (f: string | null) => void;
  onConfirmar: () => void;
  onVolver: () => void;
}) {
  const esAutorizar = decision === "autorizado";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
      <div
        className={`flex items-center gap-3 p-3 rounded-lg ${
          esAutorizar ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"
        }`}
      >
        {esAutorizar ? (
          <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
        ) : (
          <XCircle size={20} className="text-red-600 flex-shrink-0" aria-hidden="true" />
        )}
        <p className={`text-sm font-semibold ${esAutorizar ? "text-emerald-800" : "text-red-800"}`}>
          {esAutorizar ? "Confirmando autorización" : "Confirmando denegación"}
        </p>
      </div>

      <FirmaCanvas onFirmaChange={onFirmaChange} />

      {errorFirma && (
        <p className="text-sm text-red-600 flex items-center gap-1" role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          Por favor, dibuje su firma antes de confirmar.
        </p>
      )}

      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={onConfirmar}
          disabled={!firma}
          className={`btn-touch w-full flex items-center justify-center gap-2 font-semibold rounded-lg px-6 py-4 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
            esAutorizar
              ? "bg-[#15803D] hover:bg-green-700 text-white"
              : "bg-[#C2410C] hover:bg-orange-800 text-white"
          }`}
          aria-label={esAutorizar ? "Confirmar autorización con firma" : "Confirmar denegación con firma"}
        >
          {esAutorizar ? <CheckCircle size={20} aria-hidden="true" /> : <XCircle size={20} aria-hidden="true" />}
          {esAutorizar ? "Confirmar autorización" : "Confirmar denegación"}
        </button>
        <button
          type="button"
          onClick={onVolver}
          className="btn-touch w-full text-slate-600 hover:text-slate-800 font-medium rounded-lg px-6 py-3 transition-colors border border-slate-200 hover:bg-slate-50"
        >
          Volver
        </button>
      </div>
    </div>
  );
}

// ─── Paso: Motivo de denegación ───────────────────────────────────────────────

function PasoMotivoDenegacion({
  motivo,
  onMotivoChange,
  onContinuar,
  onVolver,
}: {
  motivo: string;
  onMotivoChange: (m: string) => void;
  onContinuar: () => void;
  onVolver: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
        <XCircle size={20} className="text-red-600 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm font-semibold text-red-800">Denegando participación</p>
      </div>

      <div>
        <label
          htmlFor="motivo-denegacion"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          Motivo (opcional)
        </label>
        <textarea
          id="motivo-denegacion"
          value={motivo}
          onChange={(e) => onMotivoChange(e.target.value)}
          placeholder="Indique el motivo por el cual deniega la participación..."
          rows={3}
          className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-700 placeholder-slate-400"
          maxLength={500}
        />
        <p className="text-xs text-slate-400 text-right mt-1">{motivo.length}/500</p>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onContinuar}
          className="btn-touch w-full flex items-center justify-center gap-2 bg-[#C2410C] hover:bg-orange-800 text-white font-semibold rounded-lg px-6 py-4 transition-colors shadow-sm"
        >
          Continuar con la firma
          <ChevronRight size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onVolver}
          className="btn-touch w-full text-slate-600 font-medium rounded-lg px-6 py-3 transition-colors border border-slate-200 hover:bg-slate-50"
        >
          Volver
        </button>
      </div>
    </div>
  );
}

// ─── Paso: Cambio de decisión ─────────────────────────────────────────────────

function PasoCambioDecision({
  estadoActual,
  firma,
  justificacion,
  onFirmaChange,
  onJustificacionChange,
  onConfirmar,
  onVolver,
}: {
  estadoActual: EstadoAutorizacion;
  firma: string | null;
  justificacion: string;
  onFirmaChange: (f: string | null) => void;
  onJustificacionChange: (j: string) => void;
  onConfirmar: (nuevaDecision: EstadoAutorizacion) => void;
  onVolver: () => void;
}) {
  const nuevaDecision: EstadoAutorizacion =
    estadoActual === "autorizado" ? "denegado" : "autorizado";
  const listo = firma && justificacion.trim().length >= 10;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
        <AlertCircle size={20} className="text-amber-600 flex-shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Cambio de decisión</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Cambiará de{" "}
            <strong>{estadoActual === "autorizado" ? "Autorizado" : "Denegado"}</strong>{" "}
            a <strong>{nuevaDecision === "autorizado" ? "Autorizado" : "Denegado"}</strong>.
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="justificacion-cambio"
          className="block text-sm font-semibold text-slate-700 mb-2"
        >
          Justificación del cambio
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        </label>
        <textarea
          id="justificacion-cambio"
          value={justificacion}
          onChange={(e) => onJustificacionChange(e.target.value)}
          placeholder="Explique el motivo del cambio de decisión (mínimo 10 caracteres)..."
          rows={3}
          className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-700 placeholder-slate-400"
          maxLength={500}
          required
        />
      </div>

      <FirmaCanvas onFirmaChange={onFirmaChange} />

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => onConfirmar(nuevaDecision)}
          disabled={!listo}
          className="btn-touch w-full flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-blue-800 text-white font-semibold rounded-lg px-6 py-4 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Confirmar cambio de decisión"
        >
          <CheckCircle size={20} aria-hidden="true" />
          Confirmar cambio
        </button>
        <button
          type="button"
          onClick={onVolver}
          className="btn-touch w-full text-slate-600 font-medium rounded-lg px-6 py-3 transition-colors border border-slate-200 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── Paso: Comprobante ────────────────────────────────────────────────────────

function PasoComprobante({
  autorizacion,
  evento,
  estudiante,
  formatearFecha,
  esPlazoAbierto,
  onCambiarDecision,
}: {
  autorizacion: Autorizacion;
  evento: Evento;
  estudiante: Estudiante;
  formatearFecha: (d: Date) => string;
  esPlazoAbierto: boolean;
  onCambiarDecision: () => void;
}) {
  const esAutorizado = autorizacion.estado === "autorizado";
  const fechaRespuesta = autorizacion.fechaRespuesta
    ? new Date(autorizacion.fechaRespuesta)
    : null;

  const imprimirComprobante = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Banner de estado */}
      <div
        className={`rounded-xl p-5 text-center ${
          esAutorizado
            ? "bg-emerald-50 border-2 border-emerald-400"
            : "bg-red-50 border-2 border-red-400"
        }`}
        role="status"
        aria-live="polite"
      >
        {esAutorizado ? (
          <CheckCircle size={40} className="text-emerald-600 mx-auto mb-2" aria-hidden="true" />
        ) : (
          <XCircle size={40} className="text-red-500 mx-auto mb-2" aria-hidden="true" />
        )}
        <p
          className={`text-lg font-bold ${
            esAutorizado ? "text-emerald-800" : "text-red-800"
          }`}
        >
          {esAutorizado ? "Participación autorizada" : "Participación denegada"}
        </p>
        <p className="text-sm text-slate-600 mt-1">{evento.nombre}</p>
        {fechaRespuesta && (
          <p className="text-xs text-slate-500 mt-2">
            Registrado el{" "}
            {fechaRespuesta.toLocaleDateString("es-CR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>

      {/* Comprobante (solo si está autorizado) */}
      {esAutorizado && autorizacion.codigoComprobante && (
        <div
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 print:shadow-none"
          id="comprobante-imprimible"
        >
          <div className="text-center border-b border-slate-100 pb-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
              Comprobante oficial
            </p>
            <p className="text-xl font-bold text-[#0F172A]">
              {estudiante.nombre} {estudiante.apellido}
            </p>
            <p className="text-sm text-slate-500">{estudiante.grado}</p>
          </div>

          {/* Código alfanumérico */}
          <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Hash size={16} className="text-slate-500" aria-hidden="true" />
              <p className="text-xs text-slate-500 font-medium">Código de comprobante</p>
            </div>
            <p
              className="text-2xl font-bold tracking-widest text-[#0F172A] font-mono"
              aria-label={`Código: ${autorizacion.codigoComprobante}`}
            >
              {autorizacion.codigoComprobante}
            </p>
          </div>

          {/* QR */}
          <div className="flex justify-center">
            <CodigoQR
              valor={`${autorizacion.codigoComprobante}|${estudiante.nombre} ${estudiante.apellido}|${evento.nombre}`}
              tamano={180}
            />
          </div>

          <div className="text-center text-xs text-slate-500 space-y-1 border-t border-slate-100 pt-3">
            <p>Evento: <strong>{evento.nombre}</strong></p>
            <p>Fecha: <strong>{formatearFecha(new Date(evento.fecha + "T" + evento.hora))}</strong></p>
          </div>

          {/* Botón de impresión */}
          <button
            type="button"
            onClick={imprimirComprobante}
            className="btn-touch w-full flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white font-semibold rounded-lg px-6 py-3 transition-colors print:hidden"
            aria-label="Imprimir o guardar el comprobante"
          >
            <Printer size={18} aria-hidden="true" />
            Imprimir o guardar
          </button>
        </div>
      )}

      {/* Opción de cambiar decisión si el plazo está abierto */}
      {esPlazoAbierto && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-3">
            ¿Necesita cambiar su decisión? El plazo de respuesta aún está abierto.
          </p>
          <button
            type="button"
            onClick={onCambiarDecision}
            className="btn-touch w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg px-6 py-3 transition-colors"
            aria-label="Cambiar la decisión de autorización"
          >
            <AlertCircle size={18} aria-hidden="true" />
            Cambiar mi decisión
          </button>
        </div>
      )}
    </div>
  );
}
