import { redirect } from "next/navigation";
import ForgotPasswordForm from "~/components/auth/forgot-password-form";
import ResetPasswordPage from "~/components/auth/reset-password-form";
import { auth } from "~/server/auth";

export default async function ForgotPasswordPage() {
	const session = await auth();
	if (session) {
		redirect("/");
	}

	return (
		<div className="flex min-h-[calc(100vh-65px)] w-full items-center justify-center p-6 md:p-10">
			<div className="-mt-20 w-full max-w-sm">
				<ResetPasswordPage />
			</div>
		</div>
	);
}
