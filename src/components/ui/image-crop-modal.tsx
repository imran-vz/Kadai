"use client";

import { useState } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "./button";
import { LoadingSpinner } from "./loading-spinner";

interface ImageCropModalProps {
	file: File | null;
	aspect?: number;
	onComplete: (croppedBlob: Blob) => void;
	onCancel: () => void;
}

export function ImageCropModal({
	file,
	aspect = 1,
	onComplete,
	onCancel,
}: ImageCropModalProps) {
	const [crop, setCrop] = useState<Crop>({
		unit: "px",
		width: 256,
		height: 256,
		x: 0,
		y: 0,
	});
	const [imgSrc, setImgSrc] = useState<string>("");
	const [loading, setLoading] = useState(false);
	const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

	const resetState = () => {
		setImgSrc("");
		setImageRef(null);
		setCrop({
			unit: "px",
			width: 256,
			height: 256,
			x: 0,
			y: 0,
		});
	};

	const handleCancel = () => {
		resetState();
		onCancel();
	};

	const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
		const { width, height } = e.currentTarget;

		// Calculate the size for a square crop
		const smallestSide = Math.min(width, height);
		const cropSize = Math.min(smallestSide, 512); // Don't exceed max size
		const cropWidthInPercent = (cropSize / width) * 100;
		const cropHeightInPercent = (cropSize / height) * 100;

		const newCrop: Crop = {
			unit: "%",
			width: cropWidthInPercent,
			height: cropHeightInPercent,
			x: (100 - cropWidthInPercent) / 2,
			y: (100 - cropHeightInPercent) / 2,
		};

		setCrop(newCrop);
		setImageRef(e.currentTarget);
	};

	const createCroppedImage = async () => {
		if (!imageRef || !crop) return;

		setLoading(true);
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			throw new Error("No 2d context");
		}

		// Set the canvas size to our desired output size
		canvas.width = 256;
		canvas.height = 256;

		// Calculate the actual pixel values from percentages
		const scaleX = imageRef.naturalWidth / 100;
		const scaleY = imageRef.naturalHeight / 100;

		const sourceX = crop.x * scaleX;
		const sourceY = crop.y * scaleY;
		const sourceWidth = crop.width * scaleX;
		const sourceHeight = crop.height * scaleY;

		// Enable high-quality scaling
		ctx.imageSmoothingQuality = "high";

		// Draw the cropped image to the canvas
		ctx.drawImage(
			imageRef,
			sourceX,
			sourceY,
			sourceWidth,
			sourceHeight,
			0,
			0,
			256,
			256,
		);

		canvas.toBlob(
			(blob) => {
				if (!blob) {
					throw new Error("Failed to create blob");
				}
				onComplete(blob);
				setLoading(false);
				resetState();
			},
			"image/jpeg",
			0.9,
		);
	};

	if (!file) return null;

	if (!imgSrc) {
		const reader = new FileReader();
		reader.addEventListener("load", () => {
			setImgSrc(reader.result?.toString() || "");
		});
		reader.readAsDataURL(file);
		return null;
	}

	return (
		<Dialog open onOpenChange={handleCancel}>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>Crop Image</DialogTitle>
				</DialogHeader>
				<div className="flex justify-center overflow-hidden rounded-lg">
					<ReactCrop
						crop={crop}
						onChange={(_, percentCrop) => setCrop(percentCrop)}
						aspect={aspect}
						minWidth={256}
						minHeight={256}
						maxHeight={512}
						maxWidth={512}
						ruleOfThirds
					>
						<img
							src={imgSrc}
							alt="Crop me"
							onLoad={onImageLoad}
							className="max-h-[60vh]"
						/>
					</ReactCrop>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
					<Button onClick={createCroppedImage} disabled={loading}>
						{loading ? <LoadingSpinner className="h-4 w-4" /> : "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
