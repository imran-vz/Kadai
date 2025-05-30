"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useCart } from "~/lib/store/cart";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { LoadingSpinner } from "../ui/loading-spinner";
import { formatCurrency } from "~/lib/utils";
import { useWatch } from "react-hook-form";

const checkoutSchema = z.object({
	customerName: z.string().min(1, "Customer name is required"),
	deliveryCost: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
	const { items, total: subtotal, clear } = useCart();
	const createOrder = api.orders.create.useMutation({
		onSuccess: () => {
			toast.success("Order created successfully");
			clear();
			onOpenChange(false);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const form = useForm<CheckoutFormData>({
		resolver: zodResolver(checkoutSchema),
		defaultValues: {
			customerName: "",
			deliveryCost: "",
		},
	});

	const deliveryCost = Number.parseFloat(
		useWatch({ control: form.control, name: "deliveryCost" }) || "0",
	);
	const total = subtotal + deliveryCost;

	const onSubmit = (data: CheckoutFormData) => {
		const orderItems = items.map((item) => ({
			itemId: item.id,
			quantity: item.quantity,
		}));

		createOrder.mutate({
			customerName: data.customerName,
			deliveryCost: Number.parseFloat(data.deliveryCost || "0"),
			items: orderItems,
			total,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Checkout</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4 py-4"
					>
						<FormField
							control={form.control}
							name="customerName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Customer Name</FormLabel>
									<FormControl>
										<Input placeholder="John Doe" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="deliveryCost"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Delivery Cost (Optional)</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="0"
											step="0.01"
											placeholder="0.00"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="space-y-2 rounded-lg border p-4">
							<div className="flex justify-between text-sm">
								<span>Subtotal</span>
								<span>{formatCurrency(subtotal)}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span>Delivery</span>
								<span>{formatCurrency(deliveryCost)}</span>
							</div>
							<div className="flex justify-between border-t pt-2 font-medium">
								<span>Total</span>
								<span>{formatCurrency(total)}</span>
							</div>
						</div>

						<DialogFooter>
							<Button
								type="submit"
								className="w-full"
								disabled={createOrder.isPending}
							>
								{createOrder.isPending ? (
									<LoadingSpinner className="h-4 w-4" />
								) : (
									`Pay ${formatCurrency(total)}`
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
