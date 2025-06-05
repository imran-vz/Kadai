"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";

interface OrderChartProps {
	data: { date: string; count: number }[];
	title: string;
	description: string;
}

export function OrderChart({ data, title, description }: OrderChartProps) {
	if (!data.length) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex h-[300px] items-center justify-center text-muted-foreground">
						No data available
					</div>
				</CardContent>
			</Card>
		);
	}

	// Format data for the chart and reverse to show oldest to newest
	const chartData = data.reverse().map((item) => ({
		date: new Date(item.date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		}),
		count: item.count,
		fullDate: item.date,
	}));

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart
						data={chartData}
						margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey="date"
							tick={{ fontSize: 12 }}
							angle={-45}
							textAnchor="end"
							height={60}
						/>
						<YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
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
							formatter={(value: number) => [value, "Orders"]}
						/>
						<Bar
							dataKey="count"
							fill="hsl(var(--primary))"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
