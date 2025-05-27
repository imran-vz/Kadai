"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
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
	onOpenChange: (open: boolean) => void;
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

	return (
		<Dialog open={!!order.id} onOpenChange={onOpenChange}>
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
