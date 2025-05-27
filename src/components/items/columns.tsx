"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { items } from "~/server/db/schema";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { EditItemModal } from "./edit-item-modal";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/components/ui/alert-dialog";

export const columns: ColumnDef<typeof items.$inferSelect>[] = [
	{
		accessorKey: "name",
		header: "Name",
	},
	{
		accessorKey: "description",
		header: "Description",
	},
	{
		accessorKey: "price",
		header: "Price",
		cell: ({ row }) => {
			const price = row.getValue("price") as number;
			return price.toLocaleString("en-US", {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			});
		},
	},
	{
		accessorKey: "createdAt",
		header: "Created At",
		cell: ({ row }) => {
			return new Date(row.getValue("createdAt")).toLocaleDateString();
		},
	},
	{
		id: "actions",
		cell: function ActionsCell({ row }) {
			const [editModalOpen, setEditModalOpen] = useState(false);
			const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
			const item = row.original;
			const utils = api.useUtils();

			const deleteItem = api.items.delete.useMutation({
				onSuccess: () => {
					toast.success("Item deleted successfully");
					void utils.items.getAll.invalidate();
				},
				onError: (error) => {
					toast.error(error.message);
				},
			});

			return (
				<>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setEditModalOpen(true)}>
								<Pencil className="mr-2 h-4 w-4" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-red-600"
								onClick={() => setDeleteDialogOpen(true)}
							>
								<Trash className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<AlertDialog
						open={deleteDialogOpen}
						onOpenChange={setDeleteDialogOpen}
					>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you sure?</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will permanently delete the
									item.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									className="bg-red-600 text-white hover:bg-red-700"
									onClick={() => deleteItem.mutate({ id: item.id })}
								>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>

					<EditItemModal
						item={item}
						open={editModalOpen}
						onOpenChange={setEditModalOpen}
					/>
				</>
			);
		},
	},
];
