"use server";

import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

export async function updateUser(userID: string, user: { name: string }) {
	await db.update(users).set({ name: user.name }).where(eq(users.id, userID));
}
