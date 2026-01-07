"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ImageIcon, Trash2, Upload } from "lucide-react";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { ImageCropModal } from "~/components/ui/image-crop-modal";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { LoadingSpinner } from "../ui/loading-spinner";

const settingsFormSchema = z.object({
	companyName: z.string().min(1, "Company name is required"),
	companyAddress: z.string().min(1, "Company address is required"),
	gstNumber: z.string().optional(),
	gstEnabled: z.boolean(),
	gstRate: z.number().min(0).max(100),
});

export function SettingsForm() {
	const [user, { refetch }] = api.user.me.useSuspenseQuery();
	const [profilePreview, setProfilePreview] = useState<string | null>(
		user.image || null,
	);
	const [logoPreview, setLogoPreview] = useState<string | null>(
		user.companyLogo || null,
	);
	const updateCompany = api.company.update.useMutation();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [cropType, setCropType] = useState<"profile" | "logo" | null>(null);
	const form = useForm<z.infer<typeof settingsFormSchema>>({
		resolver: zodResolver(settingsFormSchema),
		defaultValues: {
			companyName: user.companyName ?? "",
			companyAddress: user.companyAddress ?? "",
			gstNumber: user.gstNumber ?? "",
			gstEnabled: user.gstEnabled ?? false,
			gstRate: Number(user.gstRate) ?? 18,
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
			} else {
				setLogoPreview(data.url);
			}
			void refetch();
			toast.success(data.message);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const deleteImage = api.user.deleteImage.useMutation({
		onSuccess: (message, type) => {
			toast.success(message);
			if (type === "profile") {
				setProfilePreview(null);
			} else {
				setLogoPreview(null);
			}
			void refetch();
		},
		onError: () => {
			toast.error("Failed to delete image");
		},
	});

	const handleImageUpload = async (blob: Blob, type: "profile" | "logo") => {
		const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
		uploadMutation.mutate({ file, type });
		setSelectedFile(null);
		setCropType(null);
	};

	const handleFileSelect = (file: File, type: "profile" | "logo") => {
		setSelectedFile(file);
		setCropType(type);
	};

	const handleDeleteImage = (type: "profile" | "logo") => {
		if (type === "profile") {
			setProfilePreview(null);
			const input = document.getElementById("image") as HTMLInputElement;
			if (input) input.value = "";
		} else {
			setLogoPreview(null);
			const input = document.getElementById("companyLogo") as HTMLInputElement;
			if (input) input.value = "";
		}
		deleteImage.mutate(type);
	};

	const onSubmit = async (data: z.infer<typeof settingsFormSchema>) => {
		try {
			await updateCompany.mutateAsync(
				{
					companyName: data.companyName,
					companyAddress: data.companyAddress,
					gstNumber: data.gstNumber,
					gstEnabled: data.gstEnabled,
					gstRate: data.gstRate,
				},
				{
					onError(error) {
						console.error(error);
						toast.error("Something went wrong");
					},
					onSuccess() {
						toast.success("Settings updated successfully");
						void refetch();
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
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
					{/* Profile Image Upload */}
					<div>
						<FormLabel className="sm:block sm:w-full sm:text-center">
							Profile Image
						</FormLabel>
						<div className="flex flex-col items-center gap-4">
							<div className="group relative h-32 w-32">
								<div className="relative h-full w-full overflow-hidden rounded-full bg-muted">
									{profilePreview ? (
										<Image
											src={profilePreview}
											alt="Profile"
											fill
											className="object-cover transition-opacity group-hover:opacity-50"
										/>
									) : (
										<ImageIcon
											className={cn(
												"-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-12 w-12 transform text-muted-foreground",
												uploadMutation.isPending &&
													uploadMutation.variables?.type === "profile" &&
													"opacity-50",
											)}
										/>
									)}

									<div className="absolute inset-0 flex items-center justify-center gap-2">
										{uploadMutation.isPending &&
										uploadMutation.variables?.type === "profile" ? (
											<div className="inset-0 flex h-full flex-1 items-center justify-center bg-primary/30">
												<LoadingSpinner className="h-8 w-8 text-white" />
											</div>
										) : (
											<>
												<Button
													type="button"
													variant="destructive"
													size="icon"
													className={cn(
														"sm:invisible sm:group-hover:visible",
														!profilePreview && "hidden",
													)}
													onClick={() => handleDeleteImage("profile")}
												>
													<Trash2 className="size-4" />
												</Button>
												<Button
													type="button"
													variant="outline"
													size="icon"
													className="sm:invisible sm:group-hover:visible"
													onClick={() =>
														document.getElementById("image")?.click()
													}
													disabled={uploadMutation.isPending}
												>
													<Upload className="h-4 w-4" />
												</Button>
											</>
										)}
									</div>
								</div>
								<Input
									type="file"
									accept="image/*"
									className="hidden"
									id="image"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) handleFileSelect(file, "profile");
									}}
								/>
							</div>
						</div>
					</div>

					{/* Company Logo Upload */}
					<div>
						<FormLabel className="sm:block sm:w-full sm:text-center">
							Company Logo
						</FormLabel>
						<div className="flex flex-col items-center gap-4">
							<div className="group relative h-32 w-32">
								<div className="relative h-full w-full overflow-hidden rounded-full bg-muted">
									{logoPreview ? (
										<Image
											src={logoPreview}
											alt="Company Logo"
											fill
											className="object-cover transition-opacity group-hover:opacity-50"
										/>
									) : (
										<ImageIcon
											className={cn(
												"-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-12 w-12 transform text-muted-foreground",
												uploadMutation.isPending &&
													uploadMutation.variables?.type === "logo" &&
													"opacity-50",
											)}
										/>
									)}

									<div className="absolute inset-0 flex items-center justify-center gap-2">
										{uploadMutation.isPending &&
										uploadMutation.variables?.type === "logo" ? (
											<div className="inset-0 flex h-full flex-1 items-center justify-center bg-primary/30">
												<LoadingSpinner className="h-8 w-8 text-white" />
											</div>
										) : (
											<>
												<Button
													type="button"
													variant="destructive"
													size="icon"
													className={cn(
														"sm:invisible sm:group-hover:visible",
														!logoPreview && "hidden",
													)}
													onClick={() => handleDeleteImage("logo")}
												>
													<Trash2 className="size-4" />
												</Button>
												<Button
													type="button"
													variant="outline"
													size="icon"
													className="sm:invisible sm:group-hover:visible"
													onClick={() =>
														document.getElementById("companyLogo")?.click()
													}
													disabled={uploadMutation.isPending}
												>
													<Upload className="h-4 w-4" />
												</Button>
											</>
										)}
									</div>
								</div>
								<Input
									type="file"
									accept="image/*"
									className="hidden"
									id="companyLogo"
									onChange={(e) => {
										const file = e.target.files?.[0];
										if (file) handleFileSelect(file, "logo");
									}}
								/>
							</div>
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

					<FormField
						control={form.control}
						name="gstEnabled"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
								<div className="space-y-0.5">
									<FormLabel className="text-base">GST Enabled</FormLabel>
									<FormDescription>
										Enable GST calculation for your orders
									</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="gstNumber"
						render={({ field }) => (
							<FormItem>
								<FormLabel>GST Number</FormLabel>
								<FormControl>
									<Input placeholder="Enter your GST number" {...field} />
								</FormControl>
								<FormDescription>
									Your GST registration number for tax purposes
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="gstRate"
						render={({ field }) => (
							<FormItem>
								<FormLabel>GST Rate (%)</FormLabel>
								<FormControl>
									<Input
										type="number"
										min={0}
										max={100}
										step={0.01}
										placeholder="Enter GST rate"
										{...field}
										onChange={(e) => field.onChange(Number(e.target.value))}
									/>
								</FormControl>
								<FormDescription>
									Tax rate to apply on orders (e.g. 18 for 18% GST)
								</FormDescription>
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

			<ImageCropModal
				file={selectedFile}
				onComplete={(blob) => {
					if (cropType) handleImageUpload(blob, cropType);
				}}
				onCancel={() => {
					setSelectedFile(null);
					setCropType(null);
				}}
			/>
		</Form>
	);
}
