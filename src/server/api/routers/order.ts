import { createTRPCRouter, protectedProcedure } from "../trpc";
import { orders } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";

export const ordersRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.session.user.id) {
			throw new Error("User ID is required");
		}
		const result = await ctx.db
			.select()
			.from(orders)
			.where(eq(orders.userId, ctx.session.user.id))
			.orderBy(desc(orders.createdAt));
		return result;
	}),
});
