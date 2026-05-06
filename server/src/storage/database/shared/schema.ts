import { pgTable, serial, timestamp, varchar, text, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 培训资料表
export const trainingMaterials = pgTable(
  "training_materials",
  {
    id: serial().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    file_key: varchar("file_key", { length: 512 }).notNull(),
    file_type: varchar("file_type", { length: 100 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("training_materials_created_at_idx").on(table.created_at),
  ]
)

// 器械巡检记录表
export const equipmentInspections = pgTable(
  "equipment_inspections",
  {
    id: serial().primaryKey(),
    equipment_name: varchar("equipment_name", { length: 255 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("normal"),
    remark: text("remark"),
    inspector: varchar("inspector", { length: 100 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("equipment_inspections_status_idx").on(table.status),
    index("equipment_inspections_created_at_idx").on(table.created_at),
  ]
)

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});
