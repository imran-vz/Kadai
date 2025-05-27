"use client";

import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";

import { SignOutButton } from "~/components/auth/signout-button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuGroup,
	DropdownMenuLabel,
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
							height={40}
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
					<DropdownMenuItem>
						<Link href="/items">Items</Link>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Link href="/orders">Orders</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<SignOutButton />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
