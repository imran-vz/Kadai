import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcrypt";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import z4 from "zod/v4";

import { env } from "~/env";
import { db } from "~/server/db";
import {
	accounts,
	sessions,
	users,
	verificationTokens,
} from "~/server/db/schema";
import { getUserByEmail } from "../db/modules/users";

// /**
//  * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
//  * object and keep type safety.
//  *
//  * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
//  */
// declare module "next-auth" {
// 	interface Session extends DefaultSession {
// 		user: {
// 			id: string;
// 			// ...other properties
// 			// role: UserRole;
// 		} & DefaultSession["user"];
// 	}

// 	// interface User {
// 	//   // ...other properties
// 	//   // role: UserRole;
// 	// }
// }

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
	pages: {
		signIn: "/login",
		signOut: "/logout",
	},
	providers: [
		GoogleProvider,
		Credentials({
			credentials: {
				email: { label: "Email", type: "email" },
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
	secret: env.AUTH_SECRET,
	session: {
		strategy: "jwt",
	},
	callbacks: {
		jwt: async ({ token, user }) => {
			if (user) {
				token.id = user.id;
				token.email = user.email;
			}

			return token;
		},
		session({ session, token, user }) {
			if (token && session.user) {
				session.user.id = token.id as string;
			}

			if (user && session.user) {
				session.user.id = user.id;
			}

			return session;
		},
	},
} satisfies NextAuthConfig;
