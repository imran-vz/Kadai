"use client";

import {
	Bar,
	ComposedChart,
	Line,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { formatCurrency } from "~/lib/utils";
import { api } from "~/trpc/react";
import { LoadingSpinner } from "../ui/loading-spinner";

const months = [
	{ value: 1, label: "January" },
	{ value: 2, label: "February" },
	{ value: 3, label: "March" },
	{ value: 4, label: "April" },
	{ value: 5, label: "May" },
	{ value: 6, label: "June" },
	{ value: 7, label: "July" },
	{ value: 8, label: "August" },
	{ value: 9, label: "September" },
	{ value: 10, label: "October" },
	{ value: 11, label: "November" },
	{ value: 12, label: "December" },
];

export function MonthlyChart() {
	const currentDate = new Date();
	const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
	const [selectedMonth, setSelectedMonth] = useState(
		currentDate.getMonth() + 1,
	);

	const {
		data: monthlyData,
		isLoading,
		error,
	} = api.orders.getMonthlyOrders.useQuery({
		year: selectedYear,
		month: selectedMonth,
	});

	// Generate year options (current year and past 2 years)
	const yearOptions = Array.from(
		{ length: 3 },
		(_, i) => currentDate.getFullYear() - i,
	);

	const selectedMonthName =
		months.find((m) => m.value === selectedMonth)?.label || "";

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Monthly Orders</CardTitle>
					<CardDescription>
						Daily order count for the selected month
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex h-[300px] items-center justify-center text-red-500">
						Error loading data: {error.message}
					</div>
				</CardContent>
			</Card>
		);
	}

	// Generate all days for the selected month and fill missing days with 0
	const generateCompleteMonthData = () => {
		if (!monthlyData || monthlyData.ordersByDay.length === 0) return [];

		// Get the number of days in the selected month
		const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

		// Create a map of existing data for quick lookup
		const dataMap = new Map(
			monthlyData.ordersByDay.map((item) => [
				item.date,
				{ count: item.count, totalValue: item.totalValue },
			]),
		);

		// Generate data for all days of the month
		const completeData = [];
		for (let day = 1; day <= daysInMonth; day++) {
			const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
			const dayData = dataMap.get(dateStr);
			const count = dayData?.count || 0;
			const totalValue = dayData?.totalValue || 0;

			completeData.push({
				date: new Date(selectedYear, selectedMonth - 1, day).toLocaleDateString(
					"en-US",
					{ month: "short", day: "numeric" },
				),
				count,
				totalValue,
				fullDate: dateStr,
			});
		}

		return completeData;
	};

	const chartData = generateCompleteMonthData();

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Monthly Orders</CardTitle>
						<CardDescription>
							Daily order count for {selectedMonthName} {selectedYear}
						</CardDescription>
					</div>
					<div className="flex gap-2">
						<Select
							value={selectedMonth.toString()}
							onValueChange={(value) => setSelectedMonth(Number(value))}
						>
							<SelectTrigger className="w-[130px]">
								<SelectValue placeholder="Month" />
							</SelectTrigger>
							<SelectContent>
								{months.map((month) => (
									<SelectItem key={month.value} value={month.value.toString()}>
										{month.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={selectedYear.toString()}
							onValueChange={(value) => setSelectedYear(Number(value))}
						>
							<SelectTrigger className="w-[100px]">
								<SelectValue placeholder="Year" />
							</SelectTrigger>
							<SelectContent>
								{yearOptions.map((year) => (
									<SelectItem key={year} value={year.toString()}>
										{year}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex h-[300px] items-center justify-center">
						<LoadingSpinner className="h-8 w-8" />
					</div>
				) : !chartData.length ? (
					<div className="flex h-[300px] items-center justify-center text-muted-foreground">
						No data available for {selectedMonthName} {selectedYear}
					</div>
				) : (
					<ResponsiveContainer width="100%" height={300}>
						<ComposedChart
							data={chartData}
							margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" tick={{ fontSize: 10 }} height={60} />
							<YAxis
								yAxisId="left"
								tick={{ fontSize: 12 }}
								allowDecimals={false}
							/>
							<YAxis
								yAxisId="right"
								orientation="right"
								tick={{ fontSize: 12 }}
								allowDecimals={false}
							/>
							<Tooltip
								labelFormatter={(label, payload) => {
									const fullDate = payload?.[0]?.payload?.fullDate;
									if (fullDate) {
										return new Date(fullDate).toLocaleDateString("en-US", {
											weekday: "long",
											year: "numeric",
											month: "long",
											day: "numeric",
										});
									}
									return label;
								}}
								formatter={(value: number, name: string) => {
									if (name === "totalValue") {
										return [formatCurrency(value), "Total Value"];
									}
									return [value, "Orders"];
								}}
							/>
							<Bar
								yAxisId="left"
								dataKey="count"
								fill="#053b21"
								radius={[4, 4, 0, 0]}
							/>
							<Line
								yAxisId="right"
								type="monotone"
								dataKey="totalValue"
								stroke="#c4cf29"
								strokeWidth={2}
								dot={({
									payload,
									cx,
									cy,
								}: {
									payload: { count: number; totalValue: number };
									cx: number;
									cy: number;
								}) => {
									// Only show dot if there are orders or total value > 0
									if (
										payload &&
										(payload.count > 0 || payload.totalValue > 0)
									) {
										return <circle cx={cx} cy={cy} fill="#c4cf29" r={3} />;
									}
									return <g />;
								}}
								activeDot={{ r: 5 }}
								animationEasing="linear"
								animationDuration={500}
							/>
						</ComposedChart>
					</ResponsiveContainer>
				)}
			</CardContent>
		</Card>
	);
}
