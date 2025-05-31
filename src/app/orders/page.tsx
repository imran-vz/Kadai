import { HydrateClient, api } from "~/trpc/server";
import OrdersPage from "./client";

export default function page() {
	void api.orders.getAll.prefetch({
		limit: 10,
		cursor: "0",
	});

	return (
		<HydrateClient>
			<OrdersPage />
		</HydrateClient>
	);
}
