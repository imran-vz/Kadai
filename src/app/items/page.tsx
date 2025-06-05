import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";
import ItemsPage from "./client";

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
