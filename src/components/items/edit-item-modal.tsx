"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { api } from "~/trpc/react";
import type { Item } from "~/server/db/schema";

interface EditItemModalProps {
	item: Item;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditItemModal({
	item,
	open,
	onOpenChange,
}: EditItemModalProps) {
	const utils = api.useUtils();

	const editItem = api.items.update.useMutation({
		onSuccess: () => {
			toast.success("Item updated successfully");
			onOpenChange(false);
			void utils.items.getAll.invalidate();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const price = Number.parseInt((formData.get("price") as string) ?? "0");

		editItem.mutate({
			id: item.id,
			name: formData.get("name") as string,
			description: formData.get("description") as string,
			price,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Item</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Input
							name="name"
							placeholder="Item name"
							defaultValue={item.name}
							required
						/>
					</div>
					<div>
						<Input
							name="price"
							type="number"
							placeholder="Price"
							defaultValue={item.price}
							required
						/>
					</div>
					<div>
						<Textarea
							name="description"
							placeholder="Description"
							className="min-h-[100px]"
							defaultValue={item.description ?? ""}
						/>
					</div>
					<Button
						type="submit"
						className="w-full"
						disabled={editItem.isPending}
					>
						{editItem.isPending ? (
							<div className="flex items-center gap-2">
								<LoadingSpinner className="h-4 w-4 animate-spin" />
								Updating...
							</div>
						) : (
							"Update Item"
						)}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
