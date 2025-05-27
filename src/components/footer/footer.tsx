export const Footer = () => {
	return (
		<footer className="w-full bg-primary-foreground/20 py-6">
			<div className="px-4 sm:px-0">
				<div className="mx-auto flex max-w-7xl items-center justify-between rounded-lg border border-primary/10 p-4 px-4">
					<p className="text-gray-600">Kadai.</p>
					<nav className="flex gap-6">
						<a
							href="/privacy"
							className="text-gray-500 transition-colors hover:text-gray-900"
						>
							Privacy
						</a>
						<a
							href="/terms"
							className="text-gray-500 transition-colors hover:text-gray-900"
						>
							Terms
						</a>
						<a
							href="/contact"
							className="text-gray-500 transition-colors hover:text-gray-900"
						>
							Contact
						</a>
					</nav>
				</div>
			</div>
		</footer>
	);
};
