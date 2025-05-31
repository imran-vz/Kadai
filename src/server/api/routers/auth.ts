import { render } from "@react-email/render";
import { TRPCError } from "@trpc/server";
import { genSalt, hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ForgotPasswordEmail } from "~/emails/forgot-password";
import { generatePasswordResetToken } from "~/lib/auth";
import { sendEmail } from "~/lib/email";
import { passwordResetTokens, users } from "~/server/db/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

const signupSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	name: z.string().min(1),
});

export const authRouter = createTRPCRouter({
	forgotPassword: publicProcedure
		.input(z.object({ email: z.string().email() }))
		.mutation(async ({ ctx, input }) => {
			const user = await ctx.db.query.users.findFirst({
				where: eq(users.email, input.email.toLowerCase()),
			});

			if (!user) {
				// Return success even if user not found to prevent email enumeration
				return { success: true };
			}

			const token = await generatePasswordResetToken();
			const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

			await ctx.db.insert(passwordResetTokens).values({
				token,
				userId: user.id,
				expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour expiry
			});

			const emailHtml = await render(ForgotPasswordEmail({ resetLink }));

			await sendEmail({
				to: input.email,
				subject: "Reset your password",
				html: emailHtml,
			});

			return { success: true };
		}),

	resetPassword: publicProcedure
		.input(
			z.object({
				token: z.string(),
				password: z.string().min(8),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const resetToken = await ctx.db.query.passwordResetTokens.findFirst({
				where: eq(passwordResetTokens.token, input.token),
				with: { user: true },
			});

			if (!resetToken || resetToken.expiresAt < new Date()) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid or expired token",
				});
			}

			const salt = await genSalt(10);
			const hashedPassword = await hash(input.password, salt);

			await ctx.db
				.update(users)
				.set({ password: hashedPassword })
				.where(eq(users.id, resetToken.userId));

			await ctx.db
				.delete(passwordResetTokens)
				.where(eq(passwordResetTokens.token, input.token));

			return { success: true };
		}),

	signup: publicProcedure
		.input(signupSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const salt = await genSalt(10);
				const hashedPassword = await hash(input.password, salt);

				await ctx.db.insert(users).values({
					email: input.email.toLowerCase(),
					password: hashedPassword,
					name: input.name,
				});

				return { success: true };
			} catch (error) {
				// Check if error is due to duplicate email
				if (error instanceof Error && error.message.includes("duplicate key")) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Email already exists",
					});
				}

				console.error(error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Something went wrong",
				});
			}
		}),
});
