import "dotenv/config";
import "../../env.js";

import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { items, orderItems, orders } from "./schema";

async function main() {
	// Clear existing data
	await db.delete(orderItems);
	await db.delete(orders);
	await db.delete(items);
	const testUserId = "pxl3kvpuxoewqsx1oolsfugd"; // Replace this with a real user ID

	// Seed items
	const itemsData = [
		{
			name: "Gaming Laptop",
			description: "High-performance gaming laptop with RTX 4080",
			price: "1999.99",
			image: "https://placehold.co/600x400",
			userId: testUserId,
		},
		{
			name: "Mechanical Keyboard",
			description: "RGB mechanical keyboard with Cherry MX switches",
			price: "149.99",
			image: "https://placehold.co/600x400",
			userId: testUserId,
		},
		{
			name: "Wireless Mouse",
			description: "Ultra-lightweight wireless gaming mouse",
			price: "79.99",
			image: "https://placehold.co/600x400",
			userId: testUserId,
		},
		{
			name: "4K Monitor",
			description: "32-inch 4K HDR gaming monitor",
			price: "699.99",
			image: "https://placehold.co/600x400",
			userId: testUserId,
		},
		{
			name: "Gaming Headset",
			description: "Wireless gaming headset with surround sound",
			price: "199.99",
			image: "https://placehold.co/600x400",
			userId: testUserId,
		},
	];

	const itemsDataWithIds = await db.insert(items).values(itemsData).returning();

	// Get a test user ID (replace with an actual user ID from your database)

	// Seed orders
	const ordersData = [
		{
			userId: testUserId,
			status: "completed" as const,
			total: "2149.98", // Gaming Laptop + Headset
			createdAt: new Date("2024-01-15T10:00:00Z"),
			updatedAt: new Date("2024-01-15T10:00:00Z"),
			customerName: "John Doe",
			deliveryCost: "10",
			tax: "18",
			taxRate: "18",
		},
		{
			userId: testUserId,
			status: "processing" as const,
			total: "229.98", // Mouse + Keyboard
			createdAt: new Date("2024-02-01T15:30:00Z"),
			updatedAt: new Date("2024-02-01T15:30:00Z"),
			customerName: "John Doe",
			deliveryCost: "10",
			tax: "18",
			taxRate: "18",
		},
		{
			userId: testUserId,
			status: "pending" as const,
			total: "699.99", // 4K Monitor
			createdAt: new Date("2024-02-15T09:15:00Z"),
			updatedAt: new Date("2024-02-15T09:15:00Z"),
			customerName: "John Doe",
			deliveryCost: "10",
			tax: "18",
			taxRate: "18",
		},
		{
			userId: testUserId,
			status: "cancelled" as const,
			total: "149.99", // Mechanical Keyboard
			createdAt: new Date("2024-03-01T12:45:00Z"),
			updatedAt: new Date("2024-03-01T12:45:00Z"),
			customerName: "John Doe",
			deliveryCost: "10",
			tax: "18",
			taxRate: "18",
		},
		{
			userId: testUserId,
			status: "completed" as const,
			total: "199.99", // Gaming Laptop
			createdAt: new Date("2024-03-15T14:30:00Z"),
			updatedAt: new Date("2024-03-15T14:30:00Z"),
			customerName: "John Doe",
			deliveryCost: "10",
			tax: "18",
			taxRate: "18",
		},
		{
			userId: testUserId,
			status: "pending" as const,
			total: "149.99", // Mechanical Keyboard
			createdAt: new Date("2024-03-15T14:30:00Z"),
			updatedAt: new Date("2024-03-15T14:30:00Z"),
			customerName: "John Doe",
			deliveryCost: "10",
			tax: "18",
			taxRate: "18",
		},
		{
			userId: testUserId,
			status: "cancelled" as const,
			total: "149.99", // Mechanical Keyboard
			createdAt: new Date("2024-03-15T14:30:00Z"),
			updatedAt: new Date("2024-03-15T14:30:00Z"),
			customerName: "John Doe",
			deliveryCost: "10",
			tax: "18",
			taxRate: "18",
		},
		{
			userId: testUserId,
			status: "completed" as const,
			total: "199.99", // Gaming Laptop
			createdAt: new Date("2024-03-15T14:30:00Z"),
			updatedAt: new Date("2024-03-15T14:30:00Z"),
			customerName: "John Doe",
			deliveryCost: "10",
			tax: "18",
			taxRate: "18",
		},
		{
			userId: testUserId,
			status: "pending" as const,
			total: "149.99", // Mechanical Keyboard
			createdAt: new Date("2024-03-15T14:30:00Z"),
			updatedAt: new Date("2024-03-15T14:30:00Z"),
			customerName: "John Doe",
			deliveryCost: "10",
			tax: "18",
			taxRate: "18",
		},
		{
			userId: testUserId,
			status: "completed" as const,
			total: "199.99", // Gaming Laptop
			createdAt: new Date("2024-03-15T14:30:00Z"),
			updatedAt: new Date("2024-03-15T14:30:00Z"),
			customerName: "John Doe",
			deliveryCost: "10",
			tax: "18",
			taxRate: "18",
		},
		{
			userId: testUserId,
			status: "completed" as const,
			total: "199.99", // Gaming Laptop
			createdAt: new Date("2024-03-15T14:30:00Z"),
			updatedAt: new Date("2024-03-15T14:30:00Z"),
			customerName: "John Doe",
			deliveryCost: "10",
			tax: "18",
			taxRate: "18",
		},
	];

	const ordersDataWithIds = await db
		.insert(orders)
		.values(ordersData)
		.returning();

	for (const order of ordersDataWithIds) {
		const index = Math.floor(Math.random() * itemsDataWithIds.length);
		const randomItem1 = itemsDataWithIds[index];
		const randomItem2 =
			itemsDataWithIds.at(index + 1) || itemsDataWithIds.at(index - 1);
		const randomItem3 =
			itemsDataWithIds.at(index + 2) || itemsDataWithIds.at(index - 2);

		const orderItemsData = [
			{
				orderId: order.id,
				itemId: randomItem1?.id || "",
				quantity: 1,
			},
			{
				orderId: order.id,
				itemId: randomItem2?.id || "",
				quantity: 1,
			},
			{
				orderId: order.id,
				itemId: randomItem3?.id || "",
				quantity: 1,
			},
		];

		await db.insert(orderItems).values(orderItemsData);
		const subtotal =
			Number.parseFloat(randomItem1?.price || "0") +
			Number.parseFloat(randomItem2?.price || "0") +
			Number.parseFloat(randomItem3?.price || "0");
		const tax = (subtotal * Number.parseFloat(order.taxRate || "0")) / 100;
		const total = subtotal + Number.parseFloat(order.deliveryCost || "0") + tax;

		await db
			.update(orders)
			.set({
				total: total.toFixed(2),
				tax: tax.toFixed(2),
				taxRate: order.taxRate,
				deliveryCost: order.deliveryCost,
			})
			.where(eq(orders.id, order.id));
	}

	console.log("Seed completed successfully!");
	process.exit(0);
}

main().catch((err) => {
	console.error("Error seeding database:", err);
	process.exit(1);
});
