import Link from "next/link";

import { auth } from "~/server/auth";
import { UserDropDown } from "./user-drop-down";

export async function Navbar() {
	const session = await auth();

	return (
		<header className="absolute top-0 z-50 h-16 w-full border-primary/10 border-b bg-skin-fill bg-opacity-10 py-4 text-primary backdrop-blur-sm">
			<div className="container mx-auto flex items-center justify-between px-4">
				<Link href="/">
					<h1 className="font-bold text-2xl">Kadai</h1>
				</Link>

				{session ? (
					<UserDropDown session={session} key={session.user?.image} />
				) : (
					<Link
						href="/login"
						className="rounded-full bg-white/10 px-6 py-1 font-semibold no-underline outline transition hover:bg-white/20"
					>
						Sign in
					</Link>
				)}
			</div>
		</header>
	);
}
