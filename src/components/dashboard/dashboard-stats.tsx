import { api } from "~/trpc/server";
import { MonthlyChart } from "./monthly-chart";
import { MonthlyOrdersWidget } from "./monthly-orders-widget";
import { MonthlySummaryWidget } from "./monthly-summary-widget";
import { TotalOrdersWidget } from "./total-orders-widget";
import { WeeklyChart } from "./weekly-chart";
import { WeeklyOrdersWidget } from "./weekly-orders-widget";

export async function DashboardStats() {
	try {
		const stats = await api.orders.getDashboardStats();
		if (!stats) {
			return null;
		}
		return (
			<div className="space-y-6">
				{/* Overview Cards */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<TotalOrdersWidget totalOrders={stats.totalOrders} />

					<WeeklyOrdersWidget ordersLast7Days={stats.ordersLast7Days} />

					<MonthlyOrdersWidget ordersLast30Days={stats.ordersLast30Days} />

					<MonthlySummaryWidget summary={stats.currentMonthSummary} />
				</div>

				{/* Charts */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<WeeklyChart />

					<MonthlyChart />
				</div>
			</div>
		);
	} catch (error) {
		if (error) {
			return (
				<div className="py-8 text-center text-red-500">
					Error loading dashboard stats:{" "}
					{error instanceof Error ? error.message : "Unknown error"}
				</div>
			);
		}
	}
}
