"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { api } from "~/trpc/react";

export function AddItemModal() {
	const [open, setOpen] = useState(false);
	const utils = api.useUtils();

	const createItem = api.items.create.useMutation({
		onSuccess: () => {
			toast.success("Item created successfully");
			setOpen(false);
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
		createItem.mutate({
			name: formData.get("name") as string,
			description: formData.get("description") as string,
			price,
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Add Item</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add New Item</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Input name="name" placeholder="Item name" required />
					</div>
					<div>
						<Input name="price" type="number" placeholder="Price" required />
					</div>
					<div>
						<Textarea
							name="description"
							placeholder="Description"
							className="min-h-[100px]"
						/>
					</div>
					<Button
						type="submit"
						className="w-full"
						disabled={createItem.isPending}
					>
						{createItem.isPending ? (
							<div className="flex items-center gap-2">
								<LoadingSpinner className="h-4 w-4 animate-spin" />
								Creating...
							</div>
						) : (
							"Create Item"
						)}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
