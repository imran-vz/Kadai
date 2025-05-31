import { auth } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";
import OrdersPage from "./client";
import { redirect } from "next/navigation";

export default async function page() {
	const session = await auth();

	if (!session) {
		redirect("/login");
	}

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
