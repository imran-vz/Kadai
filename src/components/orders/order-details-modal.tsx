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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { useState, useEffect } from "react";

interface OrderDetailsModalProps {
	order: typeof orders.$inferSelect;
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
	onOpenChange,
}: OrderDetailsModalProps) {
	const { data: orderDetails, isLoading } = api.orders.getOrderDetails.useQuery(
		{ orderId: order.id },
		{ enabled: !!order.id },
	);

	const [status, setStatus] = useState(order.status);
	const utils = api.useUtils();
	const { mutate: updateStatus, isPending: isUpdating } =
		api.orders.updateStatus.useMutation({
			onSuccess: () => {
				void utils.orders.getOrderDetails.invalidate({ orderId: order.id });
				void utils.orders.getAll.invalidate();
			},
		});

	const [viewportHeight, setViewportHeight] = useState(0);

	// Update viewport height when keyboard opens/closes
	useEffect(() => {
		const updateViewportHeight = () => {
			setViewportHeight(window.visualViewport?.height || window.innerHeight);
		};

		// Initial height
		updateViewportHeight();

		// Add listeners for both visualViewport and resize
		window.visualViewport?.addEventListener("resize", updateViewportHeight);
		window.addEventListener("resize", updateViewportHeight);

		return () => {
			window.visualViewport?.removeEventListener(
				"resize",
				updateViewportHeight,
			);
			window.removeEventListener("resize", updateViewportHeight);
		};
	}, []);

	return (
		<Dialog open={!!order.id} onOpenChange={onOpenChange}>
			<DialogContent
				className="max-h-[90vh] max-w-[90vw] overflow-hidden"
				style={{
					position: "fixed",
					top: Math.max(20, (viewportHeight - 600) / 2), // Adjust 600 based on your modal's typical height
					transform: "translateX(-50%)",
					height: "auto",
					maxHeight: Math.min(600, viewportHeight - 40), // Leave 20px padding top and bottom
				}}
			>
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
							<div className="flex items-center gap-2">
								<Select
									value={status}
									onValueChange={(value) =>
										setStatus(value as typeof order.status)
									}
								>
									<SelectTrigger className="w-[140px]">
										<SelectValue placeholder="Update status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="processing">Processing</SelectItem>
										<SelectItem value="completed">Completed</SelectItem>
										<SelectItem value="cancelled">Cancelled</SelectItem>
									</SelectContent>
								</Select>
								<Button
									variant="secondary"
									size="sm"
									onClick={() => updateStatus({ orderId: order.id, status })}
									disabled={status === order.status || isUpdating}
									className="relative"
									aria-label="Save status"
									aria-live="polite"
									aria-busy={isUpdating}
								>
									<LoadingSpinner
										className={cn(
											"-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-4 w-4 animate-spin",
											isUpdating ? "opacity-100" : "opacity-0",
										)}
									/>
									<span className={cn("text-sm", isUpdating && "opacity-0")}>
										Save
									</span>
								</Button>
							</div>
						</div>
						<div>
							<p className="font-medium text-sm">Order Date</p>
							<p className="text-gray-500 text-sm">
								{new Date(order.createdAt).toLocaleDateString("en-IN")}
							</p>
						</div>
						<div>
							<p className="font-medium text-sm">Total</p>
							<p className="text-gray-500 text-sm">
								{Number(order.total).toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
									style: "currency",
									currency: "INR",
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
															style: "currency",
															currency: "INR",
														})}
													</TableCell>
													<TableCell>
														{(item.price * item.quantity).toLocaleString(
															"en-US",
															{
																minimumFractionDigits: 2,
																maximumFractionDigits: 2,
																style: "currency",
																currency: "INR",
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
