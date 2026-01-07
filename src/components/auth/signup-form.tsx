"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { authClient } from "~/lib/auth-client";
import { SignInWithGoogle } from "./signin-button";

const signupSchema = z.object({
	email: z.string().email(),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(80, "Password must be less than 80 characters"),
	name: z.string().min(1, "Name is required"),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<SignupValues>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
	});

	const onSubmit = async (data: SignupValues) => {
		setIsLoading(true);
		try {
			const result = await authClient.signUp.email({
				email: data.email,
				password: data.password,
				name: data.name,
			});

			if (result.error) {
				toast.error(result.error.message || "Failed to create account");
				return;
			}

			toast.success("Account created successfully");
			router.push("/login");
		} catch (error) {
			console.error(error);
			toast.error("Something went wrong");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="flex flex-col gap-6">
						<div className="flex flex-col items-center gap-2">
							<Link
								href="#"
								className="flex flex-col items-center gap-2 font-medium"
							>
								<div className="flex h-8 w-8 items-center justify-center rounded-lg">
									<GalleryVerticalEnd className="size-6" />
								</div>
								<span className="sr-only">Kadai</span>
							</Link>
							<h1 className="font-bold text-xl">Create an account</h1>
							<div className="text-center text-sm">
								Already have an account?{" "}
								<Link href="/login" className="underline underline-offset-4">
									Login
								</Link>
							</div>
						</div>

						<div className="flex flex-col gap-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input placeholder="John Doe" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="me@example.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													type={showPassword ? "text" : "password"}
													placeholder="********"
													{...field}
												/>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="-translate-y-1/2 absolute top-1/2 right-2"
													onClick={() => setShowPassword(!showPassword)}
												>
													{showPassword ? (
														<EyeOff className="size-4" />
													) : (
														<Eye className="size-4" />
													)}
												</Button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Button type="submit" disabled={isLoading}>
							{isLoading ? (
								<LoadingSpinner className="size-4" />
							) : (
								"Create account"
							)}
						</Button>
					</div>
				</form>
			</Form>

			<div className="relative border-primary text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-primary/50 after:border-t" />

			<SignInWithGoogle />
		</div>
	);
}
