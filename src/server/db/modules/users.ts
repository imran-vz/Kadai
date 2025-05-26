import { eq } from "drizzle-orm";
import { type Result, err, ok } from "~/lib/result";
import { DatabaseError, NotFoundError } from "../errors";
import { db } from "../index";
import { users } from "../schema";

export async function getUserByEmail(
	email: string,
): Promise<Result<typeof users.$inferSelect, Error>> {
	try {
		const user = await db.query.users.findFirst({
			where: eq(users.email, email),
		});

		if (!user) return err(new NotFoundError("User not found"));

		return ok(user);
	} catch (error) {
		console.error("Failed to fetch user:", error);
		return err(new DatabaseError("Failed to fetch user."));
	}
}
