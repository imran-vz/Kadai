"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { api } from "~/trpc/react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const resetPasswordSchema = z
	.object({
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export default function ResetPasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const resetPassword = api.auth.resetPassword.useMutation({
		onSuccess: () => {
			toast.success("Password reset successful");
			router.push("/login");
		},
		onError: (error) => {
			toast.error(error.message || "Something went wrong. Please try again.");
		},
	});

	const form = useForm<z.infer<typeof resetPasswordSchema>>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	if (!token) {
		return (
			<div className="text-center">
				<h1 className="font-bold text-2xl">Invalid Reset Link</h1>
				<p className="text-gray-500">
					This password reset link is invalid or has expired.
				</p>
			</div>
		);
	}

	function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
		resetPassword.mutate({
			token: token as string,
			password: values.password,
		});
	}

	return (
		<div className="mx-auto max-w-[350px] space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="font-bold text-2xl">Reset Password</h1>
				<p className="text-gray-500">Enter your new password below.</p>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>New Password</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											type={showPassword ? "text" : "password"}
											{...field}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute top-0 right-0 h-full px-3"
											onClick={() => setShowPassword(!showPassword)}
										>
											{showPassword ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</Button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Confirm Password</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											type={showConfirmPassword ? "text" : "password"}
											{...field}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute top-0 right-0 h-full px-3"
											onClick={() =>
												setShowConfirmPassword(!showConfirmPassword)
											}
										>
											{showConfirmPassword ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</Button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						type="submit"
						className="w-full"
						disabled={resetPassword.isPending}
					>
						{resetPassword.isPending ? (
							<LoadingSpinner className="h-4 w-4" />
						) : (
							"Reset Password"
						)}
					</Button>
				</form>
			</Form>
		</div>
	);
}
