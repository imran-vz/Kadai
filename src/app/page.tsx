import Link from "next/link";

import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
	const session = await auth();

	return (
		<HydrateClient>
			<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
				<h1 className="font-extrabold text-5xl tracking-tight sm:text-[5rem]">
					Kadai
				</h1>

				<div className="flex flex-col items-center gap-2">
					<div className="flex flex-col items-center justify-center gap-4">
						<p className="text-center text-2xl">
							{session && <span>Logged in as {session.user?.name}</span>}
						</p>
						<Link
							href={session ? "/api/auth/signout" : "/api/auth/signin"}
							className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
						>
							{session ? "Sign out" : "Sign in"}
						</Link>
					</div>
				</div>
			</div>
		</HydrateClient>
	);
}
