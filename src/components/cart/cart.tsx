"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useCart } from "~/lib/store/cart";
import { formatCurrency } from "~/lib/utils";
import { CheckoutModal } from "./checkout-modal";
import { api } from "~/trpc/react";

export function Cart() {
	const cart = useCart();
	const [checkoutOpen, setCheckoutOpen] = useState(false);
	const [user] = api.user.me.useSuspenseQuery();

	const subtotal = cart.items.reduce((acc, item) => {
		return acc + Number.parseFloat(item.price) * item.quantity;
	}, 0);

	const gstRate = Number(user.gstRate) / 100;
	const gstAmount = user.gstEnabled ? subtotal * gstRate : 0;
	const total = subtotal + gstAmount;

	return (
		<>
			<div className="flex h-full flex-col">
				<div className="flex items-center justify-between border-b px-4 py-3">
					<h2 className="font-semibold text-lg">Cart</h2>
					<span className="text-muted-foreground">
						{cart.items.length} {cart.items.length === 1 ? "item" : "items"}
					</span>
				</div>

				<ScrollArea className="flex-1 p-4">
					<div className="flex flex-col gap-4">
						{cart.items.map((item) => (
							<div
								key={item.id}
								className="flex items-center justify-between gap-4"
							>
								<div className="flex flex-col">
									<span className="font-medium">{item.name}</span>
									<span className="text-muted-foreground text-sm">
										{formatCurrency(Number.parseFloat(item.price))}
									</span>
								</div>

								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="icon"
										className="h-8 w-8"
										onClick={() =>
											cart.updateQuantity(item.id, item.quantity - 1)
										}
										disabled={item.quantity <= 1}
									>
										<Minus className="h-4 w-4" />
									</Button>
									<span className="w-8 text-center">{item.quantity}</span>
									<Button
										variant="outline"
										size="icon"
										className="h-8 w-8"
										onClick={() =>
											cart.updateQuantity(item.id, item.quantity + 1)
										}
									>
										<Plus className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-destructive"
										onClick={() => cart.removeItem(item.id)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				</ScrollArea>

				<div className="mt-auto space-y-4 border-t p-4">
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span>Subtotal</span>
							<span>₹{subtotal.toFixed(2)}</span>
						</div>

						{user.gstEnabled && (
							<div className="flex justify-between text-sm">
								<span>GST ({user.gstRate}%)</span>
								<span>₹{gstAmount.toFixed(2)}</span>
							</div>
						)}

						<div className="flex justify-between font-medium">
							<span>Total</span>
							<span>₹{total.toFixed(2)}</span>
						</div>
					</div>

					<Button
						className="w-full"
						size="lg"
						disabled={cart.items.length === 0}
						onClick={() => setCheckoutOpen(true)}
					>
						Checkout
					</Button>
				</div>
			</div>

			<CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
		</>
	);
}
