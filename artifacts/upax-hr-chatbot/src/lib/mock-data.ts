export interface MockEmployee {
  id: number;
  employeeNumber: string;
  name: string;
  businessUnit: string;
  role: string;
  hrbpName: string;
  hrbpPhoto: string;
  consultora: string | null;
  isInternal: boolean;
  accentColor: string;
  logoUrl: string;
}

export const MOCK_EMPLOYEES: MockEmployee[] = [
  { id: 1, employeeNumber: "UIX001", name: "Ana García López", businessUnit: "UiX", role: "Diseñadora UX", hrbpName: "Damián Sánchez", hrbpPhoto: "", consultora: null, isInternal: true, accentColor: "#7C3AED", logoUrl: "/uix_1774489769958.webp" },
  { id: 2, employeeNumber: "UIX002", name: "Carlos Mendoza Ruiz", businessUnit: "UiX", role: "Desarrollador Frontend", hrbpName: "Damián Sánchez", hrbpPhoto: "", consultora: null, isInternal: true, accentColor: "#7C3AED", logoUrl: "/uix_1774489769958.webp" },
  { id: 3, employeeNumber: "MKT001", name: "Valeria Torres Pérez", businessUnit: "Marketing United", role: "Estratega Digital", hrbpName: "Jesús Hernández", hrbpPhoto: "", consultora: "Satoritech", isInternal: false, accentColor: "#84CC16", logoUrl: "/marketing_united_1774489769958.webp" },
  { id: 4, employeeNumber: "RES001", name: "Roberto Sánchez Mora", businessUnit: "Researchland", role: "Investigador Senior", hrbpName: "Abraham Flores", hrbpPhoto: "", consultora: null, isInternal: true, accentColor: "#7C3AED", logoUrl: "/researchland_1774489769958.png" },
  { id: 5, employeeNumber: "TRD001", name: "Fernanda Luna Castillo", businessUnit: "Trade Marketing", role: "Ejecutiva Trade", hrbpName: "Jesús Hernández", hrbpPhoto: "", consultora: "Nach", isInternal: false, accentColor: "#F97316", logoUrl: "/marketing_united_1774489769958.webp" },
  { id: 6, employeeNumber: "PRO001", name: "Miguel Ángel Vázquez", businessUnit: "Promo Espacio", role: "Coordinador Promo", hrbpName: "Alma Rodríguez", hrbpPhoto: "", consultora: "Master Talent", isInternal: false, accentColor: "#EA580C", logoUrl: "/promo_espacio_1774489769957.png" },
  { id: 7, employeeNumber: "MEX001", name: "Sofía Ramírez Gómez", businessUnit: "Mexa Creativa", role: "Directora Creativa", hrbpName: "Jesús Octavio", hrbpPhoto: "", consultora: null, isInternal: true, accentColor: "#EC4899", logoUrl: "/mexa_1774489769959.webp" },
  { id: 8, employeeNumber: "HOF001", name: "Alejandro Cruz Díaz", businessUnit: "House of Films", role: "Director de Producción", hrbpName: "Lourdes Pamela", hrbpPhoto: "", consultora: null, isInternal: true, accentColor: "#E85A29", logoUrl: "/house_of_films_1774489769958.webp" },
  { id: 9, employeeNumber: "NER001", name: "Daniela Flores Herrera", businessUnit: "Nera Code", role: "Desarrolladora Backend", hrbpName: "Fernanda Messmacher", hrbpPhoto: "", consultora: null, isInternal: true, accentColor: "#F87171", logoUrl: "/nera_code_1774489769957.png" },
  { id: 10, employeeNumber: "SAL001", name: "Eduardo Morales Reyes", businessUnit: "Más Salud", role: "Consultor Salud", hrbpName: "Fernanda Messmacher", hrbpPhoto: "", consultora: null, isInternal: true, accentColor: "#EC4899", logoUrl: "/mas_salud_1774489769957.png" },
  { id: 11, employeeNumber: "ZEU001", name: "Mariana Jiménez Vargas", businessUnit: "Zeus", role: "Analista Zeus", hrbpName: "Sergio Buendía", hrbpPhoto: "", consultora: "Satoritech", isInternal: false, accentColor: "#8B5CF6", logoUrl: "/zeus_1774489769956.png" },
  { id: 12, employeeNumber: "CH001", name: "Luis Ortega Soto", businessUnit: "Capital Humano", role: "Coordinador CH", hrbpName: "Alejandro García", hrbpPhoto: "", consultora: null, isInternal: true, accentColor: "#E85A29", logoUrl: "/upax_logo_1774489769957.png" },
  { id: 13, employeeNumber: "DG001", name: "Patricia Escobar Nava", businessUnit: "Dirección General", role: "Asistente Dirección", hrbpName: "Alejandro García", hrbpPhoto: "", consultora: null, isInternal: true, accentColor: "#E85A29", logoUrl: "/upax_logo_1774489769957.png" },
  { id: 14, employeeNumber: "JUR001", name: "Ricardo Blanco Campos", businessUnit: "Jurídico", role: "Abogado Corporativo", hrbpName: "Jesús Carrera", hrbpPhoto: "", consultora: null, isInternal: true, accentColor: "#374151", logoUrl: "/upax_logo_1774489769957.png" },
  { id: 15, employeeNumber: "ADM001", name: "Lucía Peña Romero", businessUnit: "Administración", role: "Coordinadora Admin", hrbpName: "Lourdes Pamela", hrbpPhoto: "", consultora: null, isInternal: true, accentColor: "#374151", logoUrl: "/upax_logo_1774489769957.png" },
];

const MOCK_PASSWORD = "upax2024";

export function mockLogin(employeeNumber: string, password: string): MockEmployee | null {
  if (password !== MOCK_PASSWORD) return null;
  return MOCK_EMPLOYEES.find(e => e.employeeNumber.toUpperCase() === employeeNumber.toUpperCase()) || null;
}

export function getMockEmployee(): MockEmployee | null {
  try {
    const stored = sessionStorage.getItem("upax_mock_user");
    if (!stored) return null;
    return JSON.parse(stored) as MockEmployee;
  } catch {
    return null;
  }
}

export function setMockEmployee(employee: MockEmployee): void {
  sessionStorage.setItem("upax_mock_user", JSON.stringify(employee));
}

export function clearMockEmployee(): void {
  sessionStorage.removeItem("upax_mock_user");
}
