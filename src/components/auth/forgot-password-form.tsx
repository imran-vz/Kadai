"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GalleryVerticalEnd, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { forgotPassword } from "~/actions/password-reset";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const forgotPasswordSchema = z.object({
	email: z.string().email(),
});

export function ForgotPasswordForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const [isLoading, setIsLoading] = useState(false);
	const form = useForm<z.infer<typeof forgotPasswordSchema>>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
		setIsLoading(true);
		const formData = new FormData();
		formData.append("email", data.email);

		try {
			const result = await forgotPassword(formData);
			if (result.error) {
				toast.error(result.error);
				return;
			}
			toast.success("Password reset instructions sent to your email");
			form.reset();
		} catch (error) {
			console.error(error);
			toast.error("Something went wrong");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="flex flex-col gap-6">
						<div className="flex flex-col items-center gap-2">
							<Link
								href="/"
								className="flex flex-col items-center gap-2 font-medium"
							>
								<div className="flex h-8 w-8 items-center justify-center rounded-lg">
									<GalleryVerticalEnd className="size-6" />
								</div>
								<span className="sr-only">Kadai</span>
							</Link>
							<h1 className="font-bold text-xl">Reset your password</h1>
							<div className="text-center text-sm">
								Enter your email address and we&apos;ll send you instructions to
								reset your password.
							</div>
						</div>
						<div className="flex flex-col gap-6">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												id="email"
												type="email"
												placeholder="me@example.com"
												required
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									"Send reset instructions"
								)}
							</Button>

							<div className="text-center text-sm">
								Remember your password?{" "}
								<Link href="/login" className="underline underline-offset-4">
									Login
								</Link>
							</div>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
}
