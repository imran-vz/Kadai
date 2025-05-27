export const Footer = () => {
	return (
		<footer className="w-full bg-primary-foreground/20 py-6">
			<div className="px-4 sm:px-0">
				<div className="mx-auto flex max-w-7xl items-center justify-between rounded-lg border border-primary/10 p-4 px-4">
					<p className="text-primary">Kadai.</p>
					<nav className="flex gap-6">
						<a
							href="/privacy"
							className="text-primary/60 transition-colors hover:text-primary"
						>
							Privacy
						</a>
						<a
							href="/terms"
							className="text-primary/60 transition-colors hover:text-primary"
						>
							Terms
						</a>
						<a
							href="/contact"
							className="text-primary/60 transition-colors hover:text-primary"
						>
							Contact
						</a>
					</nav>
				</div>
			</div>
		</footer>
	);
};
