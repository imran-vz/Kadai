"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatCurrency } from "~/lib/utils";
import { api } from "~/trpc/react";
import { LoadingSpinner } from "../ui/loading-spinner";

export function ItemsOverview() {
	const { data: items, isLoading, error } = api.items.getAll.useQuery();

	if (isLoading) {
		return (
			<div className="flex justify-center py-8">
				<LoadingSpinner className="h-8 w-8" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="py-8 text-center text-red-500">
				Error loading items: {error.message}
			</div>
		);
	}

	if (!items) {
		return null;
	}

	const totalItems = items.length;
	const totalValue = items.reduce(
		(sum, item) => sum + Number.parseFloat(item.price),
		0,
	);
	const avgPrice = totalItems > 0 ? totalValue / totalItems : 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Items Overview</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-3">
					<div className="text-center">
						<div className="font-bold text-2xl">{totalItems}</div>
						<p className="text-muted-foreground text-xs">Total Items</p>
					</div>
					<div className="text-center">
						<div className="font-bold text-2xl">
							{formatCurrency(totalValue)}
						</div>
						<p className="text-muted-foreground text-xs">Total Value</p>
					</div>
					<div className="text-center">
						<div className="font-bold text-2xl">{formatCurrency(avgPrice)}</div>
						<p className="text-muted-foreground text-xs">Average Price</p>
					</div>
				</div>

				{totalItems > 0 && (
					<div className="mt-6">
						<h4 className="mb-3 font-medium text-sm">Recent Items</h4>
						<div className="space-y-2">
							{items.slice(0, 5).map((item) => (
								<div
									key={item.id}
									className="flex items-center justify-between py-1"
								>
									<span className="flex-1 truncate text-sm">{item.name}</span>
									<span className="font-medium text-sm">
										{formatCurrency(Number.parseFloat(item.price))}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
