import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { items, orderItems, orders } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

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
		.input(
			z.object({
				customerName: z.string(),
				deliveryCost: z.number().default(0),
				items: z.array(
					z.object({
						itemId: z.string(),
						quantity: z.number(),
					}),
				),
				total: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (input.items.length === 0) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Order must contain at least one item",
				});
			}

			const order = await ctx.db.transaction(async (tx) => {
				const [order] = await tx
					.insert(orders)
					.values({
						customerName: input.customerName,
						userId: ctx.session.user.id,
						deliveryCost: input.deliveryCost.toFixed(2),
						total: input.total.toFixed(2),
						status: "pending",
					})
					.returning();

				if (!order) {
					throw new Error("Failed to create order");
				}

				await tx.insert(orderItems).values(
					input.items.map((item) => ({
						orderId: order.id,
						itemId: item.itemId,
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
