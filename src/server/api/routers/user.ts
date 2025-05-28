import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { eq } from "drizzle-orm";
import { users } from "~/server/db/schema";
import bcrypt from "bcrypt";

export const userRouter = createTRPCRouter({
	changePassword: protectedProcedure
		.input(
			z.object({
				currentPassword: z.string().min(1, "Current password is required"),
				newPassword: z
					.string()
					.min(6, "Password must be at least 6 characters"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.db.query.users.findFirst({
				where: eq(users.id, ctx.session.user.id),
				columns: {
					password: true,
				},
			});

			if (!user?.password) {
				throw new Error("No password set for this account");
			}

			const isValid = await bcrypt.compare(
				input.currentPassword,
				user.password,
			);
			if (!isValid) {
				throw new Error("Current password is incorrect");
			}

			const hashedPassword = await bcrypt.hash(input.newPassword, 10);
			await ctx.db
				.update(users)
				.set({ password: hashedPassword })
				.where(eq(users.id, ctx.session.user.id));

			return { success: true };
		}),
});
