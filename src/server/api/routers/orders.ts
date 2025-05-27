import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { items, orderItems, orders } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export type OrderItem = {
	itemId: string;
	name: string;
	price: number;
	quantity: number;
};

export const ordersRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		try {
			if (!ctx.session.user.id) {
				throw new Error("Unauthorized");
			}

			const userOrders = await ctx.db.query.orders.findMany({
				where: and(
					eq(orders.userId, ctx.session.user.id),
					eq(orders.isDeleted, false),
				),
				orderBy: (orders, { desc }) => [desc(orders.createdAt)],
			});

			return userOrders;
		} catch (error) {
			console.error(error);
			throw new Error("Failed to fetch orders");
		}
	}),

	getOrderDetails: protectedProcedure
		.input(z.object({ orderId: z.string() }))
		.query(async ({ ctx, input }) => {
			try {
				if (!ctx.session.user.id) {
					throw new Error("Unauthorized");
				}

				// Get the order with nested orderItems and their items
				const order = await ctx.db.query.orders.findFirst({
					columns: { id: true },
					where: and(
						eq(orders.id, input.orderId),
						eq(orders.userId, ctx.session.user.id),
					),
					with: { orderItems: { with: { item: true } } },
				});

				if (!order) {
					throw new Error("Order not found");
				}

				const items: OrderItem[] = order.orderItems.map((orderItem) => ({
					itemId: orderItem.item.id,
					name: orderItem.item.name,
					price: Number(orderItem.item.price),
					quantity: orderItem.quantity,
				}));

				return { items };
			} catch (error) {
				console.error(error);
				throw new Error("Failed to fetch order details");
			}
		}),

	create: protectedProcedure
		.input(
			z.object({
				customerName: z.string(),
				items: z.array(
					z.object({
						itemId: z.string(),
						quantity: z.number().int().positive(),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				if (!ctx.session.user.id) {
					throw new Error("Unauthorized");
				}

				// Get all items to calculate total
				const orderItemsData = await ctx.db.query.items.findMany({
					where: and(
						eq(items.userId, ctx.session.user.id),
						eq(items.isDeleted, false),
					),
				});

				const itemsMap = new Map(orderItemsData.map((item) => [item.id, item]));

				let total = 0;
				for (const item of input.items) {
					const itemData = itemsMap.get(item.itemId);
					if (!itemData) {
						throw new Error(`Item ${item.itemId} not found`);
					}
					total += Number(itemData.price) * item.quantity;
				}

				// Create order
				const order = await ctx.db
					.insert(orders)
					.values({
						customerName: input.customerName,
						userId: ctx.session.user.id,
						total: total.toString(),
						status: "pending",
					})
					.returning();

				// Create order items
				await ctx.db.insert(orderItems).values(
					input.items.map((item) => ({
						orderId: order[0]?.id || "",
						itemId: item.itemId,
						quantity: item.quantity,
					})),
				);

				return order[0];
			} catch (error) {
				console.error(error);
				throw new Error("Failed to create order");
			}
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
