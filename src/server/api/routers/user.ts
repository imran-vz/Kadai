import { eq } from "drizzle-orm";
import { z } from "zod";
import { user } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
	deleteImage: protectedProcedure
		.input(z.enum(["profile", "logo"]))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(user)
				.set(input === "profile" ? { image: null } : { companyLogo: null })
				.where(eq(user.id, ctx.session.user.id));

			return `${input === "profile" ? "Profile photo" : "Company logo"} removed successfully`;
		}),

	me: protectedProcedure.query(async ({ ctx }) => {
		const { db, session } = ctx;

		const foundUser = await db.query.user.findFirst({
			where: eq(user.id, session.user.id),
			columns: {
				id: true,
				name: true,
				email: true,
				image: true,
				companyName: true,
				companyAddress: true,
				companyLogo: true,
				gstNumber: true,
				gstEnabled: true,
				gstRate: true,
			},
		});

		if (!foundUser) {
			throw new Error("User not found");
		}

		return foundUser;
	}),
});
