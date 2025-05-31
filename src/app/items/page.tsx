import { HydrateClient, api } from "~/trpc/server";
import ItemsPage from "./client";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function page() {
	const session = await auth();

	if (!session) {
		redirect("/login");
	}

	void api.items.getAll.prefetch();

	return (
		<HydrateClient>
			<ItemsPage />
		</HydrateClient>
	);
}
