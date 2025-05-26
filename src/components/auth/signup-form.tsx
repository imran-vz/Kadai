"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { signUp } from "../../actions/sign-up";
import {
	Form,
	FormControl,
	FormField,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { SignInWithGoogle } from "./signin-button";
import { useRouter } from "next/navigation";

const passwordRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const signupSchema = z.object({
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
	name: z.string().min(1).max(50),
});

export function SignupForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const router = useRouter();
	const form = useForm<z.infer<typeof signupSchema>>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof signupSchema>) => {
		console.log(data);
		try {
			const formData = new FormData();
			formData.append("email", data.email);
			formData.append("password", data.password);
			formData.append("name", data.name);
			await signUp(formData);
			router.push("/login");
		} catch (error) {
			console.error(error);
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
								<div className="flex h-8 w-8 items-center justify-center rounded-xs">
									<GalleryVerticalEnd className="size-6" />
								</div>
								<span className="sr-only">Cocoa Comaa</span>
							</Link>
							<h1 className="text-xl font-bold">Create your account</h1>
							<div className="text-center text-sm">
								Already have an account?{" "}
								<Link href="/login" className="underline underline-offset-4">
									Login
								</Link>
							</div>
						</div>
						<div className="flex flex-col gap-6">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<div className="grid gap-2">
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input
												id="name"
												type="text"
												placeholder="John Doe"
												required
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</div>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<div className="grid gap-2">
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												id="email"
												type="email"
												placeholder="John Doe"
												required
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</div>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<div className="grid gap-2">
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												id="password"
												type="password"
												required
												placeholder="••••••••"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</div>
								)}
							/>

							<Button type="submit" className="w-full">
								Sign up
							</Button>
						</div>
						<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
							<span className="relative z-10 bg-background px-2 text-muted-foreground">
								Or
							</span>
						</div>
					</div>
				</form>
			</Form>

			<div className="grid gap-4 sm:grid-cols-2">
				<SignInWithGoogle />
			</div>
		</div>
	);
}
