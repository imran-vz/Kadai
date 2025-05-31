import Link from "next/link";
import { Button } from "../ui/button";

export async function Navbar() {
	return (
		<header className="fixed top-0 z-50 w-full">
			<div className="px-4 sm:px-0">
				<div className="container mt-4 flex items-center justify-between rounded-lg border border-primary/10 bg-skin-fill bg-opacity-10 px-4 py-2 text-primary backdrop-blur-sm sm:mx-auto">
					<Link href="/">
						<h1 className="font-bold text-2xl">Kadai</h1>
					</Link>

					<div className="flex items-center gap-2">
						<Button variant="ghost" asChild>
							<Link href="/login">Login</Link>
						</Button>
						<Button asChild>
							<Link href="/signup">Sign up</Link>
						</Button>
					</div>
				</div>
			</div>
		</header>
	);
}
