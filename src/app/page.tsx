import { getWeek } from "date-fns";
import Link from "next/link";
import { Suspense } from "react";
import { DashboardStats } from "~/components/dashboard/dashboard-stats";
import { ItemsOverview } from "~/components/dashboard/items-overview";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { auth } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";

export default async function Home() {
	const session = await auth();

	if (session?.user) {
		void api.items.getAll.prefetch();
		void api.user.me.prefetch();
		void api.orders.getDashboardStats.prefetch();
		const currentDate = new Date();
		void api.orders.getWeeklyOrders.prefetch({
			week: getWeek(currentDate) - 1,
			year: currentDate.getFullYear(),
		});
		void api.orders.getMonthlyOrders.prefetch({
			month: currentDate.getMonth() + 1,
			year: currentDate.getFullYear(),
		});
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

						<Suspense
							fallback={
								<div className="space-y-6">
									<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
										<Skeleton className="h-36 w-full bg-white md:max-w-xs" />
										<Skeleton className="h-36 w-full bg-white md:max-w-xs" />
										<Skeleton className="h-36 w-full bg-white md:max-w-xs" />
										<Skeleton className="h-36 w-full bg-white md:max-w-xs" />
									</div>

									<div className="grid gap-4 md:grid-cols-2">
										<Skeleton className="h-[28rem] w-full bg-white" />
										<Skeleton className="h-[28rem] w-full bg-white" />
									</div>
								</div>
							}
						>
							<DashboardStats />
						</Suspense>

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
