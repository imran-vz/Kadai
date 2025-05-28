import { SignupForm } from "~/components/auth/signup-form";

export default function SignupPage() {
	return (
		<div className="flex min-h-[calc(100vh-65px)] w-full items-center justify-center p-6 md:p-10">
			<div className="-mt-20 w-full max-w-sm">
				<SignupForm />
			</div>
		</div>
	);
}
