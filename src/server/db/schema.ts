import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { index, pgTable, primaryKey } from "drizzle-orm/pg-core";

export const user = pgTable("user", (d) => ({
	id: d
		.text()
		.notNull()
		.primaryKey()
		.$defaultFn(() => createId()),
	name: d.text().notNull(),
	email: d.text().notNull().unique(),
	emailVerified: d.boolean("email_verified").default(false).notNull(),
	image: d.text(),
	createdAt: d
		.timestamp("created_at", { mode: "date", withTimezone: true })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: d
		.timestamp("updated_at", { mode: "date", withTimezone: true })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	isDeleted: d.boolean("is_deleted").notNull().default(false),
	companyName: d.text("company_name"),
	companyAddress: d.text("company_address"),
	companyLogo: d.text("company_logo"),
	gstNumber: d.text("gst_number"),
	gstEnabled: d.boolean("gst_enabled").default(false).notNull(),
	gstRate: d.text("gst_rate").default("18.00").notNull(),
}));

export type User = typeof user.$inferSelect;

export const session = pgTable(
	"session",
	(d) => ({
		id: d
			.text()
			.notNull()
			.primaryKey()
			.$defaultFn(() => createId()),
		expiresAt: d
			.timestamp("expires_at", { mode: "date", withTimezone: true })
			.notNull(),
		token: d.text().notNull().unique(),
		createdAt: d
			.timestamp("created_at", { mode: "date", withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: d
			.timestamp("updated_at", { mode: "date", withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		ipAddress: d.text("ip_address"),
		userAgent: d.text("user_agent"),
		userId: d
			.text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	}),
	(t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
	"account",
	(d) => ({
		id: d
			.text()
			.notNull()
			.primaryKey()
			.$defaultFn(() => createId()),
		accountId: d.text("account_id").notNull(),
		providerId: d.text("provider_id").notNull(),
		userId: d
			.text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: d.text("access_token"),
		refreshToken: d.text("refresh_token"),
		idToken: d.text("id_token"),
		accessTokenExpiresAt: d.timestamp("access_token_expires_at", {
			mode: "date",
			withTimezone: true,
		}),
		refreshTokenExpiresAt: d.timestamp("refresh_token_expires_at", {
			mode: "date",
			withTimezone: true,
		}),
		scope: d.text(),
		password: d.text(),
		createdAt: d
			.timestamp("created_at", { mode: "date", withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: d
			.timestamp("updated_at", { mode: "date", withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	}),
	(t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable(
	"verification",
	(d) => ({
		id: d
			.text()
			.notNull()
			.primaryKey()
			.$defaultFn(() => createId()),
		identifier: d.text().notNull(),
		value: d.text().notNull(),
		expiresAt: d
			.timestamp("expires_at", { mode: "date", withTimezone: true })
			.notNull(),
		createdAt: d
			.timestamp("created_at", { mode: "date", withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: d
			.timestamp("updated_at", { mode: "date", withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	}),
	(t) => [index("verification_identifier_idx").on(t.identifier)],
);

export const items = pgTable(
	"items",
	(d) => ({
		id: d
			.text()
			.notNull()
			.primaryKey()
			.$defaultFn(() => createId()),
		name: d.varchar({ length: 255 }).notNull(),
		price: d.numeric({ precision: 10, scale: 2 }).notNull(),
		description: d.varchar({ length: 255 }),
		isDeleted: d.boolean("is_deleted").notNull().default(false),
		enabled: d.boolean().notNull().default(true),
		userId: d
			.text("user_id")
			.notNull()
			.references(() => user.id),
		createdAt: d
			.timestamp("created_at", { mode: "date", withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: d
			.timestamp("updated_at", { mode: "date", withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	}),
	(t) => [
		index("items_name_idx").on(t.name),
		index("items_enabled_idx").on(t.enabled),
		index("items_is_deleted_idx").on(t.isDeleted),
		index("items_user_id_idx").on(t.userId),
	],
);

export type Item = typeof items.$inferSelect;

export const orders = pgTable(
	"orders",
	(d) => ({
		id: d
			.text()
			.notNull()
			.primaryKey()
			.$defaultFn(() => createId()),
		customerName: d.varchar("customer_name", { length: 255 }).notNull(),
		userId: d
			.text("user_id")
			.notNull()
			.references(() => user.id),
		createdAt: d
			.timestamp("created_at", { mode: "date", withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: d
			.timestamp("updated_at", { mode: "date", withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		deliveryCost: d
			.numeric("delivery_cost", { precision: 8, scale: 2 })
			.notNull()
			.default("0.00"),
		total: d.numeric({ precision: 10, scale: 2 }).notNull(),
		tax: d.numeric({ precision: 10, scale: 2 }).notNull().default("0.00"),
		taxRate: d
			.numeric("tax_rate", { precision: 5, scale: 2 })
			.notNull()
			.default("0.00"),
		status: d
			.varchar({
				enum: ["pending", "processing", "completed", "cancelled"],
			})
			.notNull(),
		isDeleted: d.boolean("is_deleted").notNull().default(false),
	}),
	(t) => [
		index("orders_status_idx").on(t.status),
		index("orders_is_deleted_idx").on(t.isDeleted),
	],
);

export type Order = typeof orders.$inferSelect;

export const orderItems = pgTable(
	"order_items",
	(d) => ({
		orderId: d
			.text("order_id")
			.notNull()
			.references(() => orders.id),
		itemId: d
			.text("item_id")
			.notNull()
			.references(() => items.id),
		quantity: d.integer().notNull(),
	}),
	(t) => [primaryKey({ columns: [t.orderId, t.itemId] })],
);

export type OrderItem = typeof orderItems.$inferSelect;

export const imageUpdateLogs = pgTable("image_update_logs", (d) => ({
	id: d
		.text()
		.primaryKey()
		.notNull()
		.$defaultFn(() => createId()),
	userId: d
		.text("user_id")
		.notNull()
		.references(() => user.id),
	type: d
		.varchar({
			enum: ["profile", "company_logo"],
		})
		.notNull(),
	createdAt: d
		.timestamp("created_at", { mode: "date", withTimezone: true })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
}));

export type ImageUpdateLog = typeof imageUpdateLogs.$inferSelect;

/* ---------------------------- Relations ---------------------------- */

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id],
		relationName: "order__order_items",
	}),
	item: one(items, {
		fields: [orderItems.itemId],
		references: [items.id],
		relationName: "item__order_items",
	}),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
	orderItems: many(orderItems, { relationName: "order__order_items" }),
	user: one(user, { fields: [orders.userId], references: [user.id] }),
}));

export const itemsRelations = relations(items, ({ many, one }) => ({
	orderItems: many(orderItems, { relationName: "item__order_items" }),
	user: one(user, { fields: [items.userId], references: [user.id] }),
}));

export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	sessions: many(session),
	items: many(items),
	orders: many(orders),
}));
