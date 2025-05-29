import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Item } from "~/server/db/schema";

interface CartItem extends Item {
	quantity: number;
}

interface CartStore {
	items: CartItem[];
	addItem: (item: Item) => void;
	removeItem: (id: string) => void;
	updateQuantity: (id: string, quantity: number) => void;
	total: number;
	clear: () => void;
}

export const useCart = create<CartStore>()(
	persist(
		(set, get) => ({
			items: [],
			addItem: (item) => {
				const items = get().items;
				const existingItem = items.find((i) => i.id === item.id);

				if (existingItem) {
					set({
						items: items.map((i) =>
							i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
						),
					});
				} else {
					set({ items: [...items, { ...item, quantity: 1 }] });
				}
			},
			removeItem: (id) => {
				set({ items: get().items.filter((i) => i.id !== id) });
			},
			updateQuantity: (id, quantity) => {
				if (quantity < 1) return;
				set({
					items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
				});
			},
			total: get().items.reduce(
				(acc, item) => acc + Number(item.price) * item.quantity,
				0,
			),
			clear: () => set({ items: [] }),
		}),
		{
			name: "cart-storage",
		},
	),
);
