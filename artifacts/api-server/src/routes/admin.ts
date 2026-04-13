import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, hrResponsesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

const ADMIN_PIN = process.env.ADMIN_PIN || "upaxadmin2024";

function requirePin(req: Request, res: Response, next: NextFunction) {
  const pin = req.headers["x-admin-pin"] || req.query.pin;
  if (pin !== ADMIN_PIN) {
    res.status(401).json({ error: "unauthorized", message: "PIN de administrador incorrecto" });
    return;
  }
  next();
}

// Verificar PIN
router.post("/admin/verify", (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin === ADMIN_PIN) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: "unauthorized", message: "PIN incorrecto" });
  }
});

// Listar todas las respuestas
router.get("/admin/responses", requirePin, async (_req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(hrResponsesTable)
      .orderBy(asc(hrResponsesTable.categoria), asc(hrResponsesTable.id));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "server_error", message: "Error al obtener respuestas" });
  }
});

// Crear nueva respuesta
router.post("/admin/responses", requirePin, async (req: Request, res: Response) => {
  try {
    const { preguntaTexto, respuesta, categoria, udn, consultora, tipo, activa } = req.body;
    if (!preguntaTexto || !respuesta || !categoria) {
      res.status(400).json({ error: "bad_request", message: "preguntaTexto, respuesta y categoria son requeridos" });
      return;
    }
    const [row] = await db
      .insert(hrResponsesTable)
      .values({
        preguntaTexto: preguntaTexto.trim(),
        respuesta: respuesta.trim(),
        categoria: categoria.trim(),
        udn: (udn || "GENERAL").trim(),
        consultora: (consultora || "GENERAL").trim(),
        tipo: (tipo || "GENERAL").trim(),
        activa: activa !== false,
      })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: "server_error", message: "Error al crear respuesta" });
  }
});

// Actualizar respuesta
router.put("/admin/responses/:id", requirePin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { preguntaTexto, respuesta, categoria, udn, consultora, tipo, activa } = req.body;
    const [row] = await db
      .update(hrResponsesTable)
      .set({
        preguntaTexto: preguntaTexto?.trim(),
        respuesta: respuesta?.trim(),
        categoria: categoria?.trim(),
        udn: udn?.trim(),
        consultora: consultora?.trim(),
        tipo: tipo?.trim(),
        activa,
      })
      .where(eq(hrResponsesTable.id, id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "not_found", message: "Respuesta no encontrada" });
      return;
    }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "server_error", message: "Error al actualizar respuesta" });
  }
});

// Eliminar respuesta
router.delete("/admin/responses/:id", requirePin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(hrResponsesTable).where(eq(hrResponsesTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "server_error", message: "Error al eliminar respuesta" });
  }
});

export default router;
