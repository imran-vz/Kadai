import { eq } from "drizzle-orm";
import { db } from "../index";
import { DatabaseError, NotFoundError } from "../errors";
import { users } from "../schema";
import { err, ok, type Result } from "~/lib/result";

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
