"use client";

import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { LoadingSpinner } from "../ui/loading-spinner";

type TotalOrdersWidgetProps = {
	totalOrders?: number;
	isLoading?: boolean;
	error?: Error | null;
};

export function TotalOrdersWidget({
	totalOrders,
	isLoading,
	error,
}: TotalOrdersWidgetProps) {
	if (error) {
		return (
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="font-medium text-sm">Total Orders</CardTitle>
					<Package className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-red-500 text-sm">Error loading data</div>
				</CardContent>
			</Card>
		);
	}

	if (isLoading) {
		return (
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="font-medium text-sm">Total Orders</CardTitle>
					<Package className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-4">
						<LoadingSpinner className="h-4 w-4" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="justify-between">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-sm">Total Orders</CardTitle>
				<Package className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="font-bold text-2xl">{totalOrders ?? 0}</div>
				<p className="text-muted-foreground text-xs">All time</p>
			</CardContent>
		</Card>
	);
}
