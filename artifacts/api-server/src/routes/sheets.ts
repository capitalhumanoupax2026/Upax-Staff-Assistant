import { Router, type IRouter } from "express";
import { createEmployeeSpreadsheet, getUncachableGoogleSheetClient } from "../lib/google-sheets.js";

const router: IRouter = Router();

// POST /api/sheets/setup — Crea el spreadsheet de empleados y devuelve la URL
router.post("/sheets/setup", async (req, res) => {
  try {
    const { spreadsheetId, url } = await createEmployeeSpreadsheet();
    res.json({
      success: true,
      spreadsheetId,
      url,
      message: `Spreadsheet creado. ID: ${spreadsheetId}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: "sheets_error", message: err?.message || "Error al crear el spreadsheet" });
  }
});

// GET /api/sheets/status — Verifica si el sheet está configurado
router.get("/sheets/status", async (req, res) => {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    res.json({ configured: false, message: "GOOGLE_SHEET_ID no configurado" });
    return;
  }
  res.json({ configured: true, spreadsheetId });
});

// GET /api/sheets/inspect — Lee las primeras filas del sheet para ver la estructura
router.get("/sheets/inspect", async (req, res) => {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    res.status(400).json({ error: "not_configured" });
    return;
  }

  try {
    const sheets = await getUncachableGoogleSheetClient();

    // Obtener metadata del sheet (nombres de pestañas)
    const meta = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets.properties.title",
    });
    const sheetNames = meta.data.sheets?.map((s) => s.properties?.title) || [];
    const firstSheet = sheetNames[0] || "Sheet1";

    // Leer primeras 3 filas
    const data = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${firstSheet}!A1:Z3`,
    });

    res.json({
      spreadsheetId,
      sheetNames,
      firstSheet,
      rows: data.data.values || [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Error al leer el sheet" });
  }
});

export default router;
