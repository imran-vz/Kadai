"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function NotFound() {
	return (
		<div className="flex min-h-[calc(100vh-155px)] flex-col items-center justify-center gap-4 text-center">
			<svg
				className="h-24 w-24 text-primary"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={1.5}
			>
				<title>Magnifying glass</title>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
				/>
			</svg>
			<h2 className="font-bold text-2xl">Page Not Found</h2>
			<p className="text-muted-foreground">
				The page you're looking for doesn't exist or has been moved.
			</p>
			<div className="flex gap-4">
				<Button asChild>
					<Link href="/">Go home</Link>
				</Button>
				<Button
					variant="outline"
					onClick={() => {
						window.history.back();
					}}
				>
					Go back
				</Button>
			</div>
		</div>
	);
}
