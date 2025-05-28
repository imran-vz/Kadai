import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { eq } from "drizzle-orm";
import { users } from "~/server/db/schema";

export const companyRouter = createTRPCRouter({
	update: protectedProcedure
		.input(
			z.object({
				companyName: z.string().optional(),
				companyAddress: z.string().optional(),
				image: z.string().optional(),
				companyLogo: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.db
					.update(users)
					.set(input)
					.where(eq(users.id, ctx.session.user.id));
				return { success: true };
			} catch (error) {
				console.error(error);
				throw new Error("Failed to update company information");
			}
		}),
});
