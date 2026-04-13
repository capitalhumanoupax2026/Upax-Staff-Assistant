import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  Search, X, Save, ChevronDown, ShieldCheck, LogOut, Loader2,
  Database, CheckCircle2, AlertCircle
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface HrResponse {
  id: number;
  preguntaTexto: string;
  respuesta: string;
  categoria: string;
  udn: string;
  consultora: string;
  tipo: string;
  activa: boolean;
  createdAt: string;
}

const EMPTY_FORM: Omit<HrResponse, "id" | "createdAt"> = {
  preguntaTexto: "",
  respuesta: "",
  categoria: "",
  udn: "GENERAL",
  consultora: "GENERAL",
  tipo: "GENERAL",
  activa: true,
};

const CATEGORIAS = [
  "Vacaciones", "Prestaciones", "Nómina", "IMSS",
  "Constancia laboral", "SGMM y SMMm", "Beneficios",
];
const TIPOS = ["GENERAL", "INTERNO", "EXTERNO"];
const ACCENT = "#E85A29";

// ─── API helpers ──────────────────────────────────────────────────────────────
const PIN_KEY = "upax_admin_pin";

function getPin() { return localStorage.getItem(PIN_KEY) || ""; }
function savePin(p: string) { localStorage.setItem(PIN_KEY, p); }
function clearPin() { localStorage.removeItem(PIN_KEY); }

