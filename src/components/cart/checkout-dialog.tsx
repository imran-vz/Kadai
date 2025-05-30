"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
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
import { formatCurrency } from "~/lib/utils";
import { api } from "~/trpc/react";
import { LoadingSpinner } from "../ui/loading-spinner";

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
	const cart = useCart();
	const [user] = api.user.me.useSuspenseQuery();
	const createOrder = api.orders.create.useMutation();

	const subtotal = cart.items.reduce((acc, item) => {
		return acc + Number.parseFloat(item.price) * item.quantity;
	}, 0);

	const gstRate = Number(user.gstRate) / 100;
	const tax = user.gstEnabled ? subtotal * gstRate : 0;
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
	const total = subtotal + tax + deliveryCost;

	const onSubmit = async (data: z.infer<typeof checkoutSchema>) => {
		try {
			await createOrder.mutateAsync({
				customerName: data.customerName,
				items: cart.items.map((item) => ({
					id: item.id,
					quantity: item.quantity,
				})),
				total,
				tax,
				taxRate: user.gstEnabled ? Number(user.gstRate) : 0,
				deliveryCost: data.deliveryCost
					? Number.parseFloat(data.deliveryCost)
					: undefined,
			});

			cart.clear();
			onOpenChange(false);
			toast.success("Order placed successfully!");
		} catch (error) {
			console.error(error);
			toast.error("Failed to place order");
		}
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

							{user.gstEnabled && (
								<div className="flex justify-between text-sm">
									<span>GST ({user.gstRate}%)</span>
									<span>{formatCurrency(tax)}</span>
								</div>
							)}

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
									"Place Order"
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
