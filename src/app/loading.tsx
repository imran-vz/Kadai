import { LoadingSpinner } from "~/components/ui/loading-spinner";

export default function Loading() {
	return (
		<div className="flex min-h-[calc(100vh-155px)] items-center justify-center">
			<LoadingSpinner className="h-12 w-12 animate-spin text-primary" />
		</div>
	);
}
