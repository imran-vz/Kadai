"use client";

import type { Session } from "next-auth";
import Image from "next/image";

import { SignOutButton } from "~/components/auth/signout-button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function UserDropDown({ session }: { session: Session }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
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
				<DropdownMenuItem>
					<SignOutButton />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
