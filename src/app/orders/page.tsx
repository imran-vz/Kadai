import { api, HydrateClient } from "~/trpc/server";
import OrdersPage from "./client";

export default function page() {
	void api.orders.getAll.prefetch();

	return (
		<HydrateClient>
			<OrdersPage />
		</HydrateClient>
	);
}
