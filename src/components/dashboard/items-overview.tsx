import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatCurrency } from "~/lib/utils";
import { api } from "~/trpc/server";

export async function ItemsOverview() {
	try {
		const items = await api.items.getAll();

		if (!items) {
			return null;
		}

		const totalItems = items.length;

		return (
			<Card>
				<CardHeader>
					<CardTitle>Items Overview</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex justify-center">
						<div className="text-center">
							<div className="font-bold text-2xl">{totalItems}</div>
							<p className="text-muted-foreground text-xs">Total Items</p>
						</div>
					</div>

					{totalItems > 0 && (
						<div className="mt-6">
							<h4 className="mb-3 font-medium text-sm">Recent Items</h4>
							<div className="space-y-2">
								{items.slice(0, 5).map((item) => (
									<div
										key={item.id}
										className="flex items-center justify-between py-1"
									>
										<span className="flex-1 truncate text-sm">{item.name}</span>
										<span className="font-medium text-sm">
											{formatCurrency(Number.parseFloat(item.price))}
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		);
	} catch (error) {
		if (error) {
			return (
				<div className="py-8 text-center text-red-500">
					Error loading items:{" "}
					{error instanceof Error ? error.message : "Unknown error"}
				</div>
			);
		}
	}
}
