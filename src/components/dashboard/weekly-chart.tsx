"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
	Bar,
	CartesianGrid,
	ComposedChart,
	Line,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { formatCurrency } from "~/lib/utils";
import { api } from "~/trpc/react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { getWeek } from "date-fns";

export function WeeklyChart() {
	const currentDate = new Date();
	const currentWeek = getWeek(currentDate) - 1;
	const currentYear = currentDate.getFullYear();
	const [selectedWeek, setSelectedWeek] = useState(currentWeek);

	const {
		data: weeklyData,
		isLoading,
		error,
	} = api.orders.getWeeklyOrders.useQuery({
		year: currentYear,
		week: selectedWeek,
	});

	// Prefetch next week's data
	const utils = api.useUtils();

	// Calculate previous week parameters
	const getPreviousWeekParams = () => {
		if (selectedWeek > 1) {
			return { year: currentYear, week: selectedWeek - 1 };
		}
		return null;
	};

	const previousWeekParams = getPreviousWeekParams();
	// Prefetch previous week if available
	if (previousWeekParams) {
		utils.orders.getWeeklyOrders.prefetch(previousWeekParams);
	}

	// Navigation functions
	const goToPreviousWeek = () => {
		if (selectedWeek > 1) {
			setSelectedWeek(selectedWeek - 1);
		}
	};

	const goToNextWeek = () => {
		if (selectedWeek >= currentWeek) {
			return;
		}

		if (selectedWeek >= 1) {
			setSelectedWeek(selectedWeek + 1);
		}
	};

	// Check if navigation buttons should be disabled
	const canGoBack = selectedWeek > 1;
	const canGoForward = selectedWeek < currentWeek;

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Weekly Orders</CardTitle>
					<CardDescription>
						Daily order count for the selected week
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

	// Generate all days for the selected week and fill missing days with 0
	const generateCompleteWeekData = () => {
		if (!weeklyData || !weeklyData.weekStart) return [];

		// Create a map of existing data for quick lookup
		const dataMap = new Map(
			weeklyData.ordersByDay.map((item) => [
				item.date,
				{ count: item.count, totalValue: item.totalValue },
			]),
		);

		// Generate data for all 7 days of the week
		const weekStart = new Date(weeklyData.weekStart);
		const completeData = [];

		for (let day = 0; day < 7; day++) {
			const currentDay = new Date(weekStart);
			currentDay.setDate(weekStart.getDate() + day);
			const dateStr = currentDay.toISOString().split("T")[0];
			const dayData = dateStr ? dataMap.get(dateStr) : null;
			const count = dayData?.count || 0;
			const totalValue = dayData?.totalValue || 0;

			completeData.push({
				date: currentDay.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				}),
				count,
				totalValue,
				fullDate: dateStr || "",
			});
		}

		return completeData;
	};

	const chartData = generateCompleteWeekData();

	// Format week display
	const formatWeekDisplay = () => {
		if (!weeklyData || !weeklyData.weekStart || !weeklyData.weekEnd) return "";
		const startDate = new Date(weeklyData.weekStart);
		const endDate = new Date(weeklyData.weekEnd);
		return `(${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Weekly Orders</CardTitle>
						<CardDescription>
							Daily order count for {formatWeekDisplay()}, {currentYear}
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={goToPreviousWeek}
							disabled={!canGoBack}
							className="px-2"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={goToNextWeek}
							disabled={!canGoForward}
							className="px-2"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex h-[300px] items-center justify-center">
						<LoadingSpinner className="h-8 w-8" />
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
								width={1}
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
