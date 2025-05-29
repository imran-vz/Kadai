"use client";

import { Component, type ReactNode } from "react";
import { Button } from "./ui/button";

interface Props {
	children: ReactNode;
}

interface State {
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { error };
	}

	componentDidCatch(error: Error) {
		console.error("Error caught by error boundary:", error);
	}

	render() {
		if (this.state.error) {
			return (
				<div className="flex min-h-[calc(100vh-155px)] flex-col items-center justify-center gap-4 text-center">
					<svg
						className="h-24 w-24 text-primary"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={1.5}
					>
						<title>Warning</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
						/>
					</svg>
					<h2 className="font-bold text-2xl">Something went wrong!</h2>
					<p className="text-muted-foreground">
						{this.state.error.message || "An unexpected error occurred"}
					</p>
					<div className="flex gap-4">
						<Button type="button" onClick={() => window.location.reload()}>
							Try again
						</Button>

						<Button
							type="button"
							variant="outline"
							onClick={() => {
								window.location.href = "/";
							}}
						>
							Go home
						</Button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
