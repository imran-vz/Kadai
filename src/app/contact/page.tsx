export default function ContactPage() {
	return (
		<div className="mx-auto max-w-3xl px-4 py-12">
			<h1 className="mb-8 text-3xl font-bold">Contact Us</h1>

			<div className="prose prose-slate max-w-none">
				<p>Have questions or need assistance? You can reach us at:</p>

				<div className="mt-6">
					<h2 className="text-xl font-semibold">Email</h2>
					<p>support@kadai.com</p>
				</div>

				<div className="mt-6">
					<h2 className="text-xl font-semibold">Business Hours</h2>
					<p>Monday - Friday: 9:00 AM - 5:00 PM (GMT)</p>
				</div>

				<div className="mt-6">
					<p className="text-sm text-gray-600">
						We typically respond to all inquiries within 24-48 business hours.
					</p>
				</div>
			</div>
		</div>
	);
}
