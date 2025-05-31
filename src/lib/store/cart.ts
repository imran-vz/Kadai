import type { InferSelectModel } from "drizzle-orm";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { items } from "~/server/db/schema";

export type Item = InferSelectModel<typeof items>;

interface CartItem extends Item {
	quantity: number;
}

interface CartState {
	items: CartItem[];
	total: number;
}

interface CartActions {
	addItem: (item: Item) => void;
	removeItem: (id: string) => void;
	updateQuantity: (id: string, quantity: number) => void;
	clear: () => void;
}

type CartStore = CartState & CartActions;

export const useCart = create<CartStore>()(
	persist(
		(set, get) => ({
			items: [],
			total: 0,
			addItem: (item: Item) => {
				const items = get().items;
				const existingItem = items.find((i) => i.id === item.id);

				const newItems = existingItem
					? items.map((i) =>
							i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
						)
					: [...items, { ...item, quantity: 1 }];

				set({
					items: newItems,
					total: newItems.reduce(
						(acc, item) => acc + Number.parseFloat(item.price) * item.quantity,
						0,
					),
				});
			},
			removeItem: (id: string) => {
				const newItems = get().items.filter((i) => i.id !== id);
				set({
					items: newItems,
					total: newItems.reduce(
						(acc, item) => acc + Number.parseFloat(item.price) * item.quantity,
						0,
					),
				});
			},
			updateQuantity: (id: string, quantity: number) => {
				if (quantity < 1) return;
				const newItems = get().items.map((i) =>
					i.id === id ? { ...i, quantity } : i,
				);
				set({
					items: newItems,
					total: newItems.reduce(
						(acc, item) => acc + Number.parseFloat(item.price) * item.quantity,
						0,
					),
				});
			},
			clear: () => set({ items: [], total: 0 }),
		}),
		{
			name: "cart-storage",
		},
	),
);
