import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { items } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const itemsRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				description: z.string().optional(),
				price: z.number().min(0),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				if (!ctx.session.user.id) {
					throw new Error("Unauthorized");
				}
				await ctx.db.insert(items).values({
					name: input.name,
					description: input.description || null,
					userId: ctx.session.user.id,
					price: input.price.toString(),
				});
				return { success: true };
			} catch (error) {
				console.error(error);
				throw new Error("Failed to create item");
			}
		}),

	getAll: protectedProcedure.query(async ({ ctx }) => {
		try {
			if (!ctx.session.user.id) {
				throw new Error("Unauthorized");
			}
			const userItems = await ctx.db.query.items.findMany({
				where: and(
					eq(items.userId, ctx.session.user.id),
					eq(items.isDeleted, false),
				),
				orderBy: (items, { desc }) => [desc(items.createdAt)],
			});
			return userItems;
		} catch (error) {
			console.error(error);
			throw new Error("Failed to fetch items");
		}
	}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			try {
				if (!ctx.session.user.id) {
					throw new Error("Unauthorized");
				}

				// Ensure the item belongs to the user
				const item = await ctx.db.query.items.findFirst({
					where: and(
						eq(items.id, input.id),
						eq(items.userId, ctx.session.user.id),
					),
				});

				if (!item) {
					throw new Error("Item not found");
				}

				await ctx.db
					.update(items)
					.set({ isDeleted: true })
					.where(eq(items.id, input.id));

				return { success: true };
			} catch (error) {
				console.error(error);
				throw new Error("Failed to delete item");
			}
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1),
				description: z.string().optional(),
				price: z.number().min(0),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				if (!ctx.session.user.id) {
					throw new Error("Unauthorized");
				}

				// Ensure the item belongs to the user
				const item = await ctx.db.query.items.findFirst({
					where: and(
						eq(items.id, input.id),
						eq(items.userId, ctx.session.user.id),
					),
				});

				if (!item) {
					throw new Error("Item not found");
				}

				await ctx.db
					.update(items)
					.set({
						name: input.name,
						description: input.description || null,
						price: input.price.toString(),
						updatedAt: new Date(),
					})
					.where(eq(items.id, input.id));

				return { success: true };
			} catch (error) {
				console.error(error);
				throw new Error("Failed to update item");
			}
		}),
});
