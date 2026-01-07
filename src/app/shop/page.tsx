import { redirect } from "next/navigation";
import { Cart } from "~/components/cart/cart";
import { ItemGrid } from "~/components/items/item-grid";
import { getSession } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";

export default async function ShopPage() {
	const session = await getSession();

	if (!session?.user) {
		redirect("/login");
	}

	void api.items.getAll.prefetch();
	void api.user.me.prefetch();

	return (
		<HydrateClient>
			<div className="container mx-auto flex w-full flex-col items-center justify-center gap-12 px-4 py-16">
				<div className="w-full">
					<div className="mb-8">
						<h1 className="font-bold text-3xl">Shop</h1>
						<p className="text-muted-foreground">
							Browse items and manage your cart
						</p>
					</div>

					<div className="container flex flex-col gap-8 md:grid md:grid-cols-[1fr_500px]">
						<div>
							<ItemGrid />
						</div>
						<div className="h-full max-h-150 min-h-100 rounded-lg border bg-card">
							<Cart />
						</div>
					</div>
				</div>
			</div>
		</HydrateClient>
	);
}
