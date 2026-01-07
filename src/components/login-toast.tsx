"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "~/lib/auth-client";

export const LoginToast = () => {
	const session = useSession();
	const searchParams = useSearchParams();
	const router = useRouter();

	useEffect(() => {
		const welcome = searchParams.get("welcome");
		if (session.data && welcome) {
			toast.success(`Welcome back, ${session.data.user?.name}!`);
			router.replace("/");
		}
	}, [session.data, searchParams, router]);

	if (!session.data) return null;

	return null;
};
