"use client";

import { AddItemModal } from "~/components/items/add-item-modal";
import { columns } from "~/components/items/columns";
import { DataTable } from "~/components/ui/data-table";
import { api } from "~/trpc/react";

export default function ItemsPage() {
	const [items, { error }] = api.items.getAll.useSuspenseQuery();

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	return (
		<div className="container mx-auto py-10">
			<div className="mb-8 flex items-center justify-between">
				<h1 className="font-bold text-2xl">Items</h1>
				<AddItemModal />
			</div>

			<DataTable columns={columns} data={items ?? []} />
		</div>
	);
}
