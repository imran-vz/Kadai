import crypto from "node:crypto";
import { env } from "~/env";

export async function generatePasswordResetToken(): Promise<string> {
	return crypto.randomBytes(32).toString("hex");
}

export async function sendPasswordResetEmail(email: string, token: string) {
	// TODO: Implement your email sending logic here
	// For now, just log the reset link
	const resetLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
	console.log("Password reset link:", resetLink);
}
