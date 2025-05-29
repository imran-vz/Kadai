"use client";

import { OrdersTable } from "~/components/orders/columns";
import { api } from "~/trpc/react";

export default function OrdersPage() {
	const [orders, { error }] = api.orders.getAll.useSuspenseQuery();

	if (error) {
		return <div>Error: {error.message}</div>;
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
