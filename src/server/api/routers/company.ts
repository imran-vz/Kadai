import { eq } from "drizzle-orm";
import { z } from "zod";
import { user } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

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
				.update(user)
				.set({
					companyName: input.companyName,
					companyAddress: input.companyAddress,
					gstNumber: input.gstNumber,
					gstEnabled: input.gstEnabled,
					gstRate: input.gstRate.toString(),
				})
				.where(eq(user.id, session.user.id));

			return { success: true };
		}),
});
