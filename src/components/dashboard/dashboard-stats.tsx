"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { OrderChart } from "./order-charts";

export function DashboardStats() {
	const {
		data: stats,
		isLoading,
		error,
	} = api.orders.getDashboardStats.useQuery();

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
				Error loading dashboard stats: {error.message}
			</div>
		);
	}

	if (!stats) {
		return null;
	}

	return (
		<div className="space-y-6">
			{/* Overview Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Total Orders</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{stats.totalOrders}</div>
						<p className="text-muted-foreground text-xs">All time</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Last 7 Days</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{stats.ordersLast7Days}</div>
						<p className="text-muted-foreground text-xs">Orders this week</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Last 30 Days</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{stats.ordersLast30Days}</div>
						<p className="text-muted-foreground text-xs">Orders this month</p>
					</CardContent>
				</Card>
			</div>

			{/* Charts */}
			<div className="grid gap-4 md:grid-cols-2">
				<OrderChart
					data={stats.ordersByDay7}
					title="Orders per Day (Last 7 Days)"
					description="Daily order count for the past week"
				/>

				<OrderChart
					data={stats.ordersByDay30}
					title="Orders per Day (Last 30 Days)"
					description="Daily order count for the past month"
				/>
			</div>
		</div>
	);
}
