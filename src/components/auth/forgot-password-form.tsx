"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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

const forgotPasswordSchema = z.object({
	email: z.string().email(),
});

export default function ForgotPasswordForm() {
	const forgotPassword = api.auth.forgotPassword.useMutation({
		onSuccess: () => {
			toast.success(
				"If an account exists, you'll receive a reset link shortly.",
			);
			form.reset();
		},
		onError: () => {
			toast.error("Something went wrong. Please try again.");
		},
	});

	const form = useForm<z.infer<typeof forgotPasswordSchema>>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
		forgotPassword.mutate(values);
	}

	return (
		<div className="mx-auto max-w-[350px] space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="font-bold text-2xl">Forgot Password</h1>
				<p className="text-gray-500">
					Enter your email address and we'll send you a link to reset your
					password.
				</p>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input placeholder="john@example.com" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						type="submit"
						className="w-full"
						disabled={forgotPassword.isPending}
					>
						{forgotPassword.isPending ? (
							<LoadingSpinner className="h-4 w-4" />
						) : (
							"Send Reset Link"
						)}
					</Button>
				</form>
			</Form>
		</div>
	);
}
