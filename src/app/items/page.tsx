import { api } from "~/trpc/server";
import ItemsPage from "./client";

export default function page() {
	void api.items.getAll.prefetch();

	return <ItemsPage />;
}
