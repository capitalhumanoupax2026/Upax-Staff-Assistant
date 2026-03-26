import { Router, type IRouter } from "express";
import { createEmployeeSpreadsheet } from "../lib/google-sheets.js";

const router: IRouter = Router();

// POST /api/sheets/setup — Crea el spreadsheet de empleados y devuelve la URL
router.post("/sheets/setup", async (req, res) => {
  try {
    const { spreadsheetId, url } = await createEmployeeSpreadsheet();

    res.json({
      success: true,
      spreadsheetId,
      url,
      message: `Spreadsheet creado. Guarda este ID: ${spreadsheetId}`,
      instructions: [
        "1. Abre el link en Google Sheets",
        "2. Llena los datos de tus empleados en la hoja 'Empleados'",
        "3. La primera fila son encabezados, no la edites",
        "4. Cada empleado: número, contraseña, nombre, UDN, puesto, HRBP, color, logo, interna, consultora",
        `5. El ID del sheet ya fue guardado automáticamente`,
      ],
    });
  } catch (err: any) {
    res.status(500).json({
      error: "sheets_error",
      message: err?.message || "Error al crear el spreadsheet",
    });
  }
});

// GET /api/sheets/status — Verifica si el sheet está configurado
router.get("/sheets/status", async (req, res) => {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    res.json({ configured: false, message: "GOOGLE_SHEET_ID no configurado. Llama a POST /api/sheets/setup" });
    return;
  }
  res.json({ configured: true, spreadsheetId });
});

export default router;
