"use client";

import { authClient } from "~/lib/auth-client";

export function SignOutButton() {
	const handleSignOut = async () => {
		await authClient.signOut();
		window.location.href = "/login";
	};

	return (
		<button type="button" onClick={handleSignOut}>
			Sign Out
		</button>
	);
}
