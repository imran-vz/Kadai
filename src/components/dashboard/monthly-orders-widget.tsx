"use client";

import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { LoadingSpinner } from "../ui/loading-spinner";

type MonthlyOrdersWidgetProps = {
	ordersLast30Days?: number;
	isLoading?: boolean;
	error?: Error | null;
};

export function MonthlyOrdersWidget({
	ordersLast30Days,
	isLoading,
	error,
}: MonthlyOrdersWidgetProps) {
	if (error) {
		return (
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="font-medium text-sm">Last 30 Days</CardTitle>
					<CalendarDays className="h-4 w-4 text-muted-foreground" />
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
					<CardTitle className="font-medium text-sm">Last 30 Days</CardTitle>
					<CalendarDays className="h-4 w-4 text-muted-foreground" />
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
				<CardTitle className="font-medium text-sm">Last 30 Days</CardTitle>
				<CalendarDays className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="font-bold text-2xl">{ordersLast30Days ?? 0}</div>
				<p className="text-muted-foreground text-xs">Orders this month</p>
			</CardContent>
		</Card>
	);
}
