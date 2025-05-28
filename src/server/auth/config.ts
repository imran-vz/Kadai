import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcrypt";
import type { DefaultSession, NextAuthConfig } from "next-auth";
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
			companyName: string;
			companyAddress: string;
			companyLogo: string;
		} & DefaultSession["user"];
	}

	interface User {
		id?: string;
		name?: string | null;
		email?: string | null;
		image?: string | null;
		companyName?: string | null;
		companyAddress?: string | null;
		companyLogo?: string | null;
	}
}

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

				const userData = {
					email: user.email,
					name: user.name,
					id: user.id,
					image: user.image,
					companyName: user.companyName,
					companyAddress: user.companyAddress,
					companyLogo: user.companyLogo,
				};

				return userData;
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
	session: { strategy: "jwt", maxAge: env.AUTH_SESSION_MAX_AGE },
	jwt: { maxAge: env.AUTH_JWT_MAX_AGE },
	callbacks: {
		jwt: async ({ token, user, trigger, session }) => {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.companyName = user.companyName;
				token.companyAddress = user.companyAddress;
				token.companyLogo = user.companyLogo;
				token.image = user.image;
				token.name = user.name;
			}

			if (trigger === "update" && session.user) {
				token.companyName = session.user.companyName;
				token.companyAddress = session.user.companyAddress;
				token.companyLogo = session.user.companyLogo;
				token.image = session.user.image;
				token.name = session.user.name;
				token.email = session.user.email;
				token.id = session.user.id;
			}

			return token;
		},
		session({ session, token, user }) {
			if (token && session.user) {
				session.user.id = token.id as string;
				session.user.companyName = token.companyName as string;
				session.user.companyAddress = token.companyAddress as string;
				session.user.companyLogo = token.companyLogo as string;
				session.user.image = token.image as string;
				session.user.name = token.name as string;
				session.user.email = token.email as string;
			}

			if (user && session.user) {
				session.user.id = user.id;
			}

			return session;
		},
	},
} satisfies NextAuthConfig;
