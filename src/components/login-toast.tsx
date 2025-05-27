"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export const LoginToast = () => {
	const { data: session } = useSession();
	const searchParams = useSearchParams();
	const router = useRouter();
	if (!session) return null;

	useEffect(() => {
		const welcome = searchParams.get("welcome");
		if (session && welcome) {
			toast.success(`Welcome back, ${session.user?.name}!`);
			router.push("/");
		}
	}, [session, searchParams, router]);

	return null;
};
