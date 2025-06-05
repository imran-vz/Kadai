import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { orderItems, orders } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export type OrderItem = {
	itemId: string;
	name: string;
	price: number;
	quantity: number;
};

const createOrderSchema = z.object({
	customerName: z.string().min(1),
	items: z.array(
		z.object({
			id: z.string(),
			quantity: z.number().int().positive(),
		}),
	),
	total: z.number().positive(),
	tax: z.number().min(0),
	taxRate: z.number().min(0),
	deliveryCost: z.number().min(0).optional(),
});

const getAllOrdersSchema = z.object({
	limit: z.number().min(1).max(20).default(10),
	cursor: z.string().optional(),
});

export const ordersRouter = createTRPCRouter({
	getAll: protectedProcedure
		.input(getAllOrdersSchema)
		.query(async ({ ctx, input }) => {
			try {
				if (!ctx.session.user.id) {
					throw new Error("Unauthorized");
				}

				const [totalCount] = await ctx.db
					.select({ count: count() })
					.from(orders)
					.where(
						and(
							eq(orders.userId, ctx.session.user.id),
							eq(orders.isDeleted, false),
						),
					);
				const items = await ctx.db.query.orders.findMany({
					where: and(
						eq(orders.userId, ctx.session.user.id),
						eq(orders.isDeleted, false),
					),
					limit: input.limit + 1,
					...(input.cursor
						? { offset: input.limit * Number(input.cursor) }
						: {}),
					orderBy: [desc(orders.createdAt)],
				});

				let nextCursor: typeof input.cursor | undefined = undefined;
				if (items.length > input.limit) {
					items.pop();
					nextCursor = String(Number(input.cursor || 0) + 1);
				}

				return {
					items,
					nextCursor,
					totalPages: Math.ceil(Number(totalCount?.count ?? 0) / input.limit),
				};
			} catch (error) {
				console.error(error);
				throw new Error("Failed to fetch orders");
			}
		}),

	getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
		try {
			if (!ctx.session.user.id) {
				throw new Error("Unauthorized");
			}

			const now = new Date();
			const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

			// Get total orders count
			const [totalOrders] = await ctx.db
				.select({ count: count() })
				.from(orders)
				.where(
					and(
						eq(orders.userId, ctx.session.user.id),
						eq(orders.isDeleted, false),
					),
				);

			// Get orders from last 7 days
			const [ordersLast7Days] = await ctx.db
				.select({ count: count() })
				.from(orders)
				.where(
					and(
						eq(orders.userId, ctx.session.user.id),
						eq(orders.isDeleted, false),
						gte(orders.createdAt, sevenDaysAgo),
					),
				);

			// Get orders from last 30 days
			const [ordersLast30Days] = await ctx.db
				.select({ count: count() })
				.from(orders)
				.where(
					and(
						eq(orders.userId, ctx.session.user.id),
						eq(orders.isDeleted, false),
						gte(orders.createdAt, thirtyDaysAgo),
					),
				);

			// Get orders by day for the last 7 days
			const ordersByDay7 = await ctx.db
				.select({
					date: sql<string>`DATE(${orders.createdAt})`.as("date"),
					count: count(),
				})
				.from(orders)
				.where(
					and(
						eq(orders.userId, ctx.session.user.id),
						eq(orders.isDeleted, false),
						gte(orders.createdAt, sevenDaysAgo),
					),
				)
				.groupBy(sql`DATE(${orders.createdAt})`)
				.orderBy(desc(sql`DATE(${orders.createdAt})`))
				.limit(7);

			// Get orders by day for the last 30 days
			const ordersByDay30 = await ctx.db
				.select({
					date: sql<string>`DATE(${orders.createdAt})`.as("date"),
					count: count(),
				})
				.from(orders)
				.where(
					and(
						eq(orders.userId, ctx.session.user.id),
						eq(orders.isDeleted, false),
						gte(orders.createdAt, thirtyDaysAgo),
					),
				)
				.groupBy(sql`DATE(${orders.createdAt})`)
				.orderBy(desc(sql`DATE(${orders.createdAt})`))
				.limit(30);

			return {
				totalOrders: totalOrders?.count ?? 0,
				ordersLast7Days: ordersLast7Days?.count ?? 0,
				ordersLast30Days: ordersLast30Days?.count ?? 0,
				ordersByDay7: ordersByDay7.map((order) => ({
					date: order.date,
					count: order.count,
				})),
				ordersByDay30: ordersByDay30.map((order) => ({
					date: order.date,
					count: order.count,
				})),
			};
		} catch (error) {
			console.error(error);
			throw new Error("Failed to fetch dashboard stats");
		}
	}),

	getOrderDetails: protectedProcedure
		.input(z.object({ orderId: z.string() }))
		.query(async ({ ctx, input }) => {
			try {
				if (!ctx.session.user.id) {
					throw new Error("Unauthorized");
				}

				const order = await ctx.db.query.orders.findFirst({
					columns: { id: true },
					where: and(
						eq(orders.id, input.orderId),
						eq(orders.userId, ctx.session.user.id),
					),
					with: {
						orderItems: {
							columns: {
								quantity: true,
							},
							with: {
								item: {
									columns: {
										id: true,
										name: true,
										price: true,
									},
								},
							},
						},
					},
				});

				if (!order) {
					throw new Error("Order not found");
				}

				const items: OrderItem[] = order.orderItems.map((orderItem) => ({
					itemId: orderItem.item.id,
					name: orderItem.item.name,
					price: Number.parseFloat(orderItem.item.price),
					quantity: orderItem.quantity,
				}));

				return { items };
			} catch (error) {
				console.error(error);
				throw new Error("Failed to fetch order details");
			}
		}),

	create: protectedProcedure
		.input(createOrderSchema)
		.mutation(async ({ ctx, input }) => {
			const { db, session } = ctx;

			const order = await db.transaction(async (tx) => {
				const [order] = await tx
					.insert(orders)
					.values({
						customerName: input.customerName,
						userId: session.user.id,
						total: input.total.toString(),
						status: "pending",
						tax: input.tax.toString(),
						taxRate: input.taxRate.toString(),
						deliveryCost: input.deliveryCost?.toString() ?? "0.00",
					})
					.returning();

				if (!order) {
					throw new Error("Failed to create order");
				}

				await tx.insert(orderItems).values(
					input.items.map((item) => ({
						orderId: order.id,
						itemId: item.id,
						quantity: item.quantity,
					})),
				);

				return order;
			});

			return order;
		}),

	updateStatus: protectedProcedure
		.input(
			z.object({
				orderId: z.string(),
				status: z.enum(["pending", "processing", "completed", "cancelled"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				if (!ctx.session.user.id) {
					throw new Error("Unauthorized");
				}

				const order = await ctx.db.query.orders.findFirst({
					where: and(
						eq(orders.id, input.orderId),
						eq(orders.userId, ctx.session.user.id),
					),
				});

				if (!order) {
					throw new Error("Order not found");
				}

				await ctx.db
					.update(orders)
					.set({ status: input.status })
					.where(eq(orders.id, input.orderId));

				return { success: true };
			} catch (error) {
				console.error(error);
				throw new Error("Failed to update order status");
			}
		}),
});
