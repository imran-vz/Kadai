import cuid2 from "@paralleldrive/cuid2";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "~/server/auth";

export async function POST(request: Request) {
	try {
		const session = await auth();
		if (!session?.user) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const form = await request.formData();
		const file = form.get("file") as File;

		if (!file) {
			return new NextResponse("No file provided", { status: 400 });
		}

		const extension = file.name.split(".").pop();
		const fileName = `${cuid2.createId()}${extension ? `.${extension}` : ""}`;
		// Upload to blob storage
		const blob = await put(fileName, file, {
			access: "public",
			contentType: file.type,
		});

		return NextResponse.json({ url: blob.url });
	} catch (error) {
		console.error("Error uploading file:", error);
		return new NextResponse("Error uploading file", { status: 500 });
	}
}
