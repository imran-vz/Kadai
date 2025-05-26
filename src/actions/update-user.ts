"use server";

import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function updateUser(userID: string, user: { name: string }) {
	await db.update(users).set({ name: user.name }).where(eq(users.id, userID));
}
