"use client";

import {
	IconDashboard,
	IconFileWord,
	IconFolder,
	IconHelp,
	IconInnerShadowTop,
	IconListDetails,
	IconMail,
	IconShoppingCart,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import type * as React from "react";

import { NavMain } from "~/components/sidebar/nav-main";
import { NavSecondary } from "~/components/sidebar/nav-secondary";
import { NavUser } from "~/components/sidebar/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "~/components/ui/sidebar";

const data = {
	navMain: [
		{
			title: "Dashboard",
			url: "/",
			icon: IconDashboard,
		},
		{
			title: "Shop",
			url: "/shop",
			icon: IconShoppingCart,
		},
		{
			title: "Items",
			url: "/items",
			icon: IconListDetails,
		},
		{
			title: "Orders",
			url: "/orders",
			icon: IconFolder,
		},
	],
	navSecondary: [
		{
			title: "Privacy",
			url: "/privacy",
			icon: IconHelp,
		},
		{
			title: "Terms",
			url: "/terms",
			icon: IconFileWord,
		},
		{
			title: "Contact",
			url: "/contact",
			icon: IconMail,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = useSession();
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a href="/">
								<IconInnerShadowTop className="!size-5" />
								<span className="font-semibold text-base">Kadai</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser
					user={{
						name: session?.user?.name ?? "",
						email: session?.user?.email ?? "",
						avatar: session?.user?.image ?? "",
					}}
				/>
			</SidebarFooter>
		</Sidebar>
	);
}
