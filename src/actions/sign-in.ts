"use server";

import { AuthError } from "next-auth";
import { signIn } from "~/server/auth";

export async function signInToGoogleAction() {
	await signIn("google", { redirectTo: "/" });
}

export async function signInWithCredentials(formData: FormData) {
	const email = formData.get("email");
	const password = formData.get("password");

	if (!email || !password) {
		return "Email and password are required";
	}

	try {
		await signIn("credentials", { email, password, redirect: false });
	} catch (error) {
		console.log(" :100 | signInWithCredentials | error:", error);
		if (error instanceof AuthError) {
			switch (error.type) {
				case "CredentialsSignin":
					return "Invalid credentials.";
				default:
					return "Something went wrong.";
			}
		}

		console.error(error);
		return "Invalid email or password";
	}
}
