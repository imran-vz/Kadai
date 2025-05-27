import { redirect } from "next/navigation";
import { ResetPasswordForm } from "~/components/auth/reset-password-form";
import { auth } from "~/server/auth";

export default async function ResetPasswordPage() {
	const session = await auth();
	if (session) {
		redirect("/");
	}

	return (
		<div className="flex min-h-[calc(100vh-65px)] w-full items-center justify-center p-6 md:p-10">
			<div className="-mt-20 w-full max-w-sm">
				<ResetPasswordForm />
			</div>
		</div>
	);
}
