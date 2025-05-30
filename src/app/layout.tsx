import "~/styles/globals.css";

import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";

import { Footer } from "~/components/footer/footer";
import { LoginToast } from "~/components/login-toast";
import { Navbar } from "~/components/navbar/navbar";
import { Toaster } from "~/components/ui/sonner";
import { auth } from "~/server/auth";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	title: "Kadai",
	description: "A simple no-bullshit Kadai",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
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
						<>
							<Navbar />
							<div className="min-h-svh bg-gradient-to-b bg-primary-foreground/20 px-4 pt-[4.5rem] text-primary">
								{children}
							</div>
							<Toaster richColors position="top-center" />
							<Footer />
							<LoginToast />
							<SpeedInsights />
						</>
					</SessionProvider>
				</TRPCReactProvider>
			</body>
		</html>
	);
}
