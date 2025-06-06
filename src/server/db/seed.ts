import "dotenv/config";
import "../../env.js";

import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { items, orderItems, orders, type Order } from "./schema";

// Helper function to generate random date within the past 15 days
function getRandomDateInPast15Days(): Date {
	const now = new Date();
	const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
	return faker.date.between({ from: fifteenDaysAgo, to: now });
}

type OrderStatus = Order["status"];

// Helper function to generate random order status with realistic distribution
function getRandomOrderStatus(): OrderStatus {
	const statuses: OrderStatus[] = [
		"completed",
		"completed",
		"completed",
		"completed",
		"completed", // 50% completed
		"pending",
		"pending", // 20% pending
		"processing",
		"processing", // 20% processing
		"cancelled", // 10% cancelled
	];
	return faker.helpers.arrayElement(statuses);
}

async function main() {
	// Clear existing data
	await db.delete(orderItems);
	await db.delete(orders);
	await db.delete(items);
	const testUserId = "pxl3kvpuxoewqsx1oolsfugd"; // Replace this with a real user ID

	// Generate random products using faker (Indian Rupee pricing)
	const productCategories = [
		{ category: "Electronics", priceRange: [5000, 200000] },
		{ category: "Clothing", priceRange: [500, 15000] },
		{ category: "Home & Kitchen", priceRange: [1000, 50000] },
		{ category: "Books", priceRange: [200, 2000] },
		{ category: "Sports", priceRange: [1500, 25000] },
		{ category: "Beauty", priceRange: [300, 8000] },
	];

	const numberOfProducts = faker.number.int({ min: 20, max: 40 });
	const itemsData = [];

	for (let i = 0; i < numberOfProducts; i++) {
		const category = faker.helpers.arrayElement(productCategories);
		const price = faker.number.float({
			min: category.priceRange[0],
			max: category.priceRange[1],
			fractionDigits: 2,
		});

		itemsData.push({
			name: faker.commerce.productName(),
			description: faker.commerce.productDescription(),
			price: price.toFixed(2),
			image: `https://picsum.photos/600/400?random=${i}`,
			userId: testUserId,
		});
	}

	const itemsDataWithIds = await db.insert(items).values(itemsData).returning();

	// Generate random number of orders (15-45 orders over 15 days)
	const numberOfOrders = faker.number.int({ min: 15, max: 45 });
	const ordersData = [];

	for (let i = 0; i < numberOfOrders; i++) {
		const orderDate = getRandomDateInPast15Days();
		const status = getRandomOrderStatus();

		ordersData.push({
			userId: testUserId,
			status,
			total: "0.00", // Will be calculated after order items are added
			createdAt: orderDate,
			updatedAt: orderDate,
			customerName: faker.person.fullName(),
			deliveryCost: faker.number
				.float({ min: 50, max: 500, fractionDigits: 2 })
				.toFixed(2),
			tax: "0.00", // Will be calculated
			taxRate: faker.helpers.arrayElement(["0.00", "18.00"]),
		});
	}

	// Sort orders by creation date for better visualization
	ordersData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

	const ordersDataWithIds = await db
		.insert(orders)
		.values(ordersData)
		.returning();

	for (const order of ordersDataWithIds) {
		// Generate random number of items per order (1-4 items)
		const numberOfItems = faker.number.int({ min: 1, max: 4 });
		const selectedItems = faker.helpers.arrayElements(
			itemsDataWithIds,
			numberOfItems,
		);

		const orderItemsData = selectedItems.map((item) => ({
			orderId: order.id,
			itemId: item.id,
			quantity: faker.number.int({ min: 1, max: 3 }),
		}));

		await db.insert(orderItems).values(orderItemsData);

		// Calculate totals
		let subtotal = 0;
		for (const orderItem of orderItemsData) {
			const item = itemsDataWithIds.find((i) => i.id === orderItem.itemId);
			if (item) {
				subtotal += Number.parseFloat(item.price) * orderItem.quantity;
			}
		}

		const taxRate = Number.parseFloat(order.taxRate || "0");
		const tax = (subtotal * taxRate) / 100;
		const deliveryCost = Number.parseFloat(order.deliveryCost || "0");
		const total = subtotal + deliveryCost + tax;

		await db
			.update(orders)
			.set({
				total: total.toFixed(2),
				tax: tax.toFixed(2),
			})
			.where(eq(orders.id, order.id));
	}

	console.log(
		`Seed completed successfully! Generated ${numberOfOrders} orders over the past 15 days.`,
	);
	process.exit(0);
}

main().catch((err) => {
	console.error("Error seeding database:", err);
	process.exit(1);
});
