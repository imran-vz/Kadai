"use server";

import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { hash, genSalt } from "bcrypt";
const saltRounds = 10;

export async function signUp(formData: FormData) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const name = formData.get("name") as string;

	if (!email || !password || !name) {
		return { error: "Email, password and name are required" };
	}

	try {
		const salt = await genSalt(saltRounds);
		const hashedPassword = await hash(password, salt);
		await db.insert(users).values({
			email: email.toLowerCase(),
			password: hashedPassword,
			name,
		});
	} catch (error) {
		console.error(error);
	}
}
