"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import { api } from "~/trpc/react";
import { useState } from "react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { cn } from "~/lib/utils";

const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export function ChangePasswordForm() {
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const changePassword = api.user.changePassword.useMutation({
		onSuccess: () => {
			toast.success("Password changed successfully");
			form.reset();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const form = useForm<z.infer<typeof changePasswordSchema>>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const onSubmit = (data: z.infer<typeof changePasswordSchema>) => {
		changePassword.mutate({
			currentPassword: data.currentPassword,
			newPassword: data.newPassword,
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="currentPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Current Password</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										type={showCurrentPassword ? "text" : "password"}
										autoComplete="current-password"
										{...field}
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
										onClick={() => setShowCurrentPassword((prev) => !prev)}
									>
										{showCurrentPassword ? (
											<Eye className="h-4 w-4" />
										) : (
											<EyeOff className="h-4 w-4" />
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
					name="newPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>New Password</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										type={showNewPassword ? "text" : "password"}
										autoComplete="new-password"
										{...field}
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
										onClick={() => setShowNewPassword((prev) => !prev)}
									>
										{showNewPassword ? (
											<Eye className="h-4 w-4" />
										) : (
											<EyeOff className="h-4 w-4" />
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
							<FormLabel>Confirm New Password</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										type={showConfirmPassword ? "text" : "password"}
										autoComplete="new-password"
										{...field}
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
										onClick={() => setShowConfirmPassword((prev) => !prev)}
									>
										{showConfirmPassword ? (
											<Eye className="h-4 w-4" />
										) : (
											<EyeOff className="h-4 w-4" />
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
					className="relative"
					disabled={changePassword.isPending}
				>
					{changePassword.isPending ? (
						<LoadingSpinner className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-4 w-4" />
					) : null}
					<span className={cn(changePassword.isPending && "invisible")}>
						Change Password
					</span>
				</Button>
			</form>
		</Form>
	);
}
