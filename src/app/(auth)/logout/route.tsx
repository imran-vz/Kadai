import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth/config";

export async function GET(request: NextRequest) {
	await auth.api.signOut({
		headers: await headers(),
	});

	return NextResponse.redirect(new URL("/login", request.url));
}
