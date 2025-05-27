import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { columns } from "~/components/orders/columns";
import { DataTable } from "~/components/orders/data-table";
import { auth } from "~/server/auth";

export default async function OrdersPage() {
	const session = await auth();
	if (!session) {
		redirect("/api/auth/signin");
	}

	const orders = await api.orders.getAll();

	return (
		<div className="container py-10">
			<h1 className="mb-8 font-bold text-3xl">Orders</h1>
			<DataTable columns={columns} data={orders} />
		</div>
	);
}
