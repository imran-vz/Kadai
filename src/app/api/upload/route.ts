import cuid2 from "@paralleldrive/cuid2";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { imageUpdateLogs, users } from "~/server/db/schema";
import { and, count, eq, gte } from "drizzle-orm";
import { auth } from "~/server/auth";
import { env } from "~/env";

export async function POST(req: Request) {
	try {
		const session = await auth();
		if (!session?.user) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const form = await req.formData();
		const file = form.get("file") as File;
		const type = form.get("type") as "profile" | "logo";

		if (!file) {
			return new NextResponse("No file provided", { status: 400 });
		}

		if (!type || !["profile", "logo"].includes(type)) {
			return new NextResponse("Invalid type", { status: 400 });
		}

		// Check rate limit
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const [updateCount] = await db
			.select({ count: count(imageUpdateLogs.id) })
			.from(imageUpdateLogs)
			.where(
				and(
					eq(imageUpdateLogs.userId, session.user.id),
					eq(
						imageUpdateLogs.type,
						type === "profile" ? "profile" : "company_logo",
					),
					gte(imageUpdateLogs.createdAt, today),
				),
			);

		if (!updateCount || updateCount.count >= env.MAX_IMAGE_UPLOADS_PER_DAY) {
			return new NextResponse(
				`You can only update your ${
					type === "profile" ? "profile photo" : "company logo"
				} twice per day`,
				{ status: 429 },
			);
		}

		const extension = file.name.split(".").pop();
		const fileName = `${cuid2.createId()}${extension ? `.${extension}` : ""}`;

		// Upload to blob storage
		const blob = await put(`${session.user.id}/${type}/${fileName}`, file, {
			access: "public",
			contentType: file.type,
		});

		// Log the update attempt
		await db.insert(imageUpdateLogs).values({
			userId: session.user.id,
			type: type === "profile" ? "profile" : "company_logo",
			createdAt: new Date(),
		});

		// Update user's image or company logo
		await db
			.update(users)
			.set(type === "profile" ? { image: blob.url } : { companyLogo: blob.url })
			.where(eq(users.id, session.user.id));

		const updatesLeft = env.MAX_IMAGE_UPLOADS_PER_DAY - (updateCount.count + 1);

		return NextResponse.json({
			url: blob.url,
			updatesLeft,
			message: `${
				type === "profile" ? "Profile photo" : "Company logo"
			} uploaded successfully. You have ${updatesLeft} update${
				updatesLeft === 1 ? "" : "s"
			} left today.`,
		});
	} catch (error) {
		console.error("Upload error:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
