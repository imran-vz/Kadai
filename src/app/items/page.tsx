"use client";

import { AddItemModal } from "~/components/items/add-item-modal";
import { columns } from "~/components/items/columns";
import { DataTable } from "~/components/ui/data-table";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { api } from "~/trpc/react";

export default function ItemsPage() {
	const { data: items, isLoading, error } = api.items.getAll.useQuery();

	if (isLoading) {
		return (
			<div className="flex h-[calc(100vh-200px)] items-center justify-center">
				<LoadingSpinner className="h-12 w-12 animate-spin text-primary" />
			</div>
		);
	}

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	return (
		<div className="container py-10">
			<div className="mb-8 flex items-center justify-between">
				<h1 className="font-bold text-2xl">Items</h1>
				<AddItemModal />
			</div>

			<DataTable columns={columns} data={items ?? []} />
		</div>
	);
}
