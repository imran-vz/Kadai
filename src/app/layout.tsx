import "~/styles/globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Footer } from "~/components/footer/footer";
import { LoginToast } from "~/components/login-toast";
import { Navbar } from "~/components/navbar/navbar";
import { AppSidebar } from "~/components/sidebar/app-sidebar";
import { SiteHeader } from "~/components/sidebar/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Toaster } from "~/components/ui/sonner";
import { getSession } from "~/server/auth";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	title: "Kadai",
	description: "A simple no-bullshit Kadai",
	icons: [
		{
			rel: "icon",
			url: "/favicon.svg",
			type: "image/svg+xml",
			color: "#000000",
		},
	],
};

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

export default async function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await getSession();

	return (
		<html lang="en" className={`${inter.variable}`}>
			<body className="bg-primary">
				<TRPCReactProvider>
					{session ? (
						<SidebarProvider
							style={
								{
									"--sidebar-width": "calc(var(--spacing) * 72)",
									"--header-height": "calc(var(--spacing) * 12)",
								} as React.CSSProperties
							}
						>
							<AppSidebar variant="inset" />
							<SidebarInset>
								<div className="flex w-full flex-1 flex-col rounded-lg bg-primary-foreground/20">
									<SiteHeader />
									<div className="flex flex-1 flex-col overflow-y-auto sm:max-h-[calc(100svh-64px)]">
										<div className="flex-1 px-4 text-primary">{children}</div>
									</div>
									<Toaster richColors position="top-center" />
									<LoginToast />
									<SpeedInsights />
									<Analytics />
								</div>
							</SidebarInset>
						</SidebarProvider>
					) : (
						<div className="bg-white">
							<div className="flex h-screen">
								<div className="flex flex-1 flex-col">
									<Navbar />
									<div className="flex-1 bg-linear-to-b bg-primary-foreground/20 px-4 pt-18 text-primary">
										{children}
									</div>
									<Footer />
								</div>
								<Toaster richColors position="top-center" />
								<LoginToast />
								<SpeedInsights />
								<Analytics />
							</div>
						</div>
					)}
				</TRPCReactProvider>
			</body>
		</html>
	);
}
