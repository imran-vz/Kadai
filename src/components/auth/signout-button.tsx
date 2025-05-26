export function SignOutButton() {
	return (
		<form method="GET" action="/api/auth/signout">
			<button type="submit">Sign Out</button>
		</form>
	);
}