async function apiFetch(path: string, opts: RequestInit = {}, pin: string) {
  const res = await fetch(path, {
    ...opts,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-admin-pin": pin,
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error((await res.json()).message || "Error");
  return res.json();
}

// ─── Toast mini ───────────────────────────────────────────────────────────────
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-4 right-4 z-[200] flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-xl ${ok ? "bg-emerald-500" : "bg-red-500"}`}
    >
      {ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {msg}
    </motion.div>
  );
}

// ─── PIN Screen ───────────────────────────────────────────────────────────────
function PinScreen({ onSuccess }: { onSuccess: (pin: string) => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
        credentials: "include",
      }).then(async r => {
        if (!r.ok) throw new Error((await r.json()).message);
        return r.json();
      });
      savePin(pin);
      onSuccess(pin);
    } catch {
      setError("PIN incorrecto. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg,#fff8f6 0%,#fff 100%)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-orange-100"
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: `${ACCENT}18` }}>
          <ShieldCheck className="w-8 h-8" style={{ color: ACCENT }} />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Panel de Administración</h1>
        <p className="text-sm text-gray-500 mb-6">Base de Conocimiento HR · Grupo UPAX</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="PIN de administrador"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-center tracking-widest outline-none focus:ring-2 text-gray-800"
            style={{ focusRingColor: ACCENT }}
            autoFocus
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={!pin || loading}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-all active:scale-98"
            style={{ background: `linear-gradient(135deg,${ACCENT},#c44a20)` }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Ingresar"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Response Modal (Create / Edit) ───────────────────────────────────────────
function ResponseModal({
  row, onSave, onClose, pin,
}: {
  row: Partial<HrResponse> | null;
  onSave: () => void;
  onClose: () => void;
  pin: string;
}) {
  const isEdit = !!(row && row.id);
  const [form, setForm] = useState<Omit<HrResponse, "id" | "createdAt">>({ ...EMPTY_FORM, ...row });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.preguntaTexto.trim() || !form.respuesta.trim() || !form.categoria.trim()) {
      setError("Pregunta, respuesta y categoría son obligatorias.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await apiFetch(`/api/admin/responses/${row!.id}`, { method: "PUT", body: JSON.stringify(form) }, pin);
      } else {
        await apiFetch("/api/admin/responses", { method: "POST", body: JSON.stringify(form) }, pin);
      }
      onSave();
    } catch (e: any) {
      setError(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );

  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-900">{isEdit ? "Editar respuesta" : "Nueva respuesta"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoría">
              <select value={form.categoria} onChange={e => set("categoria", e.target.value)} className={inputClass}>
                <option value="">Selecciona…</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__custom">Otra…</option>
              </select>
              {form.categoria === "__custom" && (
                <input className={inputClass + " mt-1"} placeholder="Escribe la categoría" onBlur={e => set("categoria", e.target.value)} />
              )}
            </Field>
            <Field label="Tipo">
              <select value={form.tipo} onChange={e => set("tipo", e.target.value)} className={inputClass}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Consultora">
              <input value={form.consultora} onChange={e => set("consultora", e.target.value)} placeholder="GENERAL / MASTER TALENT / …" className={inputClass} />
            </Field>
            <Field label="UDN">
              <input value={form.udn} onChange={e => set("udn", e.target.value)} placeholder="GENERAL / UIX / RESEARCHLAND / …" className={inputClass} />
            </Field>
          </div>

          <Field label="Pregunta (texto que el empleado envía)">
            <input value={form.preguntaTexto} onChange={e => set("preguntaTexto", e.target.value)} placeholder="¿Cómo solicito mis vacaciones?" className={inputClass} />
          </Field>

          <Field label="Respuesta del chatbot">
            <textarea
              value={form.respuesta}
              onChange={e => set("respuesta", e.target.value)}
              rows={10}
              placeholder="Escribe la respuesta completa aquí. Puedes usar **negrita**, - listas, y links."
              className={inputClass + " resize-none font-mono text-xs"}
            />
          </Field>

          <div className="flex items-center gap-2">
            <button onClick={() => set("activa", !form.activa)} className="flex items-center gap-2 text-sm font-medium">
              {form.activa
                ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                : <ToggleLeft className="w-5 h-5 text-gray-400" />}
              <span className={form.activa ? "text-emerald-700" : "text-gray-400"}>
                {form.activa ? "Activa" : "Desactivada"}
              </span>
            </button>
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg,${ACCENT},#c44a20)` }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? "Guardar cambios" : "Crear respuesta"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
export default function AdminPage() {
  const [pin, setPin] = useState(getPin);
  const [authed, setAuthed] = useState(false);

  const [rows, setRows] = useState<HrResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Todas");
  const [filterCons, setFilterCons] = useState("Todas");
  const [filterTipo, setFilterTipo] = useState("Todos");

  const [modal, setModal] = useState<Partial<HrResponse> | null | false>(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRows = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/admin/responses", {}, p);
      setRows(data);
    } catch {
      showToast("Error al cargar respuestas", false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAuth = async (p: string) => {
    setPin(p);
    setAuthed(true);
    fetchRows(p);
  };

  // Auto-auth si el PIN ya está guardado
  useEffect(() => {
    if (pin) {
      fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
        credentials: "include",
      }).then(r => {
        if (r.ok) { setAuthed(true); fetchRows(pin); }
        else clearPin();
      }).catch(() => clearPin());
    }
  }, []);

  const handleToggle = async (row: HrResponse) => {
    try {
      const updated = await apiFetch(`/api/admin/responses/${row.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...row, activa: !row.activa }),
      }, pin);
      setRows(rs => rs.map(r => r.id === row.id ? updated : r));
    } catch {
      showToast("Error al cambiar estado", false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/responses/${deleteId}`, { method: "DELETE" }, pin);
      setRows(rs => rs.filter(r => r.id !== deleteId));
      setDeleteId(null);
      showToast("Respuesta eliminada");
    } catch {
      showToast("Error al eliminar", false);
    } finally {
      setDeleting(false);
    }
  };

  if (!authed) return <PinScreen onSuccess={handleAuth} />;

  // Filtros
  const consultoraOptions = ["Todas", ...Array.from(new Set(rows.map(r => r.consultora)))];
  const categoriaOptions = ["Todas", ...Array.from(new Set(rows.map(r => r.categoria)))];

  const filtered = rows.filter(r => {
    if (filterCat !== "Todas" && r.categoria !== filterCat) return false;
    if (filterCons !== "Todas" && r.consultora !== filterCons) return false;
    if (filterTipo !== "Todos" && r.tipo !== filterTipo) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.preguntaTexto.toLowerCase().includes(q) || r.respuesta.toLowerCase().includes(q) || r.categoria.toLowerCase().includes(q);
    }
    return true;
  });

  const selectClass = "text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 outline-none bg-white cursor-pointer";

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Toast */}
      <AnimatePresence>{toast && <Toast msg={toast.msg} ok={toast.ok} />}</AnimatePresence>

      {/* Modal crear/editar */}
      <AnimatePresence>
        {modal !== false && (
          <ResponseModal
            row={modal}
            pin={pin}
            onClose={() => setModal(false)}
            onSave={() => { setModal(false); fetchRows(pin); showToast(modal?.id ? "Respuesta actualizada" : "Respuesta creada"); }}
          />
        )}
      </AnimatePresence>

      {/* Modal eliminar */}
      <AnimatePresence>
        {deleteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full text-center">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">¿Eliminar respuesta?</h3>
              <p className="text-sm text-gray-500 mb-4">Esta acción no se puede deshacer.</p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-50">
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Eliminar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}18` }}>
              <Database className="w-4 h-4" style={{ color: ACCENT }} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">Base de Conocimiento HR</p>
              <p className="text-[10px] text-gray-400">Grupo UPAX · Panel de Administración</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{rows.length} respuestas en total</span>
            <button
              onClick={() => { clearPin(); setAuthed(false); setPin(""); }}
              title="Cerrar sesión"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Búsqueda */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-48">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar pregunta o respuesta…"
              className="flex-1 text-sm outline-none text-gray-800 placeholder:text-gray-400 bg-transparent"
            />
            {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-gray-400" /></button>}
          </div>

          {/* Filtros */}
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className={selectClass}>
            {categoriaOptions.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filterCons} onChange={e => setFilterCons(e.target.value)} className={selectClass}>
            {consultoraOptions.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className={selectClass}>
            {["Todos", ...TIPOS].map(t => <option key={t}>{t}</option>)}
          </select>

          {/* Agregar */}
          <button
            onClick={() => setModal({})}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
            style={{ background: `linear-gradient(135deg,${ACCENT},#c44a20)` }}
          >
            <Plus className="w-4 h-4" />
            Nueva respuesta
          </button>
        </div>

        {/* Resultados */}
        <div className="text-xs text-gray-400">
          Mostrando {filtered.length} de {rows.length} respuestas
        </div>

        {/* Tabla / Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: ACCENT }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">No hay respuestas que coincidan con los filtros.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((row) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl border p-4 transition-all ${!row.activa ? "opacity-60" : ""}`}
                style={{ borderColor: row.activa ? "#f3f4f6" : "#e5e7eb" }}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Badges + Pregunta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                        {row.categoria}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${row.tipo === "EXTERNO" ? "bg-blue-50 text-blue-700 border-blue-200" : row.tipo === "INTERNO" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {row.tipo}
                      </span>
                      {row.consultora !== "GENERAL" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          {row.consultora}
                        </span>
                      )}
                      {row.udn !== "GENERAL" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                          UDN: {row.udn}
                        </span>
                      )}
                      {!row.activa && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                          Desactivada
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-gray-900 mb-1 truncate">{row.preguntaTexto}</p>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{row.respuesta}</p>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggle(row)}
                      title={row.activa ? "Desactivar" : "Activar"}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-gray-100"
                    >
                      {row.activa
                        ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                        : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                    </button>
                    <button
                      onClick={() => setModal(row)}
                      title="Editar"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(row.id)}
                      title="Eliminar"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
