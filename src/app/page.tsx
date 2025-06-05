import Link from "next/link";
import { DashboardStats } from "~/components/dashboard/dashboard-stats";
import { ItemsOverview } from "~/components/dashboard/items-overview";
import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";

export default async function Home() {
	const session = await auth();

	if (session?.user) {
		void api.orders.getDashboardStats.prefetch();
		void api.items.getAll.prefetch();
		void api.user.me.prefetch();
	}

	return (
		<HydrateClient>
			<div className="container mx-auto flex w-full flex-col items-center justify-center gap-12 px-4 py-8">
				{session ? (
					<div className="w-full space-y-8">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="font-bold text-3xl">Dashboard</h1>
								<p className="text-muted-foreground">
									Overview of your orders and items
								</p>
							</div>
							<Button asChild>
								<Link href="/shop">Go to Shop</Link>
							</Button>
						</div>

						<DashboardStats />

						<ItemsOverview />
					</div>
				) : (
					<div className="space-y-6 text-center">
						<h1 className="font-extrabold text-5xl tracking-tight sm:text-[5rem]">
							Kadai
						</h1>
						<p className="text-muted-foreground text-xl">
							Manage your business orders and inventory
						</p>
						<Button asChild size="lg">
							<Link href="/login">Get Started</Link>
						</Button>
					</div>
				)}
			</div>
		</HydrateClient>
	);
}
