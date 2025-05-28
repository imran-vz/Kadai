import { api } from "~/trpc/server";
import OrdersPage from "./client";

export default function page() {
	void api.orders.getAll.prefetch();

	return <OrdersPage />;
}
