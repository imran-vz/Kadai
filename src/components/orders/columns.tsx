"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { DataTable } from "~/components/ui/data-table";
import { cn, formatCurrency } from "~/lib/utils";
import type { orders } from "~/server/db/schema";
import { OrderDetailsModal } from "./order-details-modal";

const statusStyles = {
	pending:
		"bg-yellow-100 hover:bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
	processing:
		"bg-blue-100 hover:bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
	completed:
		"bg-green-100 hover:bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
	cancelled:
		"bg-red-100 hover:bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
} as const;

function StatusBadge({ status }: { status: keyof typeof statusStyles }) {
	return (
		<Badge
			variant="secondary"
			className={cn("capitalize", statusStyles[status])}
		>
			{status}
		</Badge>
	);
}

export const columns: ColumnDef<typeof orders.$inferSelect>[] = [
	{
		accessorKey: "customerName",
		header: "Customer",
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as keyof typeof statusStyles;
			return <StatusBadge status={status} />;
		},
	},
	{
		accessorKey: "total",
		header: "Total",
		cell: ({ row }) => {
			const total = row.getValue("total") as number;
			return <span>{formatCurrency(total)}</span>;
		},
	},
	{
		accessorKey: "createdAt",
		header: "Date",
		cell: ({ row }) => {
			return new Date(row.getValue("createdAt")).toLocaleDateString("en-IN");
		},
	},
];

export function OrdersTable({
	data,
}: {
	data: (typeof orders.$inferSelect)[];
}) {
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
	const selectedOrder =
		data.find((order) => order.id === selectedOrderId) || null;

	return (
		<>
			<DataTable
				columns={columns}
				data={data}
				onRowClick={(row) => setSelectedOrderId(row.original.id)}
			/>
			{selectedOrder && (
				<OrderDetailsModal
					order={selectedOrder}
					onOpenChange={(open) => !open && setSelectedOrderId(null)}
				/>
			)}
		</>
	);
}
