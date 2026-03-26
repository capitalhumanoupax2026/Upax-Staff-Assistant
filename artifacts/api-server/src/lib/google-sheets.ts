// Google Sheets integration via Replit connector (google-sheet:1.0.0)
import { google } from "googleapis";

let connectionSettings: any;

async function getAccessToken() {
  if (
    connectionSettings &&
    connectionSettings.settings.expires_at &&
    new Date(connectionSettings.settings.expires_at).getTime() > Date.now()
  ) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error("X-Replit-Token no encontrado (repl/depl)");
  }

  connectionSettings = await fetch(
    "https://" +
      hostname +
      "/api/v2/connection?include_secrets=true&connector_names=google-sheet",
    {
      headers: {
        Accept: "application/json",
        "X-Replit-Token": xReplitToken,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  const accessToken =
    connectionSettings?.settings?.access_token ||
    connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error("Google Sheet no conectado");
  }
  return accessToken;
}

// WARNING: Nunca cachear este cliente. Los tokens expiran.
export async function getUncachableGoogleSheetClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.sheets({ version: "v4", auth: oauth2Client });
}

// Tipos para empleado desde Sheets
export interface SheetEmployee {
  employeeNumber: string;
  password: string;
  name: string;
  businessUnit: string;
  role: string;
  hrbpName: string;
  accentColor: string;
  logoUrl: string;
  isInternal: boolean;
  consultora: string;
}

// Leer todos los empleados del sheet
export async function getEmployeesFromSheet(spreadsheetId: string): Promise<SheetEmployee[]> {
  const sheets = await getUncachableGoogleSheetClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Empleados!A2:J1000",
  });

  const rows = response.data.values || [];

  return rows
    .filter((row) => row[0] && row[1]) // Requiere número y contraseña
    .map((row) => ({
      employeeNumber: String(row[0] || "").trim().toUpperCase(),
      password: String(row[1] || "").trim(),
      name: String(row[2] || "").trim(),
      businessUnit: String(row[3] || "").trim(),
      role: String(row[4] || "").trim(),
      hrbpName: String(row[5] || "").trim(),
      accentColor: String(row[6] || "#C2384E").trim(),
      logoUrl: String(row[7] || "upax_logo_color.png").trim(),
      isInternal: String(row[8] || "TRUE").trim().toUpperCase() !== "FALSE",
      consultora: String(row[9] || "").trim(),
    }));
}

// Crear el sheet template con encabezados y datos de ejemplo
export async function createEmployeeSpreadsheet(): Promise<{ spreadsheetId: string; url: string }> {
  const sheets = await getUncachableGoogleSheetClient();

  const response = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: "UPAX Capital Humano – Empleados" },
      sheets: [
        {
          properties: { title: "Empleados", sheetId: 0 },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                // Fila de encabezados
                {
                  values: [
                    { userEnteredValue: { stringValue: "Número Empleado" } },
                    { userEnteredValue: { stringValue: "Contraseña" } },
                    { userEnteredValue: { stringValue: "Nombre Completo" } },
                    { userEnteredValue: { stringValue: "UDN" } },
                    { userEnteredValue: { stringValue: "Puesto" } },
                    { userEnteredValue: { stringValue: "HRBP" } },
                    { userEnteredValue: { stringValue: "Color Acento" } },
                    { userEnteredValue: { stringValue: "Logo (archivo)" } },
                    { userEnteredValue: { stringValue: "Interna (TRUE/FALSE)" } },
                    { userEnteredValue: { stringValue: "Consultora (si externa)" } },
                  ],
                },
                // Filas de ejemplo
                {
                  values: [
                    { userEnteredValue: { stringValue: "UIX001" } },
                    { userEnteredValue: { stringValue: "upax2024" } },
                    { userEnteredValue: { stringValue: "Ana García López" } },
                    { userEnteredValue: { stringValue: "UiX" } },
                    { userEnteredValue: { stringValue: "Diseñadora UX Senior" } },
                    { userEnteredValue: { stringValue: "Damián Torres" } },
                    { userEnteredValue: { stringValue: "#8B5CF6" } },
                    { userEnteredValue: { stringValue: "uix_logo.webp" } },
                    { userEnteredValue: { boolValue: true } },
                    { userEnteredValue: { stringValue: "" } },
                  ],
                },
                {
                  values: [
                    { userEnteredValue: { stringValue: "MEX001" } },
                    { userEnteredValue: { stringValue: "upax2024" } },
                    { userEnteredValue: { stringValue: "Carlos Mendoza Ruiz" } },
                    { userEnteredValue: { stringValue: "MexaCreativa" } },
                    { userEnteredValue: { stringValue: "Director Creativo" } },
                    { userEnteredValue: { stringValue: "Octavio Ramírez" } },
                    { userEnteredValue: { stringValue: "#C2384E" } },
                    { userEnteredValue: { stringValue: "mexacreativa_logo.webp" } },
                    { userEnteredValue: { boolValue: true } },
                    { userEnteredValue: { stringValue: "" } },
                  ],
                },
                {
                  values: [
                    { userEnteredValue: { stringValue: "ZEU001" } },
                    { userEnteredValue: { stringValue: "upax2024" } },
                    { userEnteredValue: { stringValue: "Laura Vega Soto" } },
                    { userEnteredValue: { stringValue: "Zeus" } },
                    { userEnteredValue: { stringValue: "Especialista en Datos" } },
                    { userEnteredValue: { stringValue: "Sergio Morales" } },
                    { userEnteredValue: { stringValue: "#0EA5E9" } },
                    { userEnteredValue: { stringValue: "zeus_logo.webp" } },
                    { userEnteredValue: { boolValue: false } },
                    { userEnteredValue: { stringValue: "Satoritech" } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  });

  const spreadsheetId = response.data.spreadsheetId!;
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  return { spreadsheetId, url };
}
