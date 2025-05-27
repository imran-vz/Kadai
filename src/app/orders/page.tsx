"use client";

import { OrdersTable } from "~/components/orders/columns";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { api } from "~/trpc/react";

export default function OrdersPage() {
	const { data: orders, isLoading } = api.orders.getAll.useQuery();

	if (isLoading) {
		return (
			<div className="flex h-[calc(100vh-200px)] items-center justify-center">
				<LoadingSpinner className="h-12 w-12 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="container mx-auto py-10">
			<div className="mb-8">
				<h1 className="font-bold text-2xl">Orders</h1>
			</div>

			<OrdersTable data={orders ?? []} />
		</div>
	);
}
