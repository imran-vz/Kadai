import { and, eq } from "drizzle-orm";
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

				const order = await ctx.db.query.orders.findFirst({
					columns: {
						id: true,
						total: true,
						tax: true,
						taxRate: true,
						deliveryCost: true,
					},
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

				return {
					items,
					total: Number(order.total),
					tax: Number(order.tax),
					taxRate: Number(order.taxRate),
					deliveryCost: Number(order.deliveryCost),
				};
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
