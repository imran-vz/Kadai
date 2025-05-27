"use client";

import { useEffect, useState } from "react";

export function useMobileModal() {
	const [viewportHeight, setViewportHeight] = useState(0);

	useEffect(() => {
		const updateViewportHeight = () => {
			setViewportHeight(window.visualViewport?.height || window.innerHeight);
		};

		updateViewportHeight();

		window.visualViewport?.addEventListener("resize", updateViewportHeight);
		window.addEventListener("resize", updateViewportHeight);

		return () => {
			window.visualViewport?.removeEventListener(
				"resize",
				updateViewportHeight,
			);
			window.removeEventListener("resize", updateViewportHeight);
		};
	}, []);

	const modalStyle = {
		position: "fixed",
		top: Math.max(200, (viewportHeight - 300) / 2),
		left: "50%",
		translate: "-50% -50%",
		height: "auto",
		maxHeight: Math.min(600, viewportHeight - 40),
	} as const;

	return { modalStyle };
}
