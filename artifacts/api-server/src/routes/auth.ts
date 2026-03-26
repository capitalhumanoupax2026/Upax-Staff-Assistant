import { Router, type IRouter } from "express";
import { db, employeesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

declare module "express-session" {
  interface SessionData {
    employeeId: number;
  }
}

const router: IRouter = Router();

router.post("/auth/login", async (req, res) => {
  const { employeeNumber, password } = req.body;

  if (!employeeNumber || !password) {
    res.status(400).json({ error: "bad_request", message: "Número de empleado y contraseña son requeridos" });
    return;
  }

  try {
    const employees = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.employeeNumber, String(employeeNumber)));

    const employee = employees[0];

    if (!employee || employee.password !== String(password)) {
      res.status(401).json({ error: "unauthorized", message: "Número de empleado o contraseña incorrectos" });
      return;
    }

    req.session.employeeId = employee.id;

    res.json({
      employee: {
        id: employee.id,
        employeeNumber: employee.employeeNumber,
        name: employee.name,
        businessUnit: employee.businessUnit,
        role: employee.role,
        hrbpName: employee.hrbpName,
        hrbpPhoto: employee.hrbpPhoto,
        consultora: employee.consultora,
        isInternal: employee.isInternal,
        accentColor: employee.accentColor,
        logoUrl: employee.logoUrl,
      },
      message: "Login exitoso",
    });
  } catch (err) {
    req.log.error({ err }, "Error during login");
    res.status(500).json({ error: "server_error", message: "Error interno del servidor" });
  }
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Sesión cerrada correctamente" });
  });
});

router.get("/auth/me", async (req, res) => {
  if (!req.session.employeeId) {
    res.status(401).json({ error: "unauthorized", message: "No has iniciado sesión" });
    return;
  }

  try {
    const employees = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.id, req.session.employeeId));

    const employee = employees[0];

    if (!employee) {
      req.session.destroy(() => {});
      res.status(401).json({ error: "unauthorized", message: "Sesión inválida" });
      return;
    }

    res.json({
      id: employee.id,
      employeeNumber: employee.employeeNumber,
      name: employee.name,
      businessUnit: employee.businessUnit,
      role: employee.role,
      hrbpName: employee.hrbpName,
      hrbpPhoto: employee.hrbpPhoto,
      consultora: employee.consultora,
      isInternal: employee.isInternal,
      accentColor: employee.accentColor,
      logoUrl: employee.logoUrl,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching employee");
    res.status(500).json({ error: "server_error", message: "Error interno del servidor" });
  }
});

export default router;
