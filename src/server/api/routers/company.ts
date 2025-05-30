import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { eq } from "drizzle-orm";
import { users } from "~/server/db/schema";

const updateCompanySchema = z.object({
	companyName: z.string().min(1, "Company name is required"),
	companyAddress: z.string().min(1, "Company address is required"),
	gstNumber: z.string().optional(),
	gstEnabled: z.boolean().default(false),
	gstRate: z.number().min(0).max(100).default(18),
});

export const companyRouter = createTRPCRouter({
	update: protectedProcedure
		.input(updateCompanySchema)
		.mutation(async ({ ctx, input }) => {
			const { db, session } = ctx;

			await db
				.update(users)
				.set({
					companyName: input.companyName,
					companyAddress: input.companyAddress,
					gstNumber: input.gstNumber,
					gstEnabled: input.gstEnabled,
					gstRate: input.gstRate.toString(),
				})
				.where(eq(users.id, session.user.id));

			return { success: true };
		}),
});
