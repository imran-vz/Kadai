import { type NextRequest, NextResponse } from "next/server";
import { signOut } from "~/server/auth";

export async function GET(request: NextRequest) {
	await signOut();

	return NextResponse.redirect(new URL("/", request.url));
}
