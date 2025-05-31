import "~/styles/globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";

import { Footer } from "~/components/footer/footer";
import { LoginToast } from "~/components/login-toast";
import { Navbar } from "~/components/navbar/navbar";
import { AppSidebar } from "~/components/sidebar/app-sidebar";
import { SiteHeader } from "~/components/sidebar/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Toaster } from "~/components/ui/sonner";
import { auth } from "~/server/auth";
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
	const session = await auth();

	return (
		<html lang="en" className={`${inter.variable}`}>
			<body>
				<TRPCReactProvider>
					<SessionProvider session={session}>
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
								<SidebarInset className="bg-primary-foreground/20">
									<SiteHeader />
									<div className="flex flex-1 flex-col">
										<div className="flex-1 px-4 text-primary">{children}</div>
									</div>
									<Toaster richColors position="top-center" />
									<LoginToast />
									<SpeedInsights />
									<Analytics />
								</SidebarInset>
							</SidebarProvider>
						) : (
							<div className="flex h-screen">
								<div className="flex flex-1 flex-col">
									<Navbar />
									<div className="flex-1 bg-gradient-to-b bg-primary-foreground/20 px-4 pt-[4.5rem] text-primary">
										{children}
									</div>
									<Footer />
								</div>
								<Toaster richColors position="top-center" />
								<LoginToast />
								<SpeedInsights />
								<Analytics />
							</div>
						)}
					</SessionProvider>
				</TRPCReactProvider>
			</body>
		</html>
	);
}
