import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `kadai_${name}`);

export const users = createTable("user", (d) => ({
	id: d
		.varchar({ length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => createId()),
	name: d.varchar({ length: 255 }),
	email: d.varchar({ length: 255 }).notNull(),
	emailVerified: d
		.timestamp({
			mode: "date",
			withTimezone: true,
		})
		.default(sql`CURRENT_TIMESTAMP`),
	image: d.varchar({ length: 512 }),
	password: d.varchar({ length: 255 }),
	createdAt: d
		.timestamp({ mode: "date", withTimezone: true })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: d
		.timestamp({ mode: "date", withTimezone: true })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	isDeleted: d.boolean().notNull().default(false),
	companyName: d.varchar({ length: 255 }),
	companyAddress: d.varchar({ length: 512 }),
	companyLogo: d.varchar({ length: 512 }),
	gstNumber: d.text("gst_number"),
	gstEnabled: d.boolean("gst_enabled").default(false).notNull(),
	gstRate: d
		.numeric("gst_rate", { precision: 5, scale: 2 })
		.default("18.00")
		.notNull(),
}));

export type User = typeof users.$inferSelect;

export const accounts = createTable(
	"account",
	(d) => ({
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
		provider: d.varchar({ length: 255 }).notNull(),
		providerAccountId: d.varchar({ length: 255 }).notNull(),
		refresh_token: d.text(),
		access_token: d.text(),
		expires_at: d.integer(),
		token_type: d.varchar({ length: 255 }),
		scope: d.varchar({ length: 255 }),
		id_token: d.text(),
		session_state: d.varchar({ length: 255 }),
	}),
	(t) => [
		primaryKey({ columns: [t.provider, t.providerAccountId] }),
		index("account_user_id_idx").on(t.userId),
	],
);

export const sessions = createTable(
	"session",
	(d) => ({
		sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
	}),
	(t) => [index("t_user_id_idx").on(t.userId)],
);

export const verificationTokens = createTable(
	"verification_token",
	(d) => ({
		identifier: d.varchar({ length: 255 }).notNull(),
		token: d.varchar({ length: 255 }).notNull(),
		expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
	}),
	(t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const passwordResetTokens = createTable(
	"password_reset_tokens",
	(d) => ({
		id: d
			.varchar({ length: 255 })
			.notNull()
			.primaryKey()
			.$defaultFn(() => createId()),
		token: d.text("token").notNull(),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		expiresAt: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
		createdAt: d
			.timestamp({ mode: "date", withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	}),
);

export const items = createTable(
	"items",
	(d) => ({
		id: d
			.varchar({ length: 255 })
			.notNull()
			.primaryKey()
			.$defaultFn(() => createId()),
		name: d.varchar({ length: 255 }).notNull(),
		price: d.numeric({ precision: 10, scale: 2 }).notNull(),
		description: d.varchar({ length: 255 }),
		isDeleted: d.boolean().notNull().default(false),
		enabled: d.boolean().notNull().default(true),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		createdAt: d
			.timestamp({ mode: "date", withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: d
			.timestamp({ mode: "date", withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
	}),
	(t) => [
		index("t_name_idx").on(t.name),
		index("t_enabled_idx").on(t.enabled),
		index("t_items_is_deleted_idx").on(t.isDeleted),
		index("t_items_user_id_idx").on(t.userId),
	],
);

export type Item = typeof items.$inferSelect;

export const orders = createTable(
	"orders",
	(d) => ({
		id: d
			.varchar({ length: 255 })
			.notNull()
			.primaryKey()
			.$defaultFn(() => createId()),
		customerName: d.varchar({ length: 255 }).notNull(),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => users.id),
		createdAt: d
			.timestamp({ mode: "date", withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: d
			.timestamp({ mode: "date", withTimezone: true })
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		deliveryCost: d
			.numeric({ precision: 8, scale: 2 })
			.notNull()
			.default("0.00"),
		total: d.numeric({ precision: 10, scale: 2 }).notNull(),
		tax: d.numeric({ precision: 10, scale: 2 }).notNull().default("0.00"),
		taxRate: d.numeric({ precision: 5, scale: 2 }).notNull().default("0.00"),
		status: d
			.varchar("status", {
				enum: ["pending", "processing", "completed", "cancelled"],
			})
			.notNull(),
		isDeleted: d.boolean().notNull().default(false),
	}),
	(t) => [
		index("t_status_idx").on(t.status),
		index("t_orders_is_deleted_idx").on(t.isDeleted),
	],
);

export type Order = typeof orders.$inferSelect;

export const orderItems = createTable(
	"order_items",
	(d) => ({
		orderId: d
			.varchar()
			.notNull()
			.references(() => orders.id),
		itemId: d
			.varchar()
			.notNull()
			.references(() => items.id),
		quantity: d.integer().notNull(),
	}),
	(t) => [primaryKey({ columns: [t.orderId, t.itemId] })],
);

export type OrderItem = typeof orderItems.$inferSelect;

export const imageUpdateLogs = createTable("image_update_logs", (d) => ({
	id: d
		.varchar({ length: 255 })
		.primaryKey()
		.notNull()
		.$defaultFn(() => createId()),
	userId: d
		.varchar({ length: 255 })
		.notNull()
		.references(() => users.id),
	type: d
		.varchar("type", {
			enum: ["profile", "company_logo"],
		})
		.notNull(),
	createdAt: d
		.timestamp({ mode: "date", withTimezone: true })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
}));

export type ImageUpdateLog = typeof imageUpdateLogs.$inferSelect;

/* ---------------------------- Relations ---------------------------- */

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const passwordResetTokensRelations = relations(
	passwordResetTokens,
	({ one }) => ({
		user: one(users, {
			fields: [passwordResetTokens.userId],
			references: [users.id],
		}),
	}),
);

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
	user: one(users, { fields: [orders.userId], references: [users.id] }),
}));

export const itemsRelations = relations(items, ({ many, one }) => ({
	orderItems: many(orderItems, { relationName: "item__order_items" }),
	user: one(users, { fields: [items.userId], references: [users.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	items: many(items),
	orders: many(orders),
}));
