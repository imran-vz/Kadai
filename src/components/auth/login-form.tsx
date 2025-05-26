"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, GalleryVerticalEnd, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { signInWithCredentials } from "~/actions/sign-in";
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
import { SignInWithGoogle } from "./signin-button";

const passwordRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const loginSchema = z.object({
	email: z.string().email(),
	password: z
		.string()
		.min(8)
		.max(30)
		.superRefine((val, ctx) => {
			if (val.length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Password is required",
				});
			}

			if (!passwordRegex.test(val)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						"Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter and one special character",
				});
			}
		}),
});

export function LoginForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [fieldType, setFieldType] = useState<"text" | "password">("password");
	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof loginSchema>) => {
		setIsLoading(true);
		const formData = new FormData();
		formData.append("email", data.email);
		formData.append("password", data.password);
		try {
			const result = await signInWithCredentials(formData);
			console.log(" :75 | onSubmit | result:", result);
			if (result) {
				console.error(result);
				toast.error(result);
				return;
			}

			router.push("/");
		} catch (error) {
			console.error(error);
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
								href="#"
								className="flex flex-col items-center gap-2 font-medium"
							>
								<div className="flex h-8 w-8 items-center justify-center rounded-lg">
									<GalleryVerticalEnd className="size-6" />
								</div>
								<span className="sr-only">Kadai</span>
							</Link>
							<h1 className="font-bold text-xl">Welcome to Kadai</h1>
							<div className="text-center text-sm">
								Don&apos;t have an account?{" "}
								<Link href="/signup" className="underline underline-offset-4">
									Sign up
								</Link>
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
												required
												placeholder="me@example.com"
												autoComplete="email"
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
													id="password"
													required
													placeholder="********"
													autoComplete="current-password"
													type={fieldType}
													{...field}
												/>
												<Button
													variant="ghost"
													size="icon"
													className="-translate-y-1/2 absolute top-1/2 right-2"
													type="button"
													onClick={() =>
														setFieldType(
															fieldType === "text" ? "password" : "text",
														)
													}
												>
													{fieldType === "text" ? <Eye /> : <EyeOff />}
												</Button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="text-sm">
								<Link
									href="/forgot-password"
									className="underline underline-offset-4"
								>
									Forgot password?
								</Link>
							</div>

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									"Login"
								)}
							</Button>
						</div>
						<div className="relative border-primary text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-primary/50 after:border-t" />
					</div>
				</form>
			</Form>

			<div>
				<SignInWithGoogle />
			</div>
		</div>
	);
}
