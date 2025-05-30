"use client";

import { useState } from "react";
import { OrderDetailsModal } from "~/components/orders/order-details-modal";
import { DataTable } from "~/components/ui/data-table";
import { columns } from "~/components/orders/columns";
import type { Order } from "~/server/db/schema";
import { api } from "~/trpc/react";

export default function OrdersPage() {
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [page, setPage] = useState(0);

	const [data, { isLoading }] = api.orders.getAll.useSuspenseQuery({
		limit: 10,
		cursor: page.toString(),
	});

	return (
		<div className="container mx-auto py-10">
			<div className="mb-8 flex items-center justify-between">
				<h1 className="font-bold text-2xl">Orders</h1>
			</div>
			<DataTable
				columns={columns}
				data={data?.items ?? []}
				isLoading={isLoading}
				pageCount={data?.totalPages}
				onRowClick={(row) => setSelectedOrder(row)}
				pagination={{
					page,
					hasNextPage: data?.nextCursor !== undefined,
					hasPrevPage: page > 0,
					onNextPage: () => setPage(page + 1),
					onPrevPage: () => setPage(page - 1),
				}}
			/>

			{selectedOrder && (
				<OrderDetailsModal
					order={selectedOrder}
					onOpenChange={(open) => !open && setSelectedOrder(null)}
				/>
			)}
		</div>
	);
}
