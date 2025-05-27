"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import type { RouterOutputs } from "~/trpc/react";

type Order = RouterOutputs["orders"]["getAll"][number];

export const columns: ColumnDef<Order>[] = [
	{
		accessorKey: "id",
		header: "Order ID",
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<div className="capitalize">{row.getValue("status")}</div>
		),
	},
	{
		accessorKey: "total",
		header: "Total",
		cell: ({ row }) => {
			const amount = Number.parseFloat(row.getValue("total"));
			const formatted = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(amount);
			return formatted;
		},
	},
	{
		accessorKey: "createdAt",
		header: "Date",
		cell: ({ row }) => {
			return format(new Date(row.getValue("createdAt")), "PPp");
		},
	},
];
