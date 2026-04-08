import { pgTable, text, serial, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const employeesTable = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeNumber: text("employee_number").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  businessUnit: text("business_unit").notNull(),
  role: text("role").notNull().default("Colaborador"),
  hrbpName: text("hrbp_name").notNull(),
  hrbpPhoto: text("hrbp_photo").notNull().default(""),
  consultora: text("consultora"),
  isInternal: boolean("is_internal").notNull().default(true),
  accentColor: text("accent_color").notNull().default("#E85D04"),
  logoUrl: text("logo_url").notNull().default("/upax_logo_1774489769957.png"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmployeeSchema = createInsertSchema(employeesTable).omit({ id: true, createdAt: true });
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employeesTable.$inferSelect;

export const chatMessagesTable = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employeesTable.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  category: text("category"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessagesTable).omit({ id: true, timestamp: true });
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessagesTable.$inferSelect;

export const hrResponsesTable = pgTable("hr_responses", {
  id: serial("id").primaryKey(),
  preguntaTexto: text("pregunta_texto").notNull(),
  respuesta: text("respuesta").notNull(),
  categoria: text("categoria").notNull(),
  udn: text("udn").notNull().default("GENERAL"),
  consultora: text("consultora").notNull().default("GENERAL"),
  tipo: text("tipo").notNull().default("GENERAL"),
  activa: boolean("activa").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHrResponseSchema = createInsertSchema(hrResponsesTable).omit({ id: true, createdAt: true });
export type InsertHrResponse = z.infer<typeof insertHrResponseSchema>;
export type HrResponse = typeof hrResponsesTable.$inferSelect;
