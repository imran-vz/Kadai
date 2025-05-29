"use client";

import { Button } from "~/components/ui/button";
import { useCart } from "~/lib/store/cart";
import { formatCurrency } from "~/lib/utils";
import { api } from "~/trpc/react";

export function ItemGrid() {
	const [items] = api.items.getAll.useSuspenseQuery();
	const { addItem } = useCart();

	return (
		<div className="grid grid-cols-2 gap-4 align-baseline sm:flex sm:flex-wrap sm:justify-start">
			{items?.map((item) => (
				<Button
					key={item.id}
					variant="outline"
					className="flex h-24 flex-col gap-2 p-4 sm:w-52"
					onClick={() => addItem(item)}
				>
					<span className="max-w-40 truncate font-semibold text-lg">
						{item.name}
					</span>
					<span className="text-muted-foreground">
						{formatCurrency(Number(item.price))}
					</span>
				</Button>
			))}
		</div>
	);
}
