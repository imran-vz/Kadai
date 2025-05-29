"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
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
import { useSession } from "next-auth/react";
import { LoadingSpinner } from "../ui/loading-spinner";
import { cn } from "~/lib/utils";

const settingsSchema = z.object({
	companyName: z.string().min(1, "Company name is required"),
	companyAddress: z.string().min(1, "Company address is required"),
});

export function SettingsForm() {
	const { data: sessionData, update } = useSession();
	const [profilePreview, setProfilePreview] = useState<string | null>(
		sessionData?.user.image || null,
	);
	const [logoPreview, setLogoPreview] = useState<string | null>(
		sessionData?.user.companyLogo || null,
	);
	const updateCompany = api.company.update.useMutation();

	const form = useForm<z.infer<typeof settingsSchema>>({
		resolver: zodResolver(settingsSchema),
		defaultValues: {
			companyName: sessionData?.user.companyName || "",
			companyAddress: sessionData?.user.companyAddress || "",
		},
	});

	const uploadMutation = useMutation({
		mutationFn: async ({
			file,
			type,
		}: {
			file: File;
			type: "profile" | "logo";
		}) => {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("type", type);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(error);
			}

			return response.json();
		},
		onSuccess: (data, variables) => {
			if (variables.type === "profile") {
				setProfilePreview(data.url);
				update({
					user: {
						...(sessionData ? sessionData.user : {}),
						image: data.url,
					},
				});
			} else {
				setLogoPreview(data.url);
				update({
					user: {
						...(sessionData ? sessionData.user : {}),
						companyLogo: data.url,
					},
				});
			}
			toast.success(data.message);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleImageUpload = async (file: File, type: "profile" | "logo") => {
		if (!file) return;
		uploadMutation.mutate({ file, type });
	};

	const onSubmit = async (data: z.infer<typeof settingsSchema>) => {
		try {
			await updateCompany.mutateAsync(
				{
					companyName: data.companyName,
					companyAddress: data.companyAddress,
				},
				{
					onError(error) {
						console.error(error);
						toast.error("Something went wrong");
					},
					onSuccess() {
						toast.success("Settings updated successfully");
						update({
							user: {
								...(sessionData ? sessionData.user : {}),
								companyName: data.companyName,
								companyAddress: data.companyAddress,
							},
						});
					},
				},
			);
		} catch (error) {
			console.error(error);
			toast.error("Something went wrong");
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
					{/* Profile Image Upload */}
					<div>
						<FormLabel>Profile Image</FormLabel>
						<div className="flex flex-col items-center gap-4">
							<div className="relative h-32 w-32 overflow-hidden rounded-full bg-muted">
								{profilePreview ? (
									<Image
										src={profilePreview}
										alt="Profile"
										fill
										className="object-cover"
									/>
								) : (
									<ImageIcon className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-12 w-12 transform text-muted-foreground" />
								)}
							</div>
							<Input
								type="file"
								accept="image/*"
								className="hidden"
								id="image"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) handleImageUpload(file, "profile");
								}}
							/>
							<Button
								type="button"
								variant="outline"
								onClick={() => document.getElementById("image")?.click()}
								disabled={uploadMutation.isPending}
							>
								{uploadMutation.isPending &&
								uploadMutation.variables?.type === "profile" ? (
									<LoadingSpinner className="h-4 w-4" />
								) : (
									<Upload className="h-4 w-4" />
								)}
								Upload Image
							</Button>
						</div>
					</div>

					{/* Company Logo Upload */}
					<div>
						<FormLabel>Company Logo</FormLabel>
						<div className="flex flex-col items-center gap-4">
							<div className="relative h-32 w-32 overflow-hidden rounded-lg bg-muted">
								{logoPreview ? (
									<Image
										src={logoPreview}
										alt="Company Logo"
										fill
										className="object-contain"
									/>
								) : (
									<ImageIcon className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-12 w-12 transform text-muted-foreground" />
								)}
							</div>
							<Input
								type="file"
								accept="image/*"
								className="hidden"
								id="companyLogo"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) handleImageUpload(file, "logo");
								}}
							/>
							<Button
								type="button"
								variant="outline"
								onClick={() => document.getElementById("companyLogo")?.click()}
								disabled={uploadMutation.isPending}
							>
								{uploadMutation.isPending &&
								uploadMutation.variables?.type === "logo" ? (
									<LoadingSpinner className="h-4 w-4" />
								) : (
									<Upload className="h-4 w-4" />
								)}
								Upload Logo
							</Button>
						</div>
					</div>
				</div>

				{/* Company Details */}
				<div className="space-y-4">
					<FormField
						control={form.control}
						name="companyName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Company Name</FormLabel>
								<FormControl>
									<Input placeholder="Acme Inc." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="companyAddress"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Company Address</FormLabel>
								<FormControl>
									<Input placeholder="123 Main St, City, Country" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Button
					type="submit"
					className="relative"
					disabled={updateCompany.isPending}
				>
					{updateCompany.isPending ? (
						<LoadingSpinner className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-4 w-4" />
					) : null}
					<span className={cn(updateCompany.isPending && "invisible")}>
						Save Changes
					</span>
				</Button>
			</form>
		</Form>
	);
}
