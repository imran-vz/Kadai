import { eq } from "drizzle-orm";
import { type Result, err, ok } from "~/lib/result";
import { DatabaseError, NotFoundError } from "../errors";
import { db } from "../index";
import { user } from "../schema";

export async function getUserByEmail(
	email: string,
): Promise<Result<typeof user.$inferSelect, Error>> {
	try {
		const foundUser = await db.query.user.findFirst({
			where: eq(user.email, email),
		});

		if (!foundUser) return err(new NotFoundError("User not found"));

		return ok(foundUser);
	} catch (error) {
		console.error("Failed to fetch user:", error);
		return err(new DatabaseError("Failed to fetch user."));
	}
}
