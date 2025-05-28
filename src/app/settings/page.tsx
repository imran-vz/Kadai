import { redirect } from "next/navigation";
import { SettingsForm } from "~/components/settings/settings-form";
import { auth } from "~/server/auth";
import { ChangePasswordForm } from "~/components/settings/change-password-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default async function SettingsPage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	return (
		<div className="container mx-auto flex min-h-[calc(100vh-65px)] w-full flex-col items-center py-6 md:py-10">
			<h1 className="mb-8 font-bold text-2xl">Settings</h1>
			<div className="w-full max-w-2xl space-y-6">
				<Card className="bg-transparent">
					<CardHeader>
						<CardTitle>Company Information</CardTitle>
					</CardHeader>
					<CardContent>
						<SettingsForm />
					</CardContent>
				</Card>

				<Card className="bg-transparent">
					<CardHeader>
						<CardTitle>Change Password</CardTitle>
					</CardHeader>
					<CardContent>
						<ChangePasswordForm />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
