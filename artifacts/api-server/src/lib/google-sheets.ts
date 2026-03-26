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
  hrbpPhoto: string;
  accentColor: string;
  logoUrl: string;
  isInternal: boolean;
  consultora: string;
}

// Obtener el nombre de la primera hoja (pestaña) del spreadsheet
async function getFirstSheetName(spreadsheetId: string): Promise<string> {
  const sheets = await getUncachableGoogleSheetClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets.properties.title" });
  const title = meta.data.sheets?.[0]?.properties?.title;
  if (!title) throw new Error("No se encontró ninguna hoja en el spreadsheet");
  return title;
}

// Mapeo de UDN a color de acento y logo (nombres REALES de archivos en /public)
const UDN_BRANDING: Record<string, { accentColor: string; logoUrl: string }> = {
  UIX:            { accentColor: "#8B5CF6", logoUrl: "uix_1774489769958.webp" },
  UDN:            { accentColor: "#8B5CF6", logoUrl: "uix_1774489769958.webp" },
  MEXACREATIVA:   { accentColor: "#C2384E", logoUrl: "mexa_1774489769959.webp" },
  MEXA:           { accentColor: "#C2384E", logoUrl: "mexa_1774489769959.webp" },
  ZEUS:           { accentColor: "#0EA5E9", logoUrl: "zeus_1774489769956.png" },
  HOUSEOFFILMS:   { accentColor: "#F59E0B", logoUrl: "house_of_films_1774489769958.webp" },
  HOF:            { accentColor: "#F59E0B", logoUrl: "house_of_films_1774489769958.webp" },
  MASSALUD:       { accentColor: "#10B981", logoUrl: "mas_salud_1774489769957.png" },
  MASSALUD_:      { accentColor: "#10B981", logoUrl: "mas_salud_1774489769957.png" },
  NERA:           { accentColor: "#6366F1", logoUrl: "nera_code_1774489769957.png" },
  NERACODE:       { accentColor: "#6366F1", logoUrl: "nera_code_1774489769957.png" },
  MKTGUNITED:     { accentColor: "#84CC16", logoUrl: "marketing_united_1774489769958.webp" },
  MARKETINGUNITED:{ accentColor: "#84CC16", logoUrl: "marketing_united_1774489769958.webp" },
  PROMOESP:       { accentColor: "#F97316", logoUrl: "promo_espacio_1774489769957.png" },
  PROMOESPACIO:   { accentColor: "#F97316", logoUrl: "promo_espacio_1774489769957.png" },
  RESEARCHLAND:   { accentColor: "#14B8A6", logoUrl: "researchland_1774489769958.png" },
  CH:             { accentColor: "#E85A29", logoUrl: "upax_logo_color.png" },
};

function getBranding(udn: string): { accentColor: string; logoUrl: string } {
  const key = udn.toUpperCase().replace(/[\s\-_]+/g, "");
  return UDN_BRANDING[key] || { accentColor: "#C2384E", logoUrl: "upax_logo_color.png" };
}

// Convierte URLs de Google Drive "view" a URLs directas de imagen
function convertDriveUrl(url: string): string {
  if (!url) return "";
  // https://drive.google.com/file/d/FILE_ID/view... → thumbnail directa
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w200`;
  }
  // Ya es directa o formato diferente
  return url;
}

// Leer todos los empleados del sheet — lee encabezados primero y mapea columnas por nombre
export async function getEmployeesFromSheet(spreadsheetId: string): Promise<SheetEmployee[]> {
  const sheets = await getUncachableGoogleSheetClient();

  // Auto-detectar nombre de la primera pestaña
  const sheetName = await getFirstSheetName(spreadsheetId);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:Z1000`,
  });

  const allRows = response.data.values || [];
  if (allRows.length < 2) return [];

  // Mapear encabezados a índices (case-insensitive, quita espacios)
  const headers = allRows[0].map((h: string) => String(h).trim().toUpperCase().replace(/[\s\-]+/g, "_"));
  const col = (names: string[]): number => {
    for (const name of names) {
      const idx = headers.indexOf(name);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idxNum     = col(["NUM_EMPLEADO", "NUMERO_EMPLEADO", "EMPLEADO", "ID", "EMPLOYEE_NUMBER"]);
  const idxPass    = col(["CONTRASENA", "PASSWORD", "CONTRASEÑA", "PASS"]);
  const idxName    = col(["NOMBRE_COMPLETO", "NOMBRE", "NAME", "FULL_NAME"]);
  const idxUdn     = col(["UDN", "BUSINESS_UNIT", "UNIDAD", "AREA"]);
  const idxRole    = col(["CARGO", "PUESTO", "ROLE", "POSITION"]);
  const idxHrbp    = col(["HRBP_NOMBRE", "HRBP", "HRBP_NAME"]);
  const idxType    = col(["TIPO", "TYPE", "INTERNA", "INTERNAL", "IS_INTERNAL"]);
  const idxCons    = col(["CONSULTORA", "CONSULTOR", "AGENCY"]);
  const idxHrbpPic = col(["HRBP_FOTO", "HRBP_PHOTO", "HRBP_PIC"]);
  const idxColor   = col(["COLOR", "ACCENT_COLOR", "COLOR_ACENTO"]);
  const idxLogo    = col(["LOGO", "LOGO_URL", "LOGO_FILE"]);

  const dataRows = allRows.slice(1);

  return dataRows
    .filter((row) => idxNum >= 0 && row[idxNum] && idxPass >= 0 && row[idxPass])
    .map((row) => {
      const udn = idxUdn >= 0 ? String(row[idxUdn] || "").trim() : "";
      const branding = getBranding(udn);
      const tipo = idxType >= 0 ? String(row[idxType] || "").trim().toUpperCase() : "INTERNO";
      const isInternal = tipo === "INTERNO" || tipo === "TRUE" || tipo === "INTERNA";

      return {
        employeeNumber: String(row[idxNum] || "").trim().toUpperCase(),
        password: String(row[idxPass] || "").trim(),
        name: idxName >= 0 ? String(row[idxName] || "").trim() : "",
        businessUnit: udn,
        role: idxRole >= 0 ? String(row[idxRole] || "").trim() : "",
        hrbpName: idxHrbp >= 0 ? String(row[idxHrbp] || "").trim() : "",
        accentColor: idxColor >= 0 && row[idxColor] ? String(row[idxColor]).trim() : branding.accentColor,
        logoUrl: idxLogo >= 0 && row[idxLogo] ? String(row[idxLogo]).trim() : branding.logoUrl,
        isInternal,
        consultora: idxCons >= 0 ? String(row[idxCons] || "").trim() : "",
        hrbpPhoto: idxHrbpPic >= 0 ? convertDriveUrl(String(row[idxHrbpPic] || "").trim()) : "",
      };
    });
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
