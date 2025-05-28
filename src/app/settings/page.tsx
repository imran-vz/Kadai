import { redirect } from "next/navigation";
import { SettingsForm } from "~/components/settings/settings-form";
import { auth } from "~/server/auth";

export default async function SettingsPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<div className="container mx-auto flex min-h-[calc(100vh-65px)] w-full flex-col items-center p-6 md:p-10">
			<h1 className="mb-8 font-bold text-2xl">Settings</h1>
			<div className="w-full max-w-2xl">
				<SettingsForm />
			</div>
		</div>
	);
}
