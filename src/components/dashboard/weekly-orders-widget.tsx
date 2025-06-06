"use client";

import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { LoadingSpinner } from "../ui/loading-spinner";

type WeeklyOrdersWidgetProps = {
	ordersLast7Days?: number;
	isLoading?: boolean;
	error?: Error | null;
};

export function WeeklyOrdersWidget({
	ordersLast7Days,
	isLoading,
	error,
}: WeeklyOrdersWidgetProps) {
	if (error) {
		return (
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="font-medium text-sm">Last 7 Days</CardTitle>
					<Calendar className="h-4 w-4 text-muted-foreground" />
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
					<CardTitle className="font-medium text-sm">Last 7 Days</CardTitle>
					<Calendar className="h-4 w-4 text-muted-foreground" />
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
				<CardTitle className="font-medium text-sm">Last 7 Days</CardTitle>
				<Calendar className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="font-bold text-2xl">{ordersLast7Days ?? 0}</div>
				<p className="text-muted-foreground text-xs">Orders this week</p>
			</CardContent>
		</Card>
	);
}
