"use client";

import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";

import { SignOutButton } from "~/components/auth/signout-button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function UserDropDown({ session }: { session: Session }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="rounded-full">
				<Avatar className="h-10 w-10" key={session.user?.image}>
					{session.user?.image && (
						<Image
							src={session.user?.image || ""}
							loading="eager"
							alt={session.user?.name || ""}
							width={40}
							height={80}
							className="aspect-square h-10 w-10 object-cover"
						/>
					)}
					<AvatarFallback>
						{(
							session.user?.name?.slice(0, 2) ||
							session.user?.email?.slice(0, 2) ||
							"UN"
						).toUpperCase()}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-42">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link href="/items">Items</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href="/orders">Orders</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/settings">Settings</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<SignOutButton />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
