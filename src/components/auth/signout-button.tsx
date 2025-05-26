import { signOutAction } from "@/actions/sign-out";

export function SignOutButton() {
	return (
		<form action={signOutAction}>
			<button type="submit">Sign Out</button>
		</form>
	);
}
