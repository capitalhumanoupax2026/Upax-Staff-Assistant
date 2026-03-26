import { Router, type IRouter } from "express";
import { getEmployeesFromSheet } from "../lib/google-sheets.js";

declare module "express-session" {
  interface SessionData {
    employee: {
      employeeNumber: string;
      name: string;
      businessUnit: string;
      role: string;
      hrbpName: string;
      accentColor: string;
      logoUrl: string;
      isInternal: boolean;
      consultora: string;
    };
  }
}

const router: IRouter = Router();

router.post("/auth/login", async (req, res) => {
  const { employeeNumber, password } = req.body;

  if (!employeeNumber || !password) {
    res.status(400).json({ error: "bad_request", message: "Número de empleado y contraseña son requeridos" });
    return;
  }

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    res.status(503).json({
      error: "not_configured",
      message: "El directorio de empleados no está configurado. Contacta a tu administrador.",
    });
    return;
  }

  try {
    const employees = await getEmployeesFromSheet(spreadsheetId);
    const employee = employees.find(
      (e) =>
        e.employeeNumber === String(employeeNumber).trim().toUpperCase() &&
        e.password === String(password).trim()
    );

    if (!employee) {
      res.status(401).json({ error: "unauthorized", message: "Número de empleado o contraseña incorrectos" });
      return;
    }

    const sessionEmployee = {
      employeeNumber: employee.employeeNumber,
      name: employee.name,
      businessUnit: employee.businessUnit,
      role: employee.role,
      hrbpName: employee.hrbpName,
      accentColor: employee.accentColor,
      logoUrl: employee.logoUrl,
      isInternal: employee.isInternal,
      consultora: employee.consultora,
    };

    req.session.employee = sessionEmployee;

    res.json({ employee: sessionEmployee, message: "Login exitoso" });
  } catch (err: any) {
    req.log.error({ err }, "Error durante login");
    res.status(500).json({ error: "server_error", message: "Error interno del servidor" });
  }
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Sesión cerrada correctamente" });
  });
});

router.get("/auth/me", (req, res) => {
  if (!req.session.employee) {
    res.status(401).json({ error: "unauthorized", message: "No has iniciado sesión" });
    return;
  }
  res.json(req.session.employee);
});

export default router;
