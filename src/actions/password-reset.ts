"use server";

import { genSalt, hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { generatePasswordResetToken, sendPasswordResetEmail } from "~/lib/auth";
import { db } from "~/server/db";
import { passwordResetTokens, users } from "~/server/db/schema";

export async function forgotPassword(formData: FormData) {
	const email = formData.get("email") as string;
	if (!email) {
		return { error: "Email is required" };
	}

	try {
		const user = await db.query.users.findFirst({
			where: eq(users.email, email.toLowerCase()),
		});

		if (!user) {
			// Return success even if user not found to prevent email enumeration
			return { success: true };
		}

		// Generate reset token
		const token = await generatePasswordResetToken();
		// Store token in database
		await db.insert(passwordResetTokens).values({
			token,
			userId: user.id,
			expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour expiry
		});

		// Send reset email
		await sendPasswordResetEmail(email, token);

		return { success: true };
	} catch (error) {
		console.error(error);
		return { error: "Something went wrong" };
	}
}

export async function resetPassword(formData: FormData) {
	const token = formData.get("token") as string;
	const password = formData.get("password") as string;

	if (!token || !password) {
		return { error: "Token and password are required" };
	}

	try {
		// Find valid token
		const resetToken = await db.query.passwordResetTokens.findFirst({
			where: eq(passwordResetTokens.token, token),
			with: { user: true },
		});

		if (!resetToken || resetToken.expiresAt < new Date()) {
			return { error: "Invalid or expired token" };
		}

		// Hash new password
		const salt = await genSalt(10);
		const hashedPassword = await hash(password, salt);

		// Update password
		await db
			.update(users)
			.set({ password: hashedPassword })
			.where(eq(users.id, resetToken.userId));

		// Delete used token
		await db
			.delete(passwordResetTokens)
			.where(eq(passwordResetTokens.token, token));

		return { success: true };
	} catch (error) {
		console.error(error);
		return { error: "Something went wrong" };
	}
}
