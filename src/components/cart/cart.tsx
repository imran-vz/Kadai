"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { useCart } from "~/lib/store/cart";
import { formatCurrency } from "~/lib/utils";
import { ScrollArea } from "~/components/ui/scroll-area";
import { CheckoutDialog } from "./checkout-dialog";

export function Cart() {
	const { items, removeItem, updateQuantity, total } = useCart();
	const [checkoutOpen, setCheckoutOpen] = useState(false);

	return (
		<>
			<div className="flex h-full flex-col">
				<div className="flex items-center justify-between border-b px-4 py-3">
					<h2 className="font-semibold text-lg">Cart</h2>
					<span className="text-muted-foreground">
						{items.length} {items.length === 1 ? "item" : "items"}
					</span>
				</div>

				<ScrollArea className="flex-1 p-4">
					<div className="flex flex-col gap-4">
						{items.map((item) => (
							<div
								key={item.id}
								className="flex items-center justify-between gap-4"
							>
								<div className="flex flex-col">
									<span className="font-medium">{item.name}</span>
									<span className="text-muted-foreground text-sm">
										{formatCurrency(Number(item.price))}
									</span>
								</div>

								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="icon"
										className="h-8 w-8"
										onClick={() => updateQuantity(item.id, item.quantity - 1)}
										disabled={item.quantity <= 1}
									>
										<Minus className="h-4 w-4" />
									</Button>
									<span className="w-8 text-center">{item.quantity}</span>
									<Button
										variant="outline"
										size="icon"
										className="h-8 w-8"
										onClick={() => updateQuantity(item.id, item.quantity + 1)}
									>
										<Plus className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-destructive"
										onClick={() => removeItem(item.id)}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				</ScrollArea>

				<div className="border-t p-4">
					<div className="flex items-center justify-between py-2">
						<span className="font-semibold">Total</span>
						<span className="font-semibold">{formatCurrency(total)}</span>
					</div>
					<Button
						className="w-full"
						size="lg"
						disabled={items.length === 0}
						onClick={() => setCheckoutOpen(true)}
					>
						Checkout
					</Button>
				</div>
			</div>

			<CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
		</>
	);
}
