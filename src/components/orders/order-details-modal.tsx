"use client";

import { Badge } from "~/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import type { OrderItem } from "~/server/api/routers/orders";
import type { orders } from "~/server/db/schema";
import { api } from "~/trpc/react";
import { LoadingSpinner } from "../ui/loading-spinner";

interface OrderDetailsModalProps {
	order: typeof orders.$inferSelect;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const statusStyles = {
	pending:
		"bg-yellow-100 hover:bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
	processing:
		"bg-blue-100 hover:bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
	completed:
		"bg-green-100 hover:bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
	cancelled:
		"bg-red-100 hover:bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
} as const;

function StatusBadge({ status }: { status: keyof typeof statusStyles }) {
	return (
		<Badge
			variant="secondary"
			className={cn("capitalize", statusStyles[status])}
		>
			{status}
		</Badge>
	);
}

export function OrderDetailsModal({
	order,
	open,
	onOpenChange,
}: OrderDetailsModalProps) {
	const { data: orderDetails, isLoading } = api.orders.getOrderDetails.useQuery(
		{ orderId: order.id },
		{ enabled: open },
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-[90vw] overflow-hidden">
				<DialogHeader>
					<DialogTitle>Order Details</DialogTitle>
				</DialogHeader>

				<div className="mt-4 space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="font-medium text-sm">Customer Name</p>
							<p className="text-gray-500 text-sm">{order.customerName}</p>
						</div>
						<div>
							<p className="font-medium text-sm">Status</p>
							<StatusBadge status={order.status} />
						</div>
						<div>
							<p className="font-medium text-sm">Order Date</p>
							<p className="text-gray-500 text-sm">
								{new Date(order.createdAt).toLocaleDateString()}
							</p>
						</div>
						<div>
							<p className="font-medium text-sm">Total</p>
							<p className="text-gray-500 text-sm">
								{Number(order.total).toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</p>
						</div>
					</div>

					<div>
						<h3 className="mb-2 font-medium text-sm">Order Items</h3>
						{isLoading ? (
							<div className="flex justify-center py-4">
								<LoadingSpinner className="h-6 w-6 animate-spin text-primary" />
							</div>
						) : (
							<div className="grid max-h-[70vh] grid-cols-1 overflow-auto">
								<div className="w-full min-w-full overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="w-[40%]">Item</TableHead>
												<TableHead className="w-[20%]">Quantity</TableHead>
												<TableHead className="w-[20%]">Price</TableHead>
												<TableHead className="w-[20%]">Total</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{orderDetails?.items.map((item: OrderItem) => (
												<TableRow key={item.itemId}>
													<TableCell>{item.name}</TableCell>
													<TableCell>{item.quantity}</TableCell>
													<TableCell>
														{item.price.toLocaleString("en-US", {
															minimumFractionDigits: 2,
															maximumFractionDigits: 2,
														})}
													</TableCell>
													<TableCell>
														{(item.price * item.quantity).toLocaleString(
															"en-US",
															{
																minimumFractionDigits: 2,
																maximumFractionDigits: 2,
															},
														)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
