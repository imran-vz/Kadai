import Link from "next/link";

import { auth } from "~/server/auth";
import { UserDropDown } from "./user-drop-down";

export async function Navbar() {
	const session = await auth();

	return (
		<header className="fixed top-0 z-50 w-full">
			<div className="px-4 sm:px-0">
				<div className="container mt-4 flex items-center justify-between rounded-lg border border-primary/10 bg-skin-fill bg-opacity-10 px-4 py-2 text-primary backdrop-blur-sm sm:mx-auto">
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
			</div>
		</header>
	);
}
