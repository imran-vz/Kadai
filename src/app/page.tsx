import { Cart } from "~/components/cart/cart";
import { ItemGrid } from "~/components/items/item-grid";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
	const session = await auth();

	if (session?.user) {
		void api.items.getAll.prefetch();
		void api.user.me.prefetch();
	}

	return (
		<HydrateClient>
			<div className="container mx-auto flex w-full flex-col items-center justify-center gap-12 px-4 py-16">
				{session ? (
					<div className="container flex flex-col gap-8 md:grid md:grid-cols-[1fr_500px]">
						<div>
							<ItemGrid />
						</div>
						<div className="h-full max-h-[600px] min-h-[400px] rounded-lg border bg-card">
							<Cart />
						</div>
					</div>
				) : (
					<h1 className="font-extrabold text-5xl tracking-tight sm:text-[5rem]">
						Kadai
					</h1>
				)}
			</div>
		</HydrateClient>
	);
}
