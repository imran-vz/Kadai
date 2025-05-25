import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import z4 from "zod/v4";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import {
	accounts,
	sessions,
	users,
	verificationTokens,
} from "~/server/db/schema";
import { getUserByEmail } from "../db/modules/users";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			// ...other properties
			// role: UserRole;
		} & DefaultSession["user"];
	}

	// interface User {
	//   // ...other properties
	//   // role: UserRole;
	// }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
	providers: [
		GoogleProvider,
		/**
		 * ...add more providers here.
		 *
		 * Most other providers require a bit more work than the Discord provider. For example, the
		 * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
		 * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
		 *
		 * @see https://next-auth.js.org/providers/github
		 */
		Credentials({
			credentials: {
				email: { label: "Email" },
				password: { label: "Password", type: "password" },
			},
			async authorize({ email, password }) {
				const parsedCredentials = z4
					.object({ email: z4.email(), password: z4.string().min(6) })
					.safeParse({ email, password });

				if (!parsedCredentials.success) return null;
				const [user, err] = await getUserByEmail(parsedCredentials.data.email);
				if (err) {
					console.log("User not found");
					return null;
				}

				if (!user.password) {
					console.log("User has no password");
					return null;
				}

				const passwordMatch = await bcrypt.compare(
					parsedCredentials.data.password,
					user.password,
				);

				if (!passwordMatch) {
					console.log("Password does not match");
					return null;
				}

				return {
					email: user.email,
					name: user.name,
					id: user.id,
					image: user.image,
				};
			},
		}),
	],
	adapter: DrizzleAdapter(db, {
		usersTable: users,
		accountsTable: accounts,
		sessionsTable: sessions,
		verificationTokensTable: verificationTokens,
	}),
	callbacks: {
		session: ({ session, user }) => ({
			...session,
			user: {
				...session.user,
				id: user.id,
			},
		}),
	},
} satisfies NextAuthConfig;
